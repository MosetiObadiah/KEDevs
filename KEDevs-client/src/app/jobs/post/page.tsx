'use client';

import React, { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Eye, 
  CheckCircle2, 
  Loader2,
  Plus,
  X,
  Building2,
  Globe,
  Lock,
  Search,
  Users2,
  Info,
  Zap,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { employerService } from '@/services/employerService';
import { JobType, WorkType, ExperienceLevel, JobVisibility } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const jobTypes: JobType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const workTypes: WorkType[] = ['REMOTE', 'ONSITE', 'HYBRID'];
const experienceLevels: ExperienceLevel[] = ['ENTRY', 'MID', 'SENIOR', 'LEAD'];
const visibilityOptions: JobVisibility[] = ['PUBLIC', 'PRIVATE'];

interface FormState {
  title: string;
  summary: string;
  description: string;
  companyName: string;
  locationCity: string;
  locationCountry: string;
  jobType: JobType | null;
  workType: WorkType | null;
  experienceLevel: ExperienceLevel | null;
  minQualification: string;
  minExperienceYears: number | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string;
  applicationDeadline: string | null;
  sourceUrl: string;
  isPeerSourced: boolean;
  salaryNotSpecified: boolean;
  visibility: JobVisibility | null;
  tags: string[];
}

const initialFormState: FormState = {
  title: '',
  summary: '',
  description: '',
  companyName: '',
  locationCity: 'Nairobi',
  locationCountry: 'Kenya',
  jobType: 'FULL_TIME',
  workType: 'REMOTE',
  experienceLevel: 'MID',
  minQualification: 'BACHELORS',
  minExperienceYears: 1,
  salaryRangeMin: null,
  salaryRangeMax: null,
  salaryCurrency: 'KES',
  applicationDeadline: null,
  sourceUrl: '',
  isPeerSourced: false,
  salaryNotSpecified: false,
  visibility: 'PUBLIC',
  tags: [],
};

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: any }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

export default function CreateJobPostPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<any>(null);

  const isEmployer = user?.role === 'EMPLOYER';
  const isDeveloper = user?.role === 'DEVELOPER';

  // Draft saving
  useEffect(() => {
    const savedDraft = localStorage.getItem('jobPostDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        Object.keys(draft).forEach((key) => {
          dispatch({ type: 'UPDATE_FIELD', field: key as keyof FormState, value: draft[key] });
        });
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem('jobPostDraft', JSON.stringify(formState));
    };
    const timeoutId = setTimeout(saveDraft, 1000); 
    return () => clearTimeout(timeoutId);
  }, [formState]);

  const [isUrlVerified, setIsUrlVerified] = useState<boolean | null>(null);
  const [isVerifyingUrl, setIsVerifyingUrl] = useState(false);

  // Reset verification state when URL changes
  useEffect(() => {
    setIsUrlVerified(null);
  }, [formState.sourceUrl]);

  const handleCheckUrl = async () => {
    if (!formState.sourceUrl.trim()) return;
    
    try {
      const parsed = new URL(formState.sourceUrl.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch (_) {
      toast.error("Please enter a valid absolute URL starting with http:// or https://");
      setIsUrlVerified(false);
      return;
    }

    setIsVerifyingUrl(true);
    setIsUrlVerified(null);
    try {
      const response = await jobService.verifyUrl(formState.sourceUrl);
      if (response.success) {
        const isSafe = response.data.isSafe;
        setIsUrlVerified(isSafe);
        if (isSafe) {
          toast.success("URL verified successfully! You can now publish the job.");
        } else {
          toast.error("This URL failed our safety check. Please enter a secure, valid URL.");
        }
      } else {
        throw new Error(response.message || "URL safety check failed.");
      }
    } catch (err: any) {
      console.error("URL check failed", err);
      toast.error(err.message || "Failed to reach Safe Browsing service.");
      setIsUrlVerified(false);
    } finally {
      setIsVerifyingUrl(false);
    }
  };

  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const confirmAbandon = () => {
    dispatch({ type: 'RESET' });
    localStorage.removeItem('jobPostDraft');
    setShowAbandonDialog(false);
    toast.success('Job post discarded');
    router.push('/jobs');
  };

  // Fetch employer profile and auto-fill company name
  useEffect(() => {
    const fetchProfile = async () => {
      if (isEmployer) {
        try {
          const response = await employerService.getMyProfile();
          if (response.success && response.data) {
            setEmployerProfile(response.data);
            dispatch({ type: 'UPDATE_FIELD', field: 'companyName', value: response.data.companyName || '' });
          }
        } catch (err) {
          console.error('Failed to fetch employer profile:', err);
        }
      }
    };
    fetchProfile();
  }, [isEmployer]);

  const steps = [
    ...(isDeveloper ? [{ label: 'Job Nature', key: 'nature' }] : []),
    { label: 'Basic Info', key: 'details' },
    { label: 'Requirements', key: 'requirements' },
    { label: 'Location & Pay', key: 'location' },
    { label: 'Review & Post', key: 'visibility' },
  ];

  const validateStep = (stepIndex: number) => {
    const errors: Record<string, string> = {};
    const key = steps[stepIndex].key;

    if (key === 'details') {
      if (!formState.title.trim()) errors.title = 'Title is required';
      if (!formState.description.trim()) errors.description = 'Description is required';
      if (isEmployer && !formState.companyName.trim()) errors.companyName = 'Company name is required';
      if (formState.tags.length === 0) errors.tags = 'At least one tag is required';
    } else if (key === 'requirements') {
      if (!formState.experienceLevel) errors.experienceLevel = 'Experience level is required';
    } else if (key === 'location') {
      if (!formState.jobType) errors.jobType = 'Job type is required';
      if (!formState.workType) errors.workType = 'Work type is required';
      if (formState.salaryRangeMin !== null && formState.salaryRangeMax !== null && formState.salaryRangeMax < formState.salaryRangeMin) {
        errors.salaryRangeMax = 'Maximum salary cannot be smaller than minimum salary';
      }
    } else if (key === 'visibility') {
      if (formState.isPeerSourced && !formState.sourceUrl.trim()) {
        errors.sourceUrl = 'External source URL is required for peer listings';
      } else if (formState.isPeerSourced && isUrlVerified !== true) {
        errors.sourceUrl = 'You must verify the URL before submitting';
      }
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      if (errors.salaryRangeMax) {
        toast.error(errors.salaryRangeMax);
      } else {
        toast.error('Please complete all required fields in this step');
      }
      return;
    }
    setCompleted((prev) => new Set(prev).add(activeStep));
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      if (errors.salaryRangeMax) {
        toast.error(errors.salaryRangeMax);
      } else {
        toast.error('Please complete all required fields');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formState,
        applicationDeadline: formState.applicationDeadline ? new Date(formState.applicationDeadline).toISOString().split('T')[0] : null,
      };
      const response = await jobService.postJob(payload);
      if (response.success) {
        toast.success('Job post created successfully!');
        localStorage.removeItem('jobPostDraft');
        setTimeout(() => {
          router.push(isDeveloper ? '/jobs' : `/jobs/${response.data.id}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Unable to create job post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 py-12 sm:py-16">
        <Card className="max-w-md w-full rounded-2xl border border-border/50 shadow-md text-center p-8 sm:p-12 bg-white">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 tracking-tight">Sign in to post a job</h2>
          <p className="text-sm text-slate-500 font-medium mb-6 font-sans">
            You need to be logged in as an Employer or Developer to submit job opportunities.
          </p>
          <Button size="default" className="rounded-xl font-semibold h-10 px-8 bg-primary text-white" asChild>
            <Link href="/login">Login Now</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepKey = steps[activeStep].key;

  return (
    <div className="min-h-[calc(100vh-112px)] lg:h-[calc(100vh-112px)] lg:overflow-hidden bg-muted/30 flex flex-col items-center justify-center p-4 py-4">
      {/* Abandon Confirmation Dialog */}
      <Dialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
         <DialogContent className="max-w-sm rounded-2xl p-6 border border-border/50 shadow-md bg-white">
            <DialogHeader className="space-y-3 text-center">
               <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-6 w-6" />
               </div>
               <DialogTitle className="text-lg font-black text-slate-900">Abandon Job Post?</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium text-xs leading-relaxed font-sans">
                  This will clear all entered information and remove the draft completely. You won't be able to recover this.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-5 grid grid-cols-2 gap-3 border-none bg-transparent p-0">
               <Button 
                 type="button"
                 variant="outline" 
                 className="rounded-xl h-11 text-base font-semibold border-border/50"
                 onClick={() => setShowAbandonDialog(false)}
               >
                  Keep Editing
               </Button>
               <Button 
                 type="button"
                 className="rounded-xl h-11 text-base font-semibold bg-rose-600 hover:bg-rose-700 text-white border-none shadow-sm"
                 onClick={confirmAbandon}
               >
                  Discard Draft
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
      <div className="w-full max-w-xl mx-auto px-4 flex flex-col lg:max-h-full animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="text-center mb-4">
          <Badge variant="outline" className="rounded-xl font-black tracking-widest text-xs uppercase bg-primary/10 text-primary border-none px-3 py-1 mb-2">
            Recruitment Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Post a Job</h1>
          <p className="text-base text-slate-500 font-medium font-sans mt-1">
             Create a new job post and connect with qualified developers in Kenya.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-4 relative px-4 max-w-xs sm:max-w-md mx-auto w-full">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 rounded-full" 
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, index) => (
            <div 
              key={step.key} 
              className="flex flex-col items-center gap-1.5"
            >
              <div 
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                  index < activeStep ? "bg-primary text-white scale-90" : 
                  index === activeStep ? "bg-white text-primary border-2 border-primary scale-105 font-bold" : "bg-white text-slate-300 border border-slate-100"
                )}
              >
                {index < activeStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="rounded-2xl border border-border/50 shadow-md bg-white overflow-hidden flex flex-col lg:max-h-[calc(100vh-220px)]">
          <CardHeader className="border-b border-border/50 bg-slate-50/50 p-4 sm:p-5 shrink-0">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {currentStepKey === 'nature' && <Search className="h-4.5 w-4.5" />}
                  {currentStepKey === 'details' && <Building2 className="h-4.5 w-4.5" />}
                  {currentStepKey === 'requirements' && <Briefcase className="h-4.5 w-4.5" />}
                  {currentStepKey === 'location' && <MapPin className="h-4.5 w-4.5" />}
                  {currentStepKey === 'visibility' && <Eye className="h-4.5 w-4.5" />}
               </div>
               <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">{steps[activeStep].label}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                     Step {activeStep + 1} of {steps.length}
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {currentStepKey === 'nature' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-black text-slate-900 text-center sm:text-left">What type of job are you posting?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card 
                    className={cn(
                      "rounded-xl border border-border/50 transition-all cursor-pointer group hover:bg-slate-50/30 p-4 text-center space-y-3",
                      formState.isPeerSourced ? "border-primary bg-primary/5" : "bg-white"
                    )}
                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: true })}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mx-auto transition-all shadow-sm",
                      formState.isPeerSourced ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">Peer-Sourced</h4>
                      <p className="text-sm text-slate-500 font-medium font-sans mt-0.5">Found an external job you'd like to share?</p>
                    </div>
                  </Card>
                  <Card 
                    className={cn(
                      "rounded-xl border border-border/50 transition-all cursor-pointer group hover:bg-slate-50/30 p-4 text-center space-y-3",
                      !formState.isPeerSourced ? "border-primary bg-primary/5" : "bg-white"
                    )}
                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: false })}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mx-auto transition-all shadow-sm",
                      !formState.isPeerSourced ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">Personal</h4>
                      <p className="text-sm text-slate-500 font-medium font-sans mt-0.5">Posting for your own direct network or referral?</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {currentStepKey === 'details' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Job Title</Label>
                  <Input 
                    className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formState.title}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Short Summary</Label>
                  <Input 
                    className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" 
                    placeholder="A punchy one-liner about the role"
                    value={formState.summary}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'summary', value: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Full Job Description</Label>
                  <Textarea 
                    className="min-h-[120px] rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" 
                    placeholder="Add responsibilities, technology stack, and what makes this role special..."
                    value={formState.description}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value })}
                  />
                </div>
                {!isDeveloper && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Company Name</Label>
                    <Input 
                      className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" 
                      value={formState.companyName}
                      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'companyName', value: e.target.value })}
                      disabled={isEmployer}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Tags (Keywords)</Label>
                  <div className="space-y-3">
                     <div className="flex gap-2">
                        <Input 
                           id="tag-input"
                           className="h-11 rounded-xl border-border/50 text-base font-medium flex-1" 
                           placeholder="Press Enter to add tags (e.g. React, Remote)" 
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                 const val = (e.target as HTMLInputElement).value.trim();
                                 if (val && !formState.tags.includes(val)) {
                                    dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: [...formState.tags, val] });
                                    (e.target as HTMLInputElement).value = '';
                                 }
                              }
                           }}
                        />
                        <Button 
                           className="h-11 w-11 rounded-xl shrink-0 bg-primary text-white"
                           onClick={() => {
                              const el = document.getElementById('tag-input') as HTMLInputElement;
                              const val = el.value.trim();
                              if (val && !formState.tags.includes(val)) {
                                 dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: [...formState.tags, val] });
                                 el.value = '';
                              }
                           }}
                        >
                           <Plus className="h-4 w-4" />
                        </Button>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {formState.tags.map(tag => (
                           <Badge key={tag} className="h-8 px-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border-none flex items-center gap-1 group transition-all text-sm">
                              {tag}
                              <button
                                type="button"
                                className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: formState.tags.filter(t => t !== tag) });
                                }}
                                aria-label={`Remove tag ${tag}`}
                              >
                                <X className="h-3.5 w-3.5 text-slate-500 hover:text-rose-500" />
                              </button>
                           </Badge>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepKey === 'requirements' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700">Experience Level</Label>
                      <Select value={formState.experienceLevel || ''} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'experienceLevel', value: v })}>
                         <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                            <SelectValue placeholder="Select level" />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl">
                            {experienceLevels.map(l => <SelectItem key={l} value={l} className="font-medium text-sm">{l.replace('_', ' ')}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700">Minimum Qualification</Label>
                      <Select value={formState.minQualification || ''} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'minQualification', value: v })}>
                         <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                            <SelectValue placeholder="Select qualification" />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl">
                            <SelectItem value="BACHELORS" className="font-medium text-sm">Bachelor's Degree</SelectItem>
                            <SelectItem value="DIPLOMA" className="font-medium text-sm">Diploma</SelectItem>
                            <SelectItem value="MASTERS" className="font-medium text-sm">Master's Degree</SelectItem>
                            <SelectItem value="SELF_TAUGHT" className="font-medium text-sm">Self-Taught / Bootcamp</SelectItem>
                            <SelectItem value="EQUIVALENT_EXPERIENCE" className="font-medium text-sm">Equivalent Experience</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Min Experience Years</Label>
                  <Input 
                    type="number" 
                    className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" 
                    value={formState.minExperienceYears || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'minExperienceYears', value: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
            )}

            {currentStepKey === 'location' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Job Type</Label>
                    <Select value={formState.jobType || ''} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'jobType', value: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {jobTypes.map(t => (
                          <SelectItem key={t} value={t} className="font-medium text-sm">
                            {t.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-sm font-semibold text-slate-700">Work Type</Label>
                     <div className="grid grid-cols-3 gap-2">
                        {workTypes.map(type => (
                           <Button 
                              key={type}
                              type="button"
                              variant="outline"
                              className={cn(
                                 "h-11 rounded-xl border-border/50 font-bold text-sm tracking-tight px-1.5",
                                 formState.workType === type ? "border-primary bg-primary/5 text-primary" : "text-slate-500"
                              )}
                              onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'workType', value: type })}
                           >
                              {type}
                           </Button>
                        ))}
                     </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-sm font-semibold text-slate-700">City</Label>
                     <Input className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" value={formState.locationCity} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCity', value: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-sm font-semibold text-slate-700">Country</Label>
                     <Input className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20" value={formState.locationCountry} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCountry', value: e.target.value })} />
                  </div>
                </div>
                
                <Separator className="bg-slate-100" />
                
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-700">Salary Range & Currency</Label>
                      {formState.isPeerSourced && (
                        <div className="flex items-center space-x-2">
                           <Switch 
                              id="salary-not-specified"
                              checked={formState.salaryNotSpecified}
                              onCheckedChange={(checked) => {
                                 dispatch({ type: 'UPDATE_FIELD', field: 'salaryNotSpecified', value: checked });
                                 if (checked) {
                                    dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMin', value: null });
                                    dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMax', value: null });
                                 }
                              }}
                           />
                           <Label htmlFor="salary-not-specified" className="text-sm font-medium text-slate-600 cursor-pointer">
                              Salary not specified
                           </Label>
                        </div>
                      )}
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input type="number" disabled={formState.salaryNotSpecified} className="pl-8 h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20 disabled:opacity-50 disabled:bg-slate-50" placeholder="Min" value={formState.salaryRangeMin || ''} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMin', value: e.target.value ? Number(e.target.value) : null })} />
                      </div>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input type="number" disabled={formState.salaryNotSpecified} className="pl-8 h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20 disabled:opacity-50 disabled:bg-slate-50" placeholder="Max" value={formState.salaryRangeMax || ''} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMax', value: e.target.value ? Number(e.target.value) : null })} />
                      </div>
                      <Input className="h-11 rounded-xl border-border/50 font-bold uppercase tracking-widest text-center text-sm focus-visible:ring-primary/20" value={formState.salaryCurrency} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryCurrency', value: e.target.value })} />
                   </div>
                </div>
                
                <div className="space-y-1.5">
                   <Label className="text-sm font-semibold text-slate-700">Application Deadline</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                         <Button variant="outline" className={cn("w-full h-11 rounded-xl border-border/50 font-medium text-base justify-start px-3.5", !formState.applicationDeadline && "text-slate-400")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                            {formState.applicationDeadline ? format(new Date(formState.applicationDeadline), "PPP") : "Pick a date"}
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border border-border/50 shadow-md bg-white" align="start">
                         <Calendar
                            mode="single"
                            selected={formState.applicationDeadline ? new Date(formState.applicationDeadline) : undefined}
                            onSelect={(date) => dispatch({ type: 'UPDATE_FIELD', field: 'applicationDeadline', value: date?.toISOString() })}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="rounded-2xl"
                         />
                      </PopoverContent>
                   </Popover>
                </div>
              </div>
            )}

            {currentStepKey === 'visibility' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-700">Final Review</h3>
                  <div className="p-5 rounded-xl bg-slate-50/50 border border-slate-100 space-y-4 shadow-sm">
                     <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                           <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{formState.title || 'Job Title'}</h4>
                           <p className="text-primary font-bold text-sm uppercase">{formState.companyName || 'Company'}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none rounded-xl uppercase font-black text-xs tracking-wider py-0.5 px-2">
                           {formState.jobType?.replace('_', ' ')}
                        </Badge>
                     </div>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium font-sans">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {formState.locationCity}, {formState.locationCountry}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-primary" /> {formState.experienceLevel?.replace('_', ' ')}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-primary" /> {formState.salaryNotSpecified ? 'Salary not specified' : (formState.salaryRangeMin && formState.salaryRangeMax ? `${formState.salaryRangeMin} - ${formState.salaryRangeMax} ${formState.salaryCurrency}` : 'Confidential')}</span>
                     </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                   <Label className="text-sm font-semibold text-slate-700">Post Settings</Label>
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                         <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Who can see this?</Label>
                         <Select value={formState.visibility || 'PUBLIC'} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'visibility', value: v })}>
                            <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                               <SelectItem value="PUBLIC" className="font-medium text-sm">🌎 Public (Everyone)</SelectItem>
                               <SelectItem value="PRIVATE" className="font-medium text-sm">🔒 Private (Link only)</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      
                      {formState.isPeerSourced && (
                         <div className="space-y-2 border-t border-slate-100 pt-4">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                               External Source URL <span className="text-danger-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                               <Input 
                                 className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20 flex-1" 
                                 placeholder="https://..." 
                                 value={formState.sourceUrl} 
                                 onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'sourceUrl', value: e.target.value })} 
                               />
                               <Button
                                 type="button"
                                 variant="secondary"
                                 className={cn(
                                   "h-11 px-4 rounded-xl font-semibold border text-sm transition-all shrink-0",
                                   isUrlVerified === true ? "border-emerald-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-50" : 
                                   isUrlVerified === false ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" : 
                                   "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                                 )}
                                 disabled={isVerifyingUrl || !formState.sourceUrl.trim()}
                                 onClick={handleCheckUrl}
                               >
                                 {isVerifyingUrl ? (
                                   <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                 ) : isUrlVerified === true ? (
                                   <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-cyan-600" />
                                 ) : isUrlVerified === false ? (
                                   <X className="h-3.5 w-3.5 mr-1 text-rose-600" />
                                 ) : (
                                   <Zap className="h-3.5 w-3.5 mr-1 text-primary" />
                                 )}
                                 {isVerifyingUrl ? 'Checking...' : isUrlVerified === true ? 'Verified Safe' : isUrlVerified === false ? 'Unsafe URL' : 'Check URL'}
                               </Button>
                            </div>
                            {isUrlVerified === true && (
                              <p className="text-xs font-black text-cyan-600 uppercase tracking-wider mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 font-sans">
                                 <CheckCircle2 className="h-3.5 w-3.5" /> Verified Safe by Google Safe Browsing
                              </p>
                            )}
                            {isUrlVerified === false && (
                              <p className="text-xs font-black text-rose-600 uppercase tracking-wider mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 font-sans">
                                 <X className="h-3.5 w-3.5" /> URL reported as unsafe or invalid!
                              </p>
                            )}
                            <p className="text-xs text-slate-500 font-sans mt-0.5">Must be a direct, verified link to the original job post.</p>
                         </div>
                      )}
                   </div>
                </div>
                
                {formState.isPeerSourced && (
                   <div className="p-4 rounded-xl bg-azure-50/50 border border-azure-100 flex items-start gap-3">
                      <Info className="h-4.5 w-4.5 text-azure-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-sm font-black text-azure-900 mb-1">Peer-Sourcing Policy</p>
                         <div className="text-xs font-medium text-azure-700 leading-relaxed space-y-1.5 font-sans">
                            <p>This job is being shared from an external source. By posting:</p>
                            <ul className="list-disc pl-4 space-y-1">
                               <li>You confirm you have the right to share this opportunity.</li>
                               <li>The link you provide will be publicly visible so developers can apply directly.</li>
                               <li>Our moderators may review external links to ensure they lead to legitimate job postings.</li>
                            </ul>
                         </div>
                      </div>
                   </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-border/50 p-4 sm:p-5 flex justify-between items-center gap-3 sm:gap-4 shrink-0">
            <Button 
              variant="ghost" 
              size="default" 
              className="rounded-xl font-semibold h-11 px-4 sm:px-5 text-base"
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="text-slate-500 hover:text-rose-600 font-semibold h-11 px-4 sm:px-5 rounded-xl hover:bg-rose-50/50 transition-all text-base shrink-0"
              onClick={() => setShowAbandonDialog(true)}
              disabled={isSubmitting}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Abandon
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button 
                size="default" 
                className="rounded-xl font-semibold h-11 px-5 sm:px-6 shadow-sm bg-primary text-white text-base"
                onClick={handleSubmit}
                disabled={isSubmitting || (formState.isPeerSourced && isUrlVerified !== true)}
              >
                {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                {isSubmitting ? 'Publishing...' : 'Publish Job'}
              </Button>
            ) : (
              <Button 
                size="default" 
                className="rounded-xl font-semibold h-11 px-5 sm:px-6 shadow-sm bg-primary text-white text-base"
                onClick={handleNext}
              >
                Continue <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
