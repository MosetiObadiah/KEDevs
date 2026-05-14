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
  Zap
} from 'lucide-react';
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
      if (!formState.workType) errors.workType = 'Work type is required';
    } else if (key === 'visibility') {
      if (formState.isPeerSourced && !formState.sourceUrl.trim()) {
        errors.sourceUrl = 'External source URL is required for peer listings';
      }
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      toast.error('Please complete all required fields in this step');
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
      toast.error('Please complete all required fields');
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
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto rounded-[2rem] border-none shadow-2xl text-center p-12">
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black mb-4">Sign in to post a job</h2>
          <p className="text-slate-500 font-medium mb-8">
            You need to be logged in as an Employer or Developer to submit job opportunities.
          </p>
          <Button size="lg" className="rounded-2xl font-black h-14 px-10" asChild>
            <Link href="/login">Login Now</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepKey = steps[activeStep].key;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col justify-between items-start gap-2 mb-10">
            <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/10 text-primary border-none px-3 py-1 mb-2">
              Recruitment Hub
            </Badge>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post a Job</h1>
            <p className="text-sm font-semibold text-slate-500">
               Create a new job post and connect with qualified developers in Kenya.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex justify-between items-center mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 rounded-full" 
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step, index) => (
              <div 
                key={step.key} 
                className="flex flex-col items-center gap-3"
              >
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 font-black text-sm",
                    index < activeStep ? "bg-primary border-primary text-white" : 
                    index === activeStep ? "bg-white border-primary text-primary" : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  {index < activeStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span className={cn(
                  "hidden md:block text-[10px] font-black uppercase tracking-widest",
                  index === activeStep ? "text-primary" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <Card className="rounded-[2.5rem] border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    {currentStepKey === 'nature' && <Search className="h-6 w-6 text-white" />}
                    {currentStepKey === 'details' && <Building2 className="h-6 w-6 text-white" />}
                    {currentStepKey === 'requirements' && <Briefcase className="h-6 w-6 text-white" />}
                    {currentStepKey === 'location' && <MapPin className="h-6 w-6 text-white" />}
                    {currentStepKey === 'visibility' && <Eye className="h-6 w-6 text-white" />}
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{steps[activeStep].label}</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                       Step {activeStep + 1} of {steps.length}
                    </CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12 space-y-8">
              {currentStepKey === 'nature' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900">What type of job are you posting?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card 
                      className={cn(
                        "rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-[1.02]",
                        formState.isPeerSourced ? "border-primary bg-primary/5" : "border-slate-100"
                      )}
                      onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: true })}
                    >
                      <CardContent className="p-8 text-center space-y-4">
                        <div className={cn(
                          "h-16 w-16 rounded-[1.5rem] flex items-center justify-center mx-auto transition-all",
                          formState.isPeerSourced ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <Globe className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black">Peer-Sourced</h4>
                          <p className="text-sm text-slate-500 font-medium">Found an external job you'd like to share?</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card 
                      className={cn(
                        "rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-[1.02]",
                        !formState.isPeerSourced ? "border-primary bg-primary/5" : "border-slate-100"
                      )}
                      onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: false })}
                    >
                      <CardContent className="p-8 text-center space-y-4">
                        <div className={cn(
                          "h-16 w-16 rounded-[1.5rem] flex items-center justify-center mx-auto transition-all",
                          !formState.isPeerSourced ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <Building2 className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black">Personal / Company</h4>
                          <p className="text-sm text-slate-500 font-medium">Posting for your own company or direct network?</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {currentStepKey === 'details' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Job Title</Label>
                    <Input 
                      className="h-14 rounded-2xl border-slate-200 text-lg font-black focus-visible:ring-primary/20" 
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formState.title}
                      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Short Summary</Label>
                    <Input 
                      className="h-14 rounded-2xl border-slate-200 font-semibold focus-visible:ring-primary/20" 
                      placeholder="A punchy one-liner about the role"
                      value={formState.summary}
                      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'summary', value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Full Job Description</Label>
                    <Textarea 
                      className="min-h-[250px] rounded-2xl border-slate-200 font-medium text-base focus-visible:ring-primary/20" 
                      placeholder="Add responsibilities, technology stack, and what makes this role special..."
                      value={formState.description}
                      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value })}
                    />
                  </div>
                  {!isDeveloper && (
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Company Name</Label>
                      <Input 
                        className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20" 
                        value={formState.companyName}
                        onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'companyName', value: e.target.value })}
                        disabled={isEmployer}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Tags (Keywords)</Label>
                    <div className="space-y-4">
                       <div className="flex gap-2">
                          <Input 
                             id="tag-input"
                             className="h-12 rounded-xl border-slate-200" 
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
                             className="h-12 w-12 rounded-xl"
                             onClick={() => {
                                const el = document.getElementById('tag-input') as HTMLInputElement;
                                const val = el.value.trim();
                                if (val && !formState.tags.includes(val)) {
                                   dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: [...formState.tags, val] });
                                   el.value = '';
                                }
                             }}
                          >
                             <Plus className="h-5 w-5" />
                          </Button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {formState.tags.map(tag => (
                             <Badge key={tag} className="h-8 px-3 rounded-lg bg-slate-100 text-slate-900 font-bold flex items-center gap-1 group transition-all">
                                {tag}
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: formState.tags.filter(t => t !== tag) })} />
                             </Badge>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStepKey === 'requirements' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Experience Level</Label>
                        <Select value={formState.experienceLevel || ''} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'experienceLevel', value: v })}>
                           <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                              <SelectValue placeholder="Select level" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              {experienceLevels.map(l => <SelectItem key={l} value={l} className="font-bold">{l.replace('_', ' ')}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Minimum Qualification</Label>
                        <Select value={formState.minQualification || ''} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'minQualification', value: v })}>
                           <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                              <SelectValue placeholder="Select qualification" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              <SelectItem value="BACHELORS" className="font-bold">Bachelor's Degree</SelectItem>
                              <SelectItem value="DIPLOMA" className="font-bold">Diploma</SelectItem>
                              <SelectItem value="MASTERS" className="font-bold">Master's Degree</SelectItem>
                              <SelectItem value="SELF_TAUGHT" className="font-bold">Self-Taught / Bootcamp</SelectItem>
                              <SelectItem value="EQUIVALENT_EXPERIENCE" className="font-bold">Equivalent Experience</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Min Experience Years</Label>
                    <Input 
                      type="number" 
                      className="h-14 rounded-2xl border-slate-200 font-bold" 
                      value={formState.minExperienceYears || ''}
                      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'minExperienceYears', value: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                </div>
              )}

              {currentStepKey === 'location' && (
                <div className="space-y-8">
                  <div className="space-y-2">
                     <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Work Type</Label>
                     <div className="grid grid-cols-3 gap-4">
                        {workTypes.map(type => (
                           <Button 
                              key={type}
                              type="button"
                              variant="outline"
                              className={cn(
                                 "h-14 rounded-2xl border-slate-100 font-black tracking-tight",
                                 formState.workType === type ? "border-primary bg-primary/5 text-primary" : "text-slate-500"
                              )}
                              onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'workType', value: type })}
                           >
                              {type}
                           </Button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-black text-xs uppercase tracking-widest text-slate-400">City</Label>
                       <Input className="h-14 rounded-2xl border-slate-200 font-bold" value={formState.locationCity} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCity', value: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Country</Label>
                       <Input className="h-14 rounded-2xl border-slate-200 font-bold" value={formState.locationCountry} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCountry', value: e.target.value })} />
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-4">
                     <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Salary Range & Deadline</Label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                           <Input type="number" className="pl-10 h-14 rounded-2xl border-slate-200 font-bold" placeholder="Min" value={formState.salaryRangeMin || ''} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMin', value: e.target.value ? Number(e.target.value) : null })} />
                        </div>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                           <Input type="number" className="pl-10 h-14 rounded-2xl border-slate-200 font-bold" placeholder="Max" value={formState.salaryRangeMax || ''} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMax', value: e.target.value ? Number(e.target.value) : null })} />
                        </div>
                        <Input className="h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest" value={formState.salaryCurrency} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryCurrency', value: e.target.value })} />
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Application Deadline</Label>
                        <Popover>
                           <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full h-14 rounded-2xl border-slate-200 font-bold justify-start px-6", !formState.applicationDeadline && "text-slate-400")}>
                                 <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                                 {formState.applicationDeadline ? format(new Date(formState.applicationDeadline), "PPP") : "Pick a date"}
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
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
                </div>
              )}

              {currentStepKey === 'visibility' && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900">Final Review</h3>
                    <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-2xl font-black text-slate-900">{formState.title || 'Job Title'}</h4>
                             <p className="text-primary font-black">{formState.companyName || 'Company'}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg uppercase font-black text-[10px] tracking-widest">
                             {formState.jobType?.replace('_', ' ')}
                          </Badge>
                       </div>
                       <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-bold">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {formState.locationCity}, {formState.locationCountry}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {formState.experienceLevel?.replace('_', ' ')}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {formState.salaryRangeMin && formState.salaryRangeMax ? `${formState.salaryRangeMin} - ${formState.salaryRangeMax} ${formState.salaryCurrency}` : 'Confidential'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Post Settings</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="font-bold text-xs">Who can see this?</Label>
                           <Select value={formState.visibility || 'PUBLIC'} onValueChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'visibility', value: v })}>
                              <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                 <SelectItem value="PUBLIC" className="font-bold italic text-emerald-600">🌎 Public (Everyone)</SelectItem>
                                 <SelectItem value="PRIVATE" className="font-bold italic text-blue-600">🔒 Private (Link only)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        {formState.isPeerSourced && (
                           <div className="space-y-2">
                              <Label className="font-bold text-xs flex items-center gap-1">
                                 External Source URL <span className="text-red-500">*</span>
                              </Label>
                              <Input className="h-14 rounded-2xl border-slate-200 font-medium focus-visible:ring-primary/20" placeholder="https://..." value={formState.sourceUrl} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'sourceUrl', value: e.target.value })} />
                              <p className="text-[10px] font-medium text-slate-400">Must be a direct link to the original job post.</p>
                           </div>
                        )}
                     </div>
                  </div>
                  {formState.isPeerSourced && (
                    <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
                       <Info className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                       <div>
                          <p className="text-sm font-black text-blue-900 mb-3">Peer-Sourcing Policy</p>
                          <div className="text-xs font-medium text-blue-700 leading-relaxed space-y-3">
                             <p>This job is being shared from an external source. By posting:</p>
                             <ul className="list-disc pl-4 space-y-2">
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

            <CardFooter className="bg-slate-50 p-8 flex justify-between gap-4">
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-2xl font-black h-14 px-8"
                onClick={handleBack}
                disabled={activeStep === 0 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button 
                  size="lg" 
                  className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {isSubmitting ? 'Publishing...' : 'Publish Job Post'}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20"
                  onClick={handleNext}
                >
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
