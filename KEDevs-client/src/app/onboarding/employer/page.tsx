'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Contact,
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  ShieldCheck,
  FileText,
  UploadCloud,
  Globe,
  X,
  Eye, 
  ExternalLink,
  CreditCard,
  Smartphone,
  User,
  Mail,
  Users,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { employerService } from '@/services/employerService';
import { paymentService } from '@/services/paymentService';
import { verificationService } from '@/services/verificationService';
import { KENYA_COUNTIES, INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  { label: 'Payment', icon: CreditCard },
  { label: 'Documents', icon: ShieldCheck },
  { label: 'Review', icon: Eye },
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

  // Verification document files (held in state until final submit)
  const [incorporationFile, setIncorporationFile] = useState<File | null>(null);
  const [kraPinFile, setKraPinFile] = useState<File | null>(null);
  const [businessPermitFile, setBusinessPermitFile] = useState<File | null>(null);

  // Payment state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [verificationFee, setVerificationFee] = useState('...');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('employer_onboarding');
      if (saved) return JSON.parse(saved);
    }
    return {
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
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('employer_onboarding', JSON.stringify(formData));
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
    const fetchFee = async () => {
      try {
        const response = await paymentService.getSettings();
        if (response.success) {
          const fee = response.data.find(s => s.settingKey === 'VERIFIED_BADGE_EMPLOYER')?.settingValue;
          if (fee) setVerificationFee(fee);
        }
      } catch (err) {}
    };
    fetchFee();
  }, []);

  const checkPaymentStatus = async () => {
    setIsVerifyingPayment(true);
    try {
      const response = await verificationService.getStatus();
      if (response.success && (response.data.status === 'PENDING_DOCS' || response.data.status === 'UNDER_REVIEW' || response.data.status === 'APPROVED')) {
        setHasPaid(true);
        toast.success('Payment verified!');
        setActiveStep(3); // Move to Documents
      } else {
        toast.error('Payment not found. Please ensure you have completed the M-Pesa transaction.');
      }
    } catch (err) {
      toast.error('Failed to verify payment status.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !phoneNumber.match(/^0[17]\d{8}$/)) {
      toast.error('Invalid phone number format (Format: 07xxxxxxxx)');
      return;
    }
    setIsPaying(true);
    try {
      const response = await verificationService.initiate(phoneNumber);
      if (response.success) {
        toast.success('STK Push sent to your phone!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsPaying(false);
    }
  };

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
      if (activeStep === 2) {
        if (!hasPaid) {
          toast.error('Please complete the verification payment first');
          return;
        }
      }
      if (activeStep === 3) {
        if (!incorporationFile || !kraPinFile || !businessPermitFile) {
          toast.error('Please upload all three verification documents');
          return;
        }
      }
      setActiveStep((prev) => prev + 1);
      return;
    }

    // Final submit (step 3 — Review)
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }
    setIsSubmitting(true);

    try {
      // Step A: Create the profile
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
        // Step B: Upload the verification documents
        if (incorporationFile && kraPinFile && businessPermitFile) {
          await employerService.uploadVerificationDocuments(
            incorporationFile,
            kraPinFile,
            businessPermitFile
          );
        }

        completeOnboarding();
        localStorage.removeItem('employer_onboarding');
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
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 py-12 sm:py-16">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center mb-8">
           <Badge variant="outline" className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-primary/10 text-primary border-none mb-3 px-3 py-1">
              EMPLOYER VERIFICATION
           </Badge>
           <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Build Your Presence</h1>
           <p className="text-sm text-slate-500 font-medium mt-1.5 font-sans">Connect with the top tech talent in Kenya</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-8 relative px-4 max-w-xs sm:max-w-md mx-auto">
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

        <Card className="rounded-2xl border border-border/50 shadow-md bg-white overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-slate-50/50 p-5 sm:p-6">
             <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                   {activeStep === 0 && <Building2 className="h-4.5 w-4.5" />}
                   {activeStep === 1 && <Contact className="h-4.5 w-4.5" />}
                   {activeStep === 2 && <CreditCard className="h-4.5 w-4.5" />}
                   {activeStep === 3 && <ShieldCheck className="h-4.5 w-4.5" />}
                   {activeStep === 4 && <Eye className="h-4.5 w-4.5" />}
                </div>
                <div>
                   <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">{steps[activeStep].label}</CardTitle>
                   <CardDescription className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      Step {activeStep + 1} of {steps.length}
                   </CardDescription>
                </div>
             </div>
          </CardHeader>
          
          <CardContent className="p-5 sm:p-8 min-h-[350px] space-y-5">
            {activeStep === 0 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Company Name</Label>
                  <Input 
                    placeholder="e.g. TechFlow Solutions Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-border/50 text-sm">
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-[200px]">
                        {INDUSTRIES.map((i: string) => <SelectItem key={i} value={i} className="font-medium text-xs">{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(v) => setFormData({ ...formData, companySize: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-border/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {COMPANY_SIZES.map((s: { value: string; label: string }) => <SelectItem key={s.value} value={s.value} className="font-medium text-xs">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">HQ Location (Kenya)</Label>
                  <Select value={formData.locationCity} onValueChange={(v) => setFormData({ ...formData, locationCity: v })}>
                    <SelectTrigger className="h-10 rounded-xl border-border/50 text-sm">
                      <SelectValue placeholder="Select county..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[200px]">
                      {KENYA_COUNTIES.map((c: string) => <SelectItem key={c} value={c} className="font-medium text-xs">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Company Bio / Culture</Label>
                  <Textarea 
                    placeholder="Tell developers what makes your company a great place to work..."
                    className="min-h-[100px] rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                    value={formData.companyBio}
                    onChange={(e) => setFormData({ ...formData, companyBio: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 px-0.5">Recruitment Contact</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="e.g. HR Manager"
                        value={formData.contactPersonName}
                        onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                        className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 px-0.5">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="email"
                        placeholder="hiring@company.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                   <Label className="text-xs font-semibold text-slate-700 px-0.5">Online Presence (Optional)</Label>
                   <div className="space-y-3">
                      <div className="relative">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input 
                            placeholder="Website URL"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                         />
                      </div>
                      <div className="relative">
                         <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0077b5]" />
                         <Input 
                            placeholder="LinkedIn Profile"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                         />
                      </div>
                       <div className="relative">
                          <X className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900" />
                          <Input 
                             placeholder="X / Twitter Handle"
                             value={formData.twitterHandle}
                             onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                             className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                          />
                       </div>
                   </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Verification Fee</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed font-sans max-w-sm mx-auto">Kenya law requires business verification. This one-time fee covers document processing and background checks.</p>
                  </div>
                  <div className="py-2">
                    <div className="text-3xl font-black text-slate-900">KES {verificationFee}</div>
                    <Badge variant="secondary" className="mt-1.5 font-black uppercase text-[10px] tracking-widest bg-primary/10 text-primary border-none">One-Time Lifetime Fee</Badge>
                  </div>
                </div>

                {!hasPaid ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">M-Pesa Phone Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="0712345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-9 h-10 rounded-xl border-border/50 font-medium text-sm focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Button 
                        size="default" 
                        className="h-10 rounded-xl font-semibold bg-primary text-white shadow-sm"
                        onClick={handleInitiatePayment}
                        disabled={isPaying}
                      >
                        {isPaying ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CreditCard className="h-4 w-4 mr-1.5" />}
                        Pay via M-Pesa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="default" 
                        className="h-10 rounded-xl font-semibold border-border/50"
                        onClick={checkPaymentStatus}
                        disabled={isVerifyingPayment}
                      >
                        {isVerifyingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : 'I have paid'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-cyan-50/30 border border-emerald-100 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-cyan-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-cyan-800">Payment Verified!</h4>
                      <p className="text-cyan-600 font-medium text-xs leading-relaxed font-sans">You have successfully unlocked the verification step.</p>
                    </div>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700 font-semibold text-white h-9 rounded-lg px-4"
                      onClick={() => setActiveStep(3)}
                    >
                      Continue to Documents
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-3.5 rounded-xl bg-azure-50/50 border border-azure-100 flex gap-2.5">
                  <Info className="h-4 w-4 text-azure-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-azure-700 leading-relaxed font-sans">
                    To verify your company operates legally in Kenya, we require three official documents. These are reviewed by our team and kept securely — they are never shared publicly.
                  </p>
                </div>

                {/* Document 1: Certificate of Incorporation + CR12 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-slate-700">Certificate of Incorporation / CR12</Label>
                    <Badge className="text-[9px] bg-danger-50 text-danger-500 border-none font-bold py-0.5 px-2 rounded-full">Required</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    <strong>Why we collect this:</strong> The Certificate of Incorporation proves your company is legally registered with the Registrar of Companies in Kenya. The CR12 lists the current directors.
                  </p>
                  <label className={cn(
                    "flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-colors",
                    incorporationFile ? "border-emerald-400 bg-cyan-50/30 text-cyan-600" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                  )}>
                    <div className="flex flex-col items-center gap-1">
                      {incorporationFile ? (
                        <><CheckCircle2 className="h-5 w-5 text-cyan-600" /><span className="text-xs font-medium text-cyan-700">{incorporationFile.name}</span></>
                      ) : (
                        <><UploadCloud className="h-5 w-5 text-slate-400" /><span className="text-xs font-medium text-slate-500">Click to upload PDF, JPG, or PNG</span></>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIncorporationFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Document 2: KRA PIN Certificate */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-slate-700">KRA PIN Certificate</Label>
                    <Badge className="text-[9px] bg-danger-50 text-danger-500 border-none font-bold py-0.5 px-2 rounded-full">Required</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    <strong>Why we collect this:</strong> The KRA PIN certificate proves your business is registered with the Kenya Revenue Authority for tax purposes.
                  </p>
                  <label className={cn(
                    "flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-colors",
                    kraPinFile ? "border-emerald-400 bg-cyan-50/30 text-cyan-600" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                  )}>
                    <div className="flex flex-col items-center gap-1">
                      {kraPinFile ? (
                        <><CheckCircle2 className="h-5 w-5 text-cyan-600" /><span className="text-xs font-medium text-cyan-700">{kraPinFile.name}</span></>
                      ) : (
                        <><UploadCloud className="h-5 w-5 text-slate-400" /><span className="text-xs font-medium text-slate-500">Click to upload PDF, JPG, or PNG</span></>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKraPinFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Document 3: Single Business Permit */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-slate-700">Single Business Permit / Trade Licence</Label>
                    <Badge className="text-[9px] bg-danger-50 text-danger-500 border-none font-bold py-0.5 px-2 rounded-full">Required</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    <strong>Why we collect this:</strong> A Single Business Permit issued by the county government confirms your company is legally allowed to operate from its physical premises.
                  </p>
                  <label className={cn(
                    "flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-colors",
                    businessPermitFile ? "border-emerald-400 bg-cyan-50/30 text-cyan-600" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                  )}>
                    <div className="flex flex-col items-center gap-1">
                      {businessPermitFile ? (
                        <><CheckCircle2 className="h-5 w-5 text-cyan-600" /><span className="text-xs font-medium text-cyan-700">{businessPermitFile.name}</span></>
                      ) : (
                        <><UploadCloud className="h-5 w-5 text-slate-400" /><span className="text-xs font-medium text-slate-500">Click to upload PDF, JPG, or PNG</span></>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setBusinessPermitFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 sm:p-8 rounded-xl bg-slate-50/50 border border-slate-100 space-y-4 shadow-sm">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <h3 className="text-xl sm:text-2xl font-black text-slate-900">{formData.companyName || '—'}</h3>
                         <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] uppercase">{formData.industry || 'Industry'}</Badge>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider"><Users className="h-3 w-3" /> {companySizeLabel}</span>
                         </div>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                         {formData.companyName?.charAt(0)}
                      </div>
                   </div>

                   <Separator className="bg-slate-200/50" />

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Headquarters</p>
                         <p className="font-semibold text-xs flex items-center gap-1 text-slate-700"><MapPin className="h-3.5 w-3.5 text-primary" /> {formData.locationCity}, Kenya</p>
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Contact</p>
                         <p className="font-semibold text-xs text-slate-700">{formData.contactPersonName}</p>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Bio</p>
                      <p className="text-xs font-medium text-slate-600 line-clamp-3 italic leading-relaxed font-sans">{formData.companyBio}</p>
                   </div>
                </div>

                <div className="p-4 rounded-xl bg-azure-50/50 border border-azure-100 flex gap-3">
                   <Info className="h-4.5 w-4.5 text-azure-500 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-azure-700 leading-relaxed font-sans">
                      Your profile will be reviewed by our moderation team. Approval usually takes less than 24 hours.
                   </p>
                </div>

                <div className="flex items-start space-x-2.5 pt-2">
                  <Checkbox 
                     id="terms-employer" 
                     checked={agreedToTerms} 
                     onCheckedChange={(v) => setAgreedToTerms(v as boolean)} 
                     className="mt-0.5 rounded animate-none"
                  />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="terms-employer" className="text-xs font-medium text-slate-700 leading-normal cursor-pointer">
                      I agree to the <Link href="/terms" className="text-primary hover:underline font-semibold font-sans">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-semibold font-sans">Privacy Policy</Link>.
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-border/50 p-5 sm:p-6 flex justify-between items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="default" 
              className="rounded-xl font-semibold h-10 px-4 sm:px-5"
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button 
                size="default" 
                className="rounded-xl font-semibold h-10 px-5 sm:px-6 shadow-sm transition-all active:scale-95 bg-primary text-white"
                onClick={handleNext}
                disabled={isSubmitting || !agreedToTerms}
              >
                {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit Profile'}
              </Button>
            ) : (
              <Button 
                size="default" 
                className="rounded-xl font-semibold h-10 px-5 sm:px-6 shadow-sm bg-primary text-white"
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
