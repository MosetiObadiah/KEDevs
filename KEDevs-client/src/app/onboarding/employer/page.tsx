'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Contact, 
  LayoutDashboard, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  ShieldCheck,
  Globe,
  X,
  Users,
  MapPin,
  Mail,
  User,
  Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { employerService } from '@/services/employerService';
import { KENYA_COUNTIES, INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  { label: 'Profile', icon: Building2 },
  { label: 'Contact', icon: Contact },
  { label: 'Review', icon: Eye }
];

const COMPANY_SIZES = [
  { value: 'ONE_TO_TEN', label: '1–10 employees' },
  { value: 'TEN_TO_FIFTY', label: '11–50 employees' },
  { value: 'FIFTY_TO_TWO_HUNDRED', label: '51–200 employees' },
  { value: 'TWO_HUNDRED_PLUS', label: '200+ employees' },
];

export default function EmployerOnboarding() {
  const router = useRouter();
  const { completeOnboarding, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: 'TEN_TO_FIFTY',
    locationCity: '',
    companyBio: '',
    contactPersonName: user?.fullName || '',
    contactEmail: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterHandle: '',
  });

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      if (activeStep === 0) {
        if (!formData.companyName || !formData.industry || !formData.locationCity || !formData.companyBio) {
          toast.error('Please fill all required company details');
          return;
        }
      }
      if (activeStep === 1) {
        if (!formData.contactPersonName || !formData.contactEmail) {
          toast.error('Please fill all required contact details');
          return;
        }
      }
      setActiveStep((prev) => prev + 1);
      return;
    }

    // Final submit
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await employerService.createProfile({
        contactPersonName: formData.contactPersonName.trim(),
        companyName: formData.companyName.trim(),
        companyBio: formData.companyBio.trim(),
        companyWebsite: formData.websiteUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        twitterUrl: formData.twitterHandle.trim(),
        industry: formData.industry,
        companySize: formData.companySize,
        locationHQ: formData.locationCity ? `${formData.locationCity}, Kenya` : 'Nairobi, Kenya',
        logoUrl: '',
        contactEmail: formData.contactEmail.trim(),
      });

      if (response.success) {
        completeOnboarding();
        toast.success('Profile submitted for approval!');
        router.push('/pending-approval');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employer profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const companySizeLabel = COMPANY_SIZES.find((s) => s.value === formData.companySize)?.label || '';

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-emerald-50 text-emerald-600 border-emerald-100 mb-4 px-3 py-1">
              EMPLOYER VERIFICATION
           </Badge>
           <h1 className="text-4xl font-black tracking-tight text-slate-900">Build Your Presence</h1>
           <p className="text-slate-500 font-semibold mt-2">Connect with the top tech talent in Kenya</p>
        </div>

        <div className="flex justify-between items-center mb-12 relative px-4 max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-500 rounded-full" 
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    index < activeStep ? "bg-emerald-500 text-white scale-90" : 
                    index === activeStep ? "bg-white text-emerald-500 border-4 border-emerald-500 scale-110" : "bg-white text-slate-300 border-2 border-slate-100"
                  )}
                >
                  {index < activeStep ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
              </div>
            );
          })}
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-emerald-500/5 overflow-hidden">
          <CardHeader className="bg-slate-900 p-8 text-white">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                   {activeStep === 0 && <Building2 className="h-6 w-6" />}
                   {activeStep === 1 && <Contact className="h-6 w-6" />}
                   {activeStep === 2 && <Eye className="h-6 w-6" />}
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
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Company Name</Label>
                  <Input 
                    placeholder="e.g. TechFlow Solutions Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="h-14 rounded-2xl border-slate-200 font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-[300px]">
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="font-bold">{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(v) => setFormData({ ...formData, companySize: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {COMPANY_SIZES.map(s => <SelectItem key={s.value} value={s.value} className="font-bold">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">HQ Location (Kenya)</Label>
                  <Select value={formData.locationCity} onValueChange={(v) => setFormData({ ...formData, locationCity: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                      <SelectValue placeholder="Select county..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
                      {KENYA_COUNTIES.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Company Bio / Culture</Label>
                  <Textarea 
                    placeholder="Tell developers what makes your company a great place to work..."
                    className="min-h-[120px] rounded-2xl border-slate-200 font-medium text-base"
                    value={formData.companyBio}
                    onChange={(e) => setFormData({ ...formData, companyBio: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Recruitment Contact</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="e.g. HR Manager"
                        value={formData.contactPersonName}
                        onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                        className="pl-11 h-14 rounded-2xl border-slate-200 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="email"
                        placeholder="hiring@company.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="pl-11 h-14 rounded-2xl border-slate-200 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-4">
                   <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Online Presence (Optional)</Label>
                   <div className="space-y-4">
                      <div className="relative">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input 
                            placeholder="Website URL"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="pl-11 h-12 rounded-xl"
                         />
                      </div>
                      <div className="relative">
                         <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0077b5]" />
                         <Input 
                            placeholder="LinkedIn Profile"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            className="pl-11 h-12 rounded-xl"
                         />
                      </div>
                       <div className="relative">
                          <X className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900" />
                          <Input 
                             placeholder="X / Twitter Handle"
                             value={formData.twitterHandle}
                             onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                             className="pl-11 h-12 rounded-xl"
                          />
                       </div>
                   </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-2xl shadow-slate-900/10">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <h3 className="text-3xl font-black">{formData.companyName || '—'}</h3>
                         <div className="flex items-center gap-3">
                            <Badge className="bg-white/10 text-white border-white/20 font-black text-[10px] uppercase">{formData.industry || 'Industry'}</Badge>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Users className="h-3 w-3" /> {companySizeLabel}</span>
                         </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-black text-xl">
                         {formData.companyName?.charAt(0)}
                      </div>
                   </div>

                   <Separator className="bg-white/10" />

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Headquarters</p>
                         <p className="font-bold text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-500" /> {formData.locationCity}, Kenya</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main Contact</p>
                         <p className="font-bold text-sm">{formData.contactPersonName}</p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company Bio</p>
                      <p className="text-sm font-medium text-slate-300 line-clamp-3 italic">{formData.companyBio}</p>
                   </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex gap-4">
                   <Info className="h-6 w-6 text-blue-500 shrink-0" />
                   <p className="text-xs font-medium text-blue-700 leading-relaxed">
                      Your profile will be reviewed by our moderation team. Approval usually takes less than 24 hours.
                   </p>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox 
                     id="terms-employer" 
                     checked={agreedToTerms} 
                     onCheckedChange={(v) => setAgreedToTerms(v as boolean)} 
                     className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms-employer" className="text-sm font-bold text-slate-700 leading-relaxed cursor-pointer">
                      I agree to the <Link href="/terms" className="text-primary hover:underline font-black">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-black">Privacy Policy</Link>.
                    </Label>
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
              disabled={activeStep === 0 || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button 
                size="lg" 
                className="rounded-2xl font-black h-14 px-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                onClick={handleNext}
                disabled={isSubmitting || !agreedToTerms}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Submitting...' : 'Submit Profile'}
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-emerald-500/10"
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
