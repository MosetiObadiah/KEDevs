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
  const [success, setSuccess] = useState(false);
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
    } else if (isOnboarded && !success) {
      router.push('/developers');
    }
  }, [isLoggedIn, isOnboarded, success, router]);

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
          setSuccess(true);
          completeOnboarding(); // called after success state is set to avoid redirect race
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to create profile');
      } finally {
        setLoading(false);
      }
    } else {
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-xl">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Application Received!</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Your profile is under review. Please wait 24 hours for the verification process to complete. You can still browse the platform in the meantime.
            </p>
          </div>
          <Button className="rounded-2xl font-black h-14 w-full shadow-xl shadow-primary/20" asChild>
            <Link href="/developers">Go to Developers Page</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Developer Onboarding</h1>
          <p className="text-slate-500 font-medium mt-2">Let's build your professional presence</p>
        </div>

        <div className="flex justify-between items-center mb-12 relative px-4 max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 rounded-full"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    index < activeStep ? "bg-primary text-white scale-90" :
                      index === activeStep ? "bg-white text-primary border-4 border-primary scale-110" : "bg-white text-slate-300 border-2 border-slate-100"
                  )}
                >
                  {index < activeStep ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
              </div>
            );
          })}
        </div>

        <Card className="rounded-xl-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden">
          <CardHeader className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                {activeStep === 0 && <User className="h-6 w-6" />}
                {activeStep === 1 && <Code2 className="h-6 w-6" />}
                {activeStep === 2 && <Briefcase className="h-6 w-6" />}
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">{steps[activeStep].label}</CardTitle>
                <CardDescription className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">
                  Step {activeStep + 1} of {steps.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-12 min-h-[400px]">
            {activeStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Current Role</Label>
                  <Popover open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isRoleOpen}
                        className="w-full h-14 rounded-2xl border-slate-200 font-medium justify-between px-4 hover:bg-white active:scale-100"
                      >
                        {formData.role || "Select your current role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-slate-100 shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Search roles..."
                            className="pl-10 h-10 rounded-xl border-none bg-white shadow-sm font-medium text-sm"
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2">
                          {COMMON_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                            <div className="py-6 text-center text-sm text-slate-500 font-medium italic">
                              No roles found...
                            </div>
                          )}
                          {COMMON_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).map((r) => (
                            <button
                              key={r}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                formData.role === r ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"
                              )}
                              onClick={() => {
                                setFormData({ ...formData, role: r });
                                setIsRoleOpen(false);
                                setRoleSearch("");
                              }}
                            >
                              <Check className={cn("h-4 w-4", formData.role === r ? "opacity-100" : "opacity-0")} />
                              {r}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Location (Kenya)</Label>
                  <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
                      {KENYA_COUNTIES.map(c => <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Public Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. hello@example.com"
                      value={formData.publicEmail}
                      onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Public Phone (Optional)</Label>
                    <Input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={formData.publicPhone}
                      onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Your Arsenal (Skills)</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill: string) => (
                      <Badge key={skill} className="h-10 px-4 rounded-xl bg-primary text-white font-black text-sm flex items-center gap-2 group">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X className="h-4 w-4" /></button>
                      </Badge>
                    ))}
                    {formData.skills.length === 0 && <p className="text-slate-500 font-medium italic py-2">Select skills from below or type to add...</p>}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Type a skill and press enter..."
                      className="h-12 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            addSkill(val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 pt-4">
                      {skillsOptions.map((skill: string) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={cn(
                            "px-4 py-2 rounded-xl border font-medium text-xs transition-all",
                            formData.skills.includes(skill) ? "bg-slate-100 text-slate-500 border-slate-100" : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary"
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Work Availability</Label>
                    <Select value={formData.availability} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="OPEN_TO_OFFERS" className="font-medium">Open to Offers</SelectItem>
                        <SelectItem value="NOT_AVAILABLE" className="font-medium">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Preferred Work Type</Label>
                    <Select value={formData.preferredWorkType} onValueChange={(v) => setFormData({ ...formData, preferredWorkType: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="REMOTE" className="font-medium">Remote</SelectItem>
                        <SelectItem value="HYBRID" className="font-medium">Hybrid</SelectItem>
                        <SelectItem value="ONSITE" className="font-medium">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Years of Experience</Label>
                  <Select value={formData.yearsOfExperience} onValueChange={(v) => setFormData({ ...formData, yearsOfExperience: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {experienceLevels.map(l => <SelectItem key={l.value} value={l.value} className="font-medium">{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500">Professional Summary</Label>
                    <span className={cn(
                      "text-[10px] font-medium tracking-widest uppercase",
                      formData.bio.length >= 300 ? "text-danger-500" : "text-slate-500"
                    )}>
                      {formData.bio.length} / 300
                    </span>
                  </div>
                  <Textarea
                    placeholder="Highlight your best work, achievements, and what you're looking for..."
                    className="min-h-[150px] rounded-2xl border-slate-200 font-medium text-base focus-visible:ring-primary/20"
                    value={formData.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 300) {
                        setFormData({ ...formData, bio: e.target.value });
                      }
                    }}
                    maxLength={300}
                  />
                </div>

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(v) => setAgreedToTerms(v as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium text-slate-700 leading-relaxed cursor-pointer">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </Label>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Required to finalize account</p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="bg-slate-50 p-8 flex justify-between gap-4">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-2xl font-black h-14 px-8"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                size="lg"
                className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20 transition-all active:scale-95"
                onClick={handleNext}
                disabled={loading || !agreedToTerms}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {loading ? 'Submitting...' : 'Submit Profile'}
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
  );
}
