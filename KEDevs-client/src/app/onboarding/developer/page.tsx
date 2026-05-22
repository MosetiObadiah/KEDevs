'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Code2,
  Briefcase,
  MapPin,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Plus,
  X,
  Check,
  ChevronsUpDown,
  Search as SearchIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { KENYA_COUNTIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  { label: 'Identity', icon: User },
  { label: 'Arsenal', icon: Code2 },
  { label: 'Experience', icon: Briefcase }
];

const skillsOptions = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Java', 'Spring Boot',
  'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'Tailwind CSS', 'MUI', 'Figma',
];

const experienceLevels = [
  { value: 'ZERO_TO_ONE', label: 'Zero to one years of experience' },
  { value: 'ONE_TO_THREE', label: 'One to three years of experience' },
  { value: 'THREE_TO_FIVE', label: 'Three to five years of experience' },
  { value: 'FIVE_TO_TEN', label: 'Five to ten years of experience' },
  { value: 'TEN_PLUS', label: 'Ten plus years of experience' },
];

// List of common developer roles in Kenya
const COMMON_ROLES = [
  "Frontend Developer",
  "Android Developer",
  "IOS Developer",
  "Backend Developer",
  "Fullstack Engineer",
  "Mobile App Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "Cyber Security Analyst",
  "Cloud Architect",
  "Embedded Systems Engineer",
  "Game Developer",
  "AI/ML Engineer",
  "Database Administrator",
  "Systems Administrator",
  "Technical Lead",
  "Site Reliability Engineer (SRE)",
  "Blockchain Developer",
  "Network Engineer",
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "MEVN Stack Developer",
  "LAMP Stack Developer",
  "LEMP Stack Developer",

].sort();

export default function DeveloperOnboarding() {
  const router = useRouter();
  const { isLoggedIn, isOnboarded, completeOnboarding, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('developer_onboarding');
      if (saved) return JSON.parse(saved);
    }
    return {
      firstName: user?.fullName?.split(' ')[0] || '',
      lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
      role: '',
      city: 'Nairobi',
      bio: '',
      skills: [] as string[],
      availability: 'OPEN_TO_OFFERS',
      preferredWorkType: 'REMOTE',
      yearsOfExperience: 'ZERO_TO_ONE',
      summary: '',
      publicEmail: user?.email || '',
      publicPhone: '',
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('developer_onboarding', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (isOnboarded) {
      router.push('/developers');
    }
  }, [isLoggedIn, isOnboarded, router]);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      if (formData.publicPhone && !formData.publicPhone.match(/^0[17]\d{8}$/)) {
        toast.error('Invalid public phone number format (Format: 07xxxxxxxx)');
        return;
      }
      if (!agreedToTerms) {
        toast.error('Please agree to the Terms of Service');
        return;
      }
      setLoading(true);
      try {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          currentLastRole: formData.role,
          locationCity: formData.city.split(',')[0].trim(),
          locationCountry: 'Kenya',
          availabilityStatus: formData.availability,
          preferredWorkType: formData.preferredWorkType,
          yearsOfExperience: formData.yearsOfExperience,
          visibility: 'PUBLIC',
          skills: formData.skills,
          portfolioUrl: '',
          githubUrl: '',
          linkedinUrl: '',
          publicEmail: formData.publicEmail,
          publicPhone: formData.publicPhone
        };
        const response = await developerService.createProfile(payload);
        if (response.success) {
          localStorage.removeItem('developer_onboarding');
          completeOnboarding();
          router.push('/developers');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to create profile');
      } finally {
        setLoading(false);
      }
    } else {
      if (activeStep === 1) {
        if (formData.skills.length < 3) {
          toast.error('Please select at least 3 skills to continue');
          return;
        }
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skill) });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-[calc(100vh-112px)] lg:h-[calc(100vh-112px)] lg:overflow-hidden bg-muted/30 flex flex-col items-center justify-center p-4 py-4">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-500 flex flex-col lg:max-h-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Developer Onboarding</h1>
          <p className="text-base text-slate-500 font-medium mt-1 font-sans">Let&apos;s build your professional presence</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-4 relative px-4 max-w-xs sm:max-w-sm mx-auto w-full">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 rounded-full"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                    index < activeStep ? "bg-primary text-white scale-90" :
                      index === activeStep ? "bg-white text-primary border-2 border-primary scale-105 font-bold" : "bg-white text-slate-300 border border-slate-100"
                  )}
                >
                  {index < activeStep ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>

        <Card className="rounded-2xl border border-border/50 shadow-md bg-white overflow-hidden flex flex-col lg:max-h-[calc(100vh-220px)]">
          <CardHeader className="border-b border-border/50 bg-slate-50/50 p-4 sm:p-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {activeStep === 0 && <User className="h-4.5 w-4.5" />}
                {activeStep === 1 && <Code2 className="h-4.5 w-4.5" />}
                {activeStep === 2 && <Briefcase className="h-4.5 w-4.5" />}
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
            {activeStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Current Role</Label>
                  <Popover open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isRoleOpen}
                        className="w-full h-11 rounded-xl border-border/50 font-medium justify-between px-3 hover:bg-white text-base"
                      >
                        {formData.role || "Select your current role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border border-border/50 shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative">
                          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                          <Input
                            placeholder="Search roles..."
                            className="pl-8 h-9 rounded-lg border-border/50 bg-white shadow-sm font-medium text-sm"
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="p-1">
                          {COMMON_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                            <div className="py-4 text-center text-sm text-slate-500 font-medium italic">
                              No roles found...
                            </div>
                          )}
                          {COMMON_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).map((r) => (
                            <button
                              key={r}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all",
                                formData.role === r ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"
                              )}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, role: r });
                                setIsRoleOpen(false);
                                setRoleSearch("");
                              }}
                            >
                              <Check className={cn("h-3 w-3", formData.role === r ? "opacity-100" : "opacity-0")} />
                              {r}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Location (Kenya)</Label>
                  <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[200px]">
                      {KENYA_COUNTIES.map(c => <SelectItem key={c} value={c} className="font-medium text-sm">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Public Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. hello@example.com"
                      value={formData.publicEmail}
                      onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                      className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Public Phone (Optional)</Label>
                    <Input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={formData.publicPhone}
                      onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                      className="h-11 rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Your Current Skills (At least 3 required)</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.skills.map((skill: string) => (
                      <Badge key={skill} className="h-9 px-3 rounded-lg bg-primary text-white font-semibold text-sm flex items-center gap-1.5">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-200 transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </Badge>
                    ))}
                    {formData.skills.length === 0 && <p className="text-slate-500 font-medium italic text-sm py-1">Select skills from below or type to add...</p>}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Type a skill and press enter..."
                      className="h-11 rounded-xl border-border/50 text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            addSkill(val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {skillsOptions.map((skill: string) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border font-medium text-sm transition-all",
                            formData.skills.includes(skill) ? "bg-slate-100 text-slate-400 border-slate-100" : "bg-white text-slate-700 border-border/50 hover:border-primary hover:text-primary"
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Work Availability</Label>
                    <Select value={formData.availability} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="OPEN_TO_OFFERS" className="font-medium text-sm">Open to Offers</SelectItem>
                        <SelectItem value="NOT_AVAILABLE" className="font-medium text-sm">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Preferred Work Type</Label>
                    <Select value={formData.preferredWorkType} onValueChange={(v) => setFormData({ ...formData, preferredWorkType: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="REMOTE" className="font-medium text-sm">Remote</SelectItem>
                        <SelectItem value="HYBRID" className="font-medium text-sm">Hybrid</SelectItem>
                        <SelectItem value="ONSITE" className="font-medium text-sm">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Years of Experience</Label>
                  <Select value={formData.yearsOfExperience} onValueChange={(v) => setFormData({ ...formData, yearsOfExperience: v })}>
                    <SelectTrigger className="h-11 rounded-xl border-border/50 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {experienceLevels.map(l => <SelectItem key={l.value} value={l.value} className="font-medium text-sm">{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-700">Professional Summary</Label>
                    <span className={cn(
                      "text-xs font-semibold tracking-wider uppercase",
                      formData.bio.length >= 300 ? "text-danger-500" : "text-slate-400"
                    )}>
                      {formData.bio.length} / 300
                    </span>
                  </div>
                  <Textarea
                    placeholder="Highlight your best work, achievements, and what you're looking for..."
                    className="min-h-[80px] rounded-xl border-border/50 font-medium text-base focus-visible:ring-primary/20"
                    value={formData.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 300) {
                        setFormData({ ...formData, bio: e.target.value });
                      }
                    }}
                    maxLength={300}
                  />
                </div>

                <div className="flex items-start space-x-2.5 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(v) => setAgreedToTerms(v as boolean)}
                    className="mt-0.5 rounded animate-none"
                  />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium text-slate-700 leading-normal cursor-pointer">
                      I agree to the <Link href="/terms" className="text-primary hover:underline font-semibold font-sans">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-semibold font-sans">Privacy Policy</Link>.
                    </Label>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Required to finalize account</p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-border/50 p-4 sm:p-5 flex justify-between items-center gap-3 sm:gap-4 shrink-0">
            <Button
              variant="ghost"
              size="default"
              className="rounded-xl font-semibold h-11 px-4 sm:px-5 text-base"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                size="default"
                className="rounded-xl font-semibold h-11 px-5 sm:px-6 shadow-sm transition-all active:scale-95 bg-primary text-white text-base"
                onClick={handleNext}
                disabled={loading || !agreedToTerms}
              >
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
                {loading ? 'Submitting...' : 'Submit Profile'}
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
