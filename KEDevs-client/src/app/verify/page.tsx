'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Wallet, 
  FileUp, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Lock,
  ArrowRight,
  UserCheck,
  FileCheck,
  XCircle,
  FileText,
  BadgeCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { verificationService, VerificationStatus, VerificationStatusResponse } from '@/services/verificationService';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const steps = [
  { id: 0, label: 'Eligibility', icon: UserCheck },
  { id: 1, label: 'Transaction', icon: Wallet },
  { id: 2, label: 'Documentation', icon: FileUp },
  { id: 3, label: 'Protocol Review', icon: Clock },
];

export default function VerificationFlow() {
  const { user } = useAuth();
  const { getPrice, loading: settingsLoading } = usePlatformSettings();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatusResponse | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('254');

  const [idFile, setIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

  const validateFile = (file: File | null) => {
    if (!file) return false;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Unsupported format: ${file.name}`);
      return false;
    }
    return true;
  };

  const idRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    try {
      const response = await verificationService.getStatus();
      if (response.success) {
        setVerifyStatus(response.data);
        const status = response.data.status;
        if (status === VerificationStatus.NONE) setActiveStep(0);
        else if (status === VerificationStatus.PENDING_PAYMENT) setActiveStep(1);
        else if (status === VerificationStatus.PENDING_DOCS) setActiveStep(2);
        else if (status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED || status === VerificationStatus.REJECTED) setActiveStep(3);
      }
    } catch (err) {
      console.error('Failed to fetch verification status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStep === 1 || activeStep === 2) {
      interval = setInterval(() => {
        fetchStatus();
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeStep]);

  useEffect(() => {
    if (verifyStatus) {
      const status = verifyStatus.status;
      if (status === VerificationStatus.NONE && activeStep !== 0) setActiveStep(0);
      else if (status === VerificationStatus.PENDING_PAYMENT && activeStep === 0) setActiveStep(1);
      else if (status === VerificationStatus.PENDING_DOCS && activeStep === 1) {
        toast.success('Payment confirmed');
        setActiveStep(2);
      }
      else if ((status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED || status === VerificationStatus.REJECTED) && activeStep < 3) setActiveStep(3);
    }
  }, [verifyStatus?.status]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInitiate = async () => {
    if (!phoneNumber || phoneNumber.length < 12) {
      toast.error('Invalid M-Pesa number (Format: 254...)');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await verificationService.initiate(phoneNumber);
      if (response.success) {
        toast.success(response.data.customerMessage || 'M-Pesa STK Push transmitted');
        fetchStatus();
      }
    } catch (err: any) {
      toast.error('Transaction initiation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDocuments = async () => {
    if (!idFile || !passportFile) {
      toast.error('Identity document and passport photo are mandatory');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('idDoc', idFile);
      formData.append('passportPhoto', passportFile);
      certFiles.forEach(file => formData.append('certificates', file));

      const response = await verificationService.submitDocuments(formData);
      if (response.success) {
        toast.success('Documents uploaded to secure vault');
        fetchStatus();
      }
    } catch (err: any) {
      toast.error('Document submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing protocol state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-12 animate-in fade-in duration-700">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 space-y-4">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5">
              TRUST PROTOCOL
           </Badge>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Identity Verification</h1>
           <p className="text-slate-500 font-semibold text-lg max-w-xl mx-auto leading-relaxed">
              Complete the verification sequence to earn your <span className="text-emerald-500 font-black italic">Verified Badge</span>.
           </p>
        </div>

        {verifyStatus?.status === VerificationStatus.REJECTED ? (
           <Card className="rounded-[3rem] border-none shadow-2xl shadow-red-500/10 overflow-hidden bg-white">
              <CardContent className="p-16 text-center space-y-8">
                 <div className="h-24 w-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                    <XCircle className="h-12 w-12 text-red-500" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Verification Rejected</h2>
                    <p className="text-slate-500 font-medium">Protocol violation or document inconsistency detected.</p>
                 </div>
                 <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Administrative Reason</p>
                    <p className="font-bold text-red-900 leading-relaxed">{verifyStatus.rejectionReason || 'Documents did not meet our compliance requirements.'}</p>
                 </div>
                 <Button className="h-14 rounded-2xl font-black bg-slate-900 px-10 shadow-xl" onClick={() => setActiveStep(0)}>
                    Re-initiate Protocol
                 </Button>
              </CardContent>
           </Card>
        ) : (
           <div className="space-y-12">
              {/* Modern Stepper */}
              <div className="flex justify-between items-center px-4 md:px-12 relative">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                 {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = activeStep === i;
                    const isCompleted = activeStep > i;
                    
                    return (
                       <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                          <div className={cn(
                             "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-white shadow-xl",
                             isActive ? "bg-primary text-white scale-110" : isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                          )}>
                             {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                          </div>
                          <span className={cn(
                             "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                             isActive ? "text-primary" : "text-slate-400"
                          )}>
                             {step.label}
                          </span>
                       </div>
                    );
                 })}
              </div>

              <Card className="rounded-[4rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                 <CardContent className="p-12 md:p-20">
                    {activeStep === 0 && (
                       <div className="space-y-10">
                          <div className="space-y-2">
                             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phase 01: Eligibility Scan</h2>
                             <p className="text-slate-500 font-medium italic leading-relaxed">We audit your profile for baseline compliance and completeness.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {verifyStatus && Object.entries(verifyStatus.profileCompleteness).map(([req, met]) => (
                                <div key={req} className={cn(
                                   "p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4",
                                   met ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100"
                                )}>
                                   <div className={cn(
                                      "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                      met ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                                   )}>
                                      {met ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                   </div>
                                   <span className={cn("text-sm font-black tracking-tight", met ? "text-emerald-900" : "text-slate-400 uppercase text-[10px] tracking-widest")}>{req}</span>
                                </div>
                             ))}
                          </div>

                          {!verifyStatus?.isEligible && (
                             <div className="p-8 rounded-[2rem] bg-amber-50 border-2 border-amber-100 flex gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                                <div className="space-y-2">
                                   <p className="text-sm font-black text-amber-900">Incomplete Data Structure</p>
                                   <p className="text-xs font-medium text-amber-700 leading-relaxed">Your professional identity record is missing critical nodes. Please update your profile to continue the verification sequence.</p>
                                   <Button asChild variant="outline" className="mt-4 rounded-xl border-amber-200 bg-white hover:bg-amber-100 font-black">
                                      <Link href="/profile/me">Open Dashboard</Link>
                                   </Button>
                                </div>
                             </div>
                          )}
                       </div>
                    )}

                    {activeStep === 1 && (
                       <div className="space-y-10 text-center">
                          <div className="h-24 w-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                             <Smartphone className="h-12 w-12 text-primary" />
                          </div>
                          <div className="space-y-2">
                             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phase 02: Transaction Authorization</h2>
                             <p className="text-slate-500 font-medium italic leading-relaxed">
                                Manual review requires a processing fee of <span className="text-slate-900 font-black">KES {user?.role === 'DEVELOPER' ? getPrice('VERIFIED_BADGE_DEVELOPER', '250') : getPrice('VERIFIED_BADGE_EMPLOYER', '500')}</span>.
                             </p>
                          </div>

                          <div className="max-w-sm mx-auto space-y-6">
                             <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input 
                                   value={phoneNumber}
                                   onChange={(e) => setPhoneNumber(e.target.value)}
                                   placeholder="2547XXXXXXXX"
                                   className="h-16 rounded-2xl bg-slate-50 border-none pl-12 font-black text-lg focus-visible:ring-primary/20"
                                />
                             </div>
                             <Button 
                                className="w-full h-16 rounded-[2rem] bg-slate-900 text-white font-black text-lg shadow-xl shadow-slate-900/10 gap-3"
                                onClick={handleInitiate}
                                disabled={isSubmitting || verifyStatus?.status !== VerificationStatus.PENDING_PAYMENT}
                             >
                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                                {verifyStatus?.status === VerificationStatus.PENDING_DOCS ? 'Payment Confirmed' : 'Authorize STK Push'}
                             </Button>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Encrypted M-Pesa Direct Interface</p>
                          </div>
                       </div>
                    )}

                    {activeStep === 2 && (
                       <div className="space-y-10">
                          <div className="space-y-2">
                             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phase 03: Digital Vault Upload</h2>
                             <p className="text-slate-500 font-medium italic leading-relaxed">Please transmit high-fidelity copies of your identification artifacts.</p>
                          </div>

                          <div className="space-y-6">
                             <input type="file" hidden ref={idRef} onChange={(e) => { const file = e.target.files?.[0] || null; if (validateFile(file)) setIdFile(file); }} />
                             <div 
                                onClick={() => idRef.current?.click()}
                                className={cn(
                                   "p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                                   idFile ? "bg-emerald-50/50 border-emerald-500/30" : "bg-slate-50 border-slate-100 hover:border-primary/30"
                                )}
                             >
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", idFile ? "bg-emerald-500 text-white" : "bg-white text-slate-400")}>
                                   {idFile ? <FileCheck className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                </div>
                                <div className="text-center">
                                   <p className="font-black text-slate-900">{idFile ? idFile.name : 'National ID / Passport Archive'}</p>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">PNG, JPEG, WEBP or PDF (Max 10MB)</p>
                                </div>
                             </div>

                             <input type="file" hidden ref={passportRef} onChange={(e) => { const file = e.target.files?.[0] || null; if (validateFile(file)) setPassportFile(file); }} />
                             <div 
                                onClick={() => passportRef.current?.click()}
                                className={cn(
                                   "p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                                   passportFile ? "bg-emerald-50/50 border-emerald-500/30" : "bg-slate-50 border-slate-100 hover:border-primary/30"
                                )}
                             >
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", passportFile ? "bg-emerald-500 text-white" : "bg-white text-slate-400")}>
                                   {passportFile ? <FileCheck className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                                </div>
                                <div className="text-center">
                                   <p className="font-black text-slate-900">{passportFile ? passportFile.name : 'Live Passport Identity Photo'}</p>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Images only (PNG, JPEG, WEBP)</p>
                                </div>
                             </div>
                             
                             <input type="file" hidden multiple ref={certRef} onChange={(e) => { const files = Array.from(e.target.files || []); const validFiles = files.filter(validateFile); setCertFiles(prev => [...prev, ...validFiles]); }} />
                             <div 
                                onClick={() => certRef.current?.click()}
                                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center cursor-pointer hover:bg-slate-100 transition-all"
                             >
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                   {certFiles.length > 0 ? `${certFiles.length} Certificates Integrated` : 'Supplemental Professional Certs (Optional)'}
                                </p>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeStep === 3 && (
                       <div className="space-y-12 text-center">
                          <div className="relative mx-auto h-32 w-32">
                             <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                             <div className={cn(
                                "relative h-32 w-32 rounded-[3rem] flex items-center justify-center shadow-2xl",
                                verifyStatus?.status === VerificationStatus.APPROVED ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                             )}>
                                {verifyStatus?.status === VerificationStatus.APPROVED ? <BadgeCheck className="h-16 w-16" /> : <Clock className="h-16 w-16 animate-spin-slow" />}
                             </div>
                          </div>

                          <div className="space-y-4 max-w-lg mx-auto">
                             <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                {verifyStatus?.status === VerificationStatus.APPROVED ? 'Protocol Success' : 'Review Sequence Active'}
                             </h2>
                             <p className="text-slate-500 font-medium italic leading-relaxed">
                                {verifyStatus?.status === VerificationStatus.APPROVED 
                                   ? 'Congratulations. Your identity is verified across the KEDevs ecosystem. You now possess priority trust status.' 
                                   : 'Your artifacts have been securely stored. Our compliance team will audit your submission within 2-5 business days.'}
                             </p>
                          </div>

                          <div className="p-10 rounded-[3rem] bg-slate-50 border-2 border-slate-100 max-w-md mx-auto space-y-4">
                             <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Timestamp</span>
                                <span className="text-slate-900">{verifyStatus?.createdAt ? new Date(verifyStatus.createdAt).toLocaleDateString() : 'N/A'}</span>
                             </div>
                             <Separator className="bg-slate-200/50" />
                             <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Current Phase</span>
                                <Badge className={cn(
                                   "rounded-lg font-black text-[10px] border-none shadow-sm",
                                   verifyStatus?.status === VerificationStatus.APPROVED ? "bg-emerald-500" : "bg-amber-500"
                                )}>
                                   {verifyStatus?.status === VerificationStatus.APPROVED ? 'AUTHORIZED' : 'UNDER_AUDIT'}
                                </Badge>
                             </div>
                          </div>

                          <Button asChild className="h-16 rounded-[2rem] px-12 font-black bg-slate-900 shadow-2xl shadow-slate-900/20 text-lg">
                             <Link href="/profile/me">Access Dashboard</Link>
                          </Button>
                       </div>
                    )}

                    {activeStep < 3 && (
                       <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
                          <Button 
                             variant="ghost" 
                             className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 disabled:opacity-0" 
                             onClick={() => setActiveStep(prev => prev - 1)}
                             disabled={activeStep === 0}
                          >
                             <ChevronLeft className="h-4 w-4" /> Backtrack
                          </Button>
                          
                          <Button 
                             className="h-16 rounded-2xl px-12 font-black bg-primary text-white shadow-xl shadow-primary/20 text-lg group"
                             onClick={() => activeStep === 2 ? handleSubmitDocuments() : setActiveStep(prev => prev + 1)}
                             disabled={activeStep === 0 && !verifyStatus?.isEligible}
                          >
                             {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : activeStep === 2 ? <ShieldCheck className="h-6 w-6 mr-2" /> : null}
                             {activeStep === 2 ? 'Initiate Audit' : 'Proceed'}
                             {activeStep < 2 && <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />}
                          </Button>
                       </div>
                    )}
                 </CardContent>
              </Card>
           </div>
        )}
      </div>
    </div>
  );
}
