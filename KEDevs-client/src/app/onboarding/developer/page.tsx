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
  Info,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { KENYA_COUNTIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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

export default function DeveloperOnboarding() {
  const router = useRouter();
  const { isLoggedIn, isOnboarded, completeOnboarding, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

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
      availability: 'AVAILABLE',
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
          completeOnboarding();
          localStorage.removeItem('developer_onboarding');
          toast.success('Welcome to KEDevs-Connect!');
          router.push('/developers');
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

  if (!isLoggedIn || isOnboarded) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 mb-4 px-3 py-1">
              FINALIZE YOUR ACCOUNT
           </Badge>
           <h1 className="text-4xl font-black tracking-tight text-slate-900">Developer Onboarding</h1>
           <p className="text-slate-500 font-semibold mt-2">Let's build your professional presence</p>
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

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden">
          <CardHeader className="bg-slate-900 p-8 text-white">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                   {activeStep === 0 && <User className="h-6 w-6" />}
                   {activeStep === 1 && <Code2 className="h-6 w-6" />}
                   {activeStep === 2 && <Briefcase className="h-6 w-6" />}
                </div>
                <div>
                   <CardTitle className="text-2xl font-black uppercase tracking-tight">{steps[activeStep].label}</CardTitle>
                   <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
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
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">First Name</Label>
                    <Input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Last Name</Label>
                    <Input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Current / Desired Role</Label>
                  <Input 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Location (Kenya)</Label>
                  <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
                      {KENYA_COUNTIES.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Public Email</Label>
                    <Input 
                      type="email"
                      placeholder="e.g. hello@example.com"
                      value={formData.publicEmail}
                      onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Public Phone (Optional)</Label>
                    <Input 
                      type="tel"
                      placeholder="e.g. +254 712 345 678"
                      value={formData.publicPhone}
                      onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                      className="h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Your Arsenal (Skills)</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill: string) => (
                      <Badge key={skill} className="h-10 px-4 rounded-xl bg-primary text-white font-black text-sm flex items-center gap-2 group">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X className="h-4 w-4" /></button>
                      </Badge>
                    ))}
                    {formData.skills.length === 0 && <p className="text-slate-400 font-medium italic py-2">Select skills from below or type to add...</p>}
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
                                 "px-4 py-2 rounded-xl border font-bold text-xs transition-all",
                                 formData.skills.includes(skill) ? "bg-slate-100 text-slate-400 border-slate-100" : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                              )}
                           >
                              {skill}
                           </button>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Work Availability</Label>
                  <Select value={formData.availability} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="AVAILABLE" className="font-bold">Available Now</SelectItem>
                      <SelectItem value="OPEN_TO_OFFERS" className="font-bold">Open to Offers</SelectItem>
                      <SelectItem value="NOT_AVAILABLE" className="font-bold">Currently Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Years of Experience</Label>
                  <Select value={formData.yearsOfExperience} onValueChange={(v) => setFormData({ ...formData, yearsOfExperience: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {experienceLevels.map(l => <SelectItem key={l.value} value={l.value} className="font-bold">{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Professional Summary</Label>
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase",
                      formData.bio.length >= 300 ? "text-red-500" : "text-slate-400"
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
                    <Label htmlFor="terms" className="text-sm font-bold text-slate-700 leading-relaxed cursor-pointer">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </Label>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Required to finalize account</p>
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
                {loading ? 'Finalizing...' : 'Launch Profile'}
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
