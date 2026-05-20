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
   Zap,
   X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { verificationService, VerificationStatus, VerificationStatusResponse } from '@/services/verificationService';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { cn, formatDateString } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const steps = [
   { id: 0, label: 'Eligibility', icon: UserCheck },
   { id: 1, label: 'Transaction', icon: Wallet },
   { id: 2, label: 'Uploads', icon: FileUp },
   { id: 3, label: 'Review', icon: Clock },
];

export default function VerificationFlow() {
   const { user } = useAuth();
   const { getPrice, loading: settingsLoading } = usePlatformSettings();
   const [activeStep, setActiveStep] = useState(0);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [loading, setLoading] = useState(true);
   const [verifyStatus, setVerifyStatus] = useState<VerificationStatusResponse | null>(null);
   const [phoneNumber, setPhoneNumber] = useState('');
   const [isPollingPayment, setIsPollingPayment] = useState(false);
   const paymentPollRef = useRef<NodeJS.Timeout | null>(null);
   const paymentPollCountRef = useRef(0);

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
      setLoading(true);
      try {
         const response = await verificationService.getStatus();
         if (response.success) {
            setVerifyStatus(response.data);
            if (response.data.status === VerificationStatus.REJECTED) {
               toast.error(response.data.rejectionReason || 'Previous verification attempt was rejected.');
            }
            const status = response.data.status;
            if (status === VerificationStatus.PENDING_PAYMENT && activeStep < 1) setActiveStep(1);
            else if (status === VerificationStatus.PENDING_DOCS && activeStep < 2) setActiveStep(2);
            else if ((status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED) && activeStep < 3) setActiveStep(3);
         }
      } catch (err) {
         console.error('Failed to fetch verification status', err);
         toast.error('Identity protocol synchronization failed');
      } finally {
         setLoading(false);
      }
   };

   // Starts a dedicated payment confirmation poller — 10 attempts × 5 s = 50 s max
   const startPaymentPoller = () => {
      if (paymentPollRef.current) return; // already running
      paymentPollCountRef.current = 0;
      setIsPollingPayment(true);

      paymentPollRef.current = setInterval(async () => {
         paymentPollCountRef.current += 1;

         try {
            const response = await verificationService.getStatus();
            if (response.success) {
               const status = response.data.status;
               setVerifyStatus(response.data);

               if (status === VerificationStatus.PENDING_DOCS) {
                  clearInterval(paymentPollRef.current!);
                  paymentPollRef.current = null;
                  setIsPollingPayment(false);
                  toast.success('Payment approved! Please upload your documents.');
                  setActiveStep(2);
                  return;
               }

               if (status === VerificationStatus.REJECTED) {
                  clearInterval(paymentPollRef.current!);
                  paymentPollRef.current = null;
                  setIsPollingPayment(false);
                  toast.error(response.data.rejectionReason || 'Payment was rejected or cancelled.');
                  return;
               }
            }
         } catch (err) {
            console.error('Payment poll error', err);
         }

         if (paymentPollCountRef.current >= 10) {
            clearInterval(paymentPollRef.current!);
            paymentPollRef.current = null;
            setIsPollingPayment(false);
            toast.error('Payment not confirmed within 50 seconds. Please try again or contact support.');
         }
      }, 5000);
   };

   // Cleanup poller on unmount
   useEffect(() => {
      return () => { if (paymentPollRef.current) clearInterval(paymentPollRef.current); };
   }, []);

   useEffect(() => {
      if (verifyStatus) {
         const status = verifyStatus.status;
         if (status === VerificationStatus.PENDING_PAYMENT && activeStep < 1) setActiveStep(1);
         else if (status === VerificationStatus.PENDING_DOCS && activeStep === 1) {
            toast.success('Payment confirmed! Welcome to Documents Uploading.');
            setActiveStep(2);
         }
         else if (status === VerificationStatus.REJECTED) {
            if (activeStep !== 1) setActiveStep(1);
         }
         else if ((status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED) && activeStep < 3) setActiveStep(3);
      }
   }, [verifyStatus?.status]);

   useEffect(() => {
      fetchStatus();
   }, []);

   const handleInitiate = async () => {
      if (!phoneNumber || !phoneNumber.match(/^0[17]\d{8}$/)) {
         toast.error('Invalid M-Pesa number (Format: 07xxxxxxxx)');
         return;
      }
      setIsSubmitting(true);
      try {
         const response = await verificationService.initiate(phoneNumber);
         if (response.success) {
            toast.success(response.data.customerMessage || 'M-Pesa STK Push transmitted. Awaiting confirmation...');
            startPaymentPoller();
         }
      } catch (err: any) {
         toast.error(err.message || 'Transaction initiation failed');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleSubmitDocuments = async () => {
      if (!idFile || !passportFile || certFiles.length === 0) {
         toast.error('ID, Passport photo and at least one certificate are mandatory');
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
         toast.error(err.message || 'Document submission failed');
      } finally {
         setIsSubmitting(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-3">Accessing verification state...</p>
         </div>
      );
   }
 
    if (verifyStatus?.status === VerificationStatus.APPROVED) {
       return (
          <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
             <Card className="max-w-md w-full rounded-2xl border border-border/50 shadow-md text-center p-8 sm:p-12 bg-white">
                <div className="h-16 w-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <BadgeCheck className="h-9 w-9 text-cyan-600" />
                </div>
                <div className="space-y-2 mb-6">
                   <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Already Verified</h2>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed font-sans">
                      Your identity has already been verified. You carry the <span className="text-cyan-600 font-semibold">Verified Badge</span> on the KEDevs platform.
                   </p>
                </div>
                <Button asChild className="h-10 rounded-xl font-semibold bg-primary text-white px-8 shadow-sm">
                   <Link href="/profile/me">Go to Dashboard</Link>
                </Button>
             </Card>
          </div>
       );
    }
 
    return (
       <div className="min-h-screen bg-muted/30 pb-16 pt-8 sm:pt-12 animate-in fade-in duration-500">
          <div className="w-full max-w-4xl mx-auto px-4">
             <div className="mb-8 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Identity Verification</h1>
                <p className="text-sm font-medium text-slate-500 mt-1 font-sans">
                   Complete the verification sequence to earn your <span className="text-cyan-600 font-semibold italic">Verified Badge</span>.
                </p>
             </div>
 
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stepper Card */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                   <Card className="rounded-2xl border border-border/50 shadow-md bg-white overflow-hidden">
                      <CardHeader className="border-b border-border/50 bg-slate-50/50 p-4 sm:p-5">
                         <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Sequence Progress</h3>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-5 space-y-4">
                         {steps.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = activeStep === i;
                            const isCompleted = activeStep > i;
 
                            return (
                               <div key={step.id} className="flex items-center gap-3">
                                  <div className={cn(
                                     "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm font-semibold text-xs shrink-0",
                                     isActive ? "bg-primary text-white border-primary scale-105" :
                                        isCompleted ? "bg-cyan-600 text-white border-cyan-600" :
                                           "bg-white text-slate-300 border-slate-100"
                                  )}>
                                     {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4.5 w-4.5" />}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className={cn(
                                        "text-xs font-bold tracking-tight",
                                        isActive ? "text-primary" : "text-slate-600"
                                     )}>
                                        {step.label}
                                     </span>
                                     <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {isActive ? 'Active Phase' : isCompleted ? 'Completed' : 'Pending'}
                                     </span>
                                  </div>
                               </div>
                            );
                         })}
                      </CardContent>
                   </Card>
                </div>
 
                {/* Flow Step Card */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                   <Card className="rounded-2xl border border-border/50 shadow-md overflow-hidden bg-white">
                      <CardContent className="p-5 sm:p-8 min-h-[350px]">
                         {activeStep === 0 && (
                            <div className="space-y-6">
                               <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                     <div className="h-4.5 w-1 bg-primary rounded-full" />
                                     Phase 01: Eligibility Scan
                                  </h3>
                                  <p className="text-xs text-slate-500 font-medium font-sans">We audit your profile for baseline compliance and completeness.</p>
                               </div>
 
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {verifyStatus && Object.entries(verifyStatus.profileCompleteness).map(([req, met]) => (
                                     <Link 
                                        href="/profile/me" 
                                        key={req} 
                                        className={cn(
                                           "p-4 rounded-xl border transition-all flex items-center gap-3.5 group cursor-pointer",
                                           met ? "bg-cyan-50/20 border-cyan-100" : "bg-slate-50 border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-sm"
                                        )}
                                     >
                                        <div className={cn(
                                           "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                                           met ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-500 group-hover:bg-primary group-hover:text-white"
                                        )}>
                                           {met ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                                        </div>
                                        <div className="flex flex-col">
                                           <span className={cn("text-xs font-bold tracking-tight transition-colors truncate", met ? "text-cyan-900" : "text-slate-500 group-hover:text-primary")}>{req}</span>
                                           <span className="text-[10px] font-semibold text-slate-400">{met ? 'Verified' : 'Click to fix'}</span>
                                        </div>
                                     </Link>
                                  ))}
                               </div>
                            </div>
                         )}
 
                         {activeStep === 1 && (
                            <div className="space-y-6 text-center max-w-sm mx-auto py-4">
                               <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                                  <Smartphone className="h-7 w-7 text-primary" />
                               </div>
                               <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-slate-900">
                                     Phase 02: Transaction Authorization
                                  </h3>
                                  <p className="text-xs text-slate-500 font-medium font-sans leading-relaxed">
                                     Manual review requires a processing fee of <span className="text-slate-950 font-semibold">KES {user?.role === 'DEVELOPER' ? getPrice('VERIFIED_BADGE_DEVELOPER', '250') : getPrice('VERIFIED_BADGE_EMPLOYER', '500')}</span>.
                                  </p>
                               </div>
 
                               <div className="space-y-4">
                                  <div className="relative">
                                     <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <Input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="07xxxxxxxx"
                                        className="h-10 rounded-xl bg-slate-50 pl-9 font-semibold text-sm focus-visible:ring-primary/20"
                                     />
                                  </div>
                                  <Button
                                     className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm gap-2"
                                     onClick={handleInitiate}
                                     disabled={isSubmitting || isPollingPayment || (verifyStatus?.status !== VerificationStatus.NONE && verifyStatus?.status !== VerificationStatus.PENDING_PAYMENT && verifyStatus?.status !== VerificationStatus.REJECTED)}
                                  >
                                     {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                     {verifyStatus?.status === VerificationStatus.PENDING_DOCS ? 'Payment Confirmed' : 'Authorize STK Push'}
                                  </Button>
 
                                  {isPollingPayment && (
                                     <div className="flex items-center gap-3 p-3.5 rounded-xl bg-azure-50/50 border border-azure-100 text-left">
                                        <Loader2 className="h-4 w-4 text-azure-500 animate-spin shrink-0" />
                                        <div>
                                           <p className="text-xs font-bold text-azure-800 uppercase tracking-wider">Awaiting M-Pesa Confirmation</p>
                                           <p className="text-[10px] font-medium text-azure-500 mt-0.5">Checking every 5 seconds · up to 50 seconds</p>
                                        </div>
                                     </div>
                                  )}
                               </div>
                            </div>
                         )}
 
                         {activeStep === 2 && (
                            <div className="space-y-6">
                               <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                     <div className="h-4.5 w-1 bg-primary rounded-full" />
                                     Documents Uploading
                                  </h3>
                                  <p className="text-xs text-slate-500 font-medium font-sans">Please transmit high-fidelity copies of your identification artifacts.</p>
                               </div>
 
                               <div className="space-y-4">
                                  <input type="file" hidden ref={idRef} onChange={(e) => { const file = e.target.files?.[0] || null; if (validateFile(file)) setIdFile(file); }} />
                                  <div
                                     onClick={() => idFile ? setIdFile(null) : idRef.current?.click()}
                                     className={cn(
                                        "p-5 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative",
                                        idFile ? "bg-cyan-50/20 border-cyan-200 hover:border-danger-200" : "bg-slate-50 border-slate-100 hover:border-primary/30"
                                     )}
                                  >
                                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", idFile ? "bg-cyan-600 text-white group-hover:bg-danger-500" : "bg-white text-slate-500")}>
                                        {idFile ? <X className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                                     </div>
                                     <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-900">{idFile ? idFile.name : 'National ID / Passport Archive'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                           {idFile ? 'Click to remove' : 'PNG, JPEG, WEBP or PDF (Max 10MB)'}
                                        </p>
                                     </div>
                                  </div>
 
                                  <input type="file" hidden ref={passportRef} onChange={(e) => { const file = e.target.files?.[0] || null; if (validateFile(file)) setPassportFile(file); }} />
                                  <div
                                     onClick={() => passportFile ? setPassportFile(null) : passportRef.current?.click()}
                                     className={cn(
                                        "p-5 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative",
                                        passportFile ? "bg-cyan-50/20 border-cyan-200 hover:border-danger-200" : "bg-slate-50 border-slate-100 hover:border-primary/30"
                                     )}
                                  >
                                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", passportFile ? "bg-cyan-600 text-white group-hover:bg-danger-500" : "bg-white text-slate-500")}>
                                        {passportFile ? <X className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                                     </div>
                                     <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-900">{passportFile ? passportFile.name : 'Passport Photo'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                           {passportFile ? 'Click to remove' : 'Images only (PNG, JPEG, WEBP)'}
                                        </p>
                                     </div>
                                  </div>
 
                                  <div className="space-y-2">
                                     {certFiles.length > 0 && (
                                        <div className="space-y-2">
                                           {certFiles.map((file, idx) => (
                                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                                                 <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <div className="h-7 w-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                                       <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-700 truncate">{file.name}</span>
                                                 </div>
                                                 <button
                                                    type="button"
                                                    onClick={() => setCertFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                                                 >
                                                    <X className="h-3.5 w-3.5" />
                                                 </button>
                                              </div>
                                           ))}
                                        </div>
                                     )}
 
                                     <input type="file" hidden multiple ref={certRef} onChange={(e) => { const files = Array.from(e.target.files || []); const validFiles = files.filter(validateFile); setCertFiles(prev => [...prev, ...validFiles]); e.target.value = ''; }} />
                                     <div
                                        onClick={() => certRef.current?.click()}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 border-dashed text-center cursor-pointer hover:bg-slate-100/50 transition-all"
                                     >
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                           {certFiles.length > 0 ? `${certFiles.length} Certificate${certFiles.length === 1 ? '' : 's'} Added` : 'Professional Certificates (Required)'}
                                        </p>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}
 
                         {activeStep === 3 && (
                            <div className="space-y-6 text-center max-w-sm mx-auto py-4">
                               <div className="relative mx-auto h-16 w-16 mb-4">
                                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                  <div className={cn(
                                     "relative h-16 w-16 rounded-2xl flex items-center justify-center shadow-md",
                                     (verifyStatus?.status as string) === VerificationStatus.APPROVED ? "bg-cyan-600 text-white" : "bg-primary text-white"
                                  )}>
                                     {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? <BadgeCheck className="h-9 w-9" /> : <Clock className="h-9 w-9" />}
                                  </div>
                               </div>
 
                               <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-slate-900">
                                     {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? 'Protocol Success' : 'Under Review'}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-medium font-sans leading-relaxed">
                                     {(verifyStatus?.status as string) === VerificationStatus.APPROVED
                                        ? 'Congratulations. Your identity is verified across the KEDevs ecosystem. You now possess priority trust status.'
                                        : 'Our moderators are reviewing your credentials. This process typically completes within 24-48 hours.'}
                                  </p>
                               </div>
 
                               <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-left">
                                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                     <span className="text-slate-400">Timestamp</span>
                                     <span className="text-slate-700">{verifyStatus?.createdAt ? formatDateString(verifyStatus.createdAt) : 'N/A'}</span>
                                  </div>
                                  <Separator className="bg-slate-200/50" />
                                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                     <span className="text-slate-400">Current Phase</span>
                                     <Badge className={cn(
                                        "rounded-xl font-bold text-[9px] border-none shadow-sm px-2.5 py-0.5",
                                        (verifyStatus?.status as string) === VerificationStatus.APPROVED ? "bg-cyan-600" : "bg-azure-500"
                                     )}>
                                        {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? 'AUTHORIZED' : 'UNDER_AUDIT'}
                                     </Badge>
                                  </div>
                               </div>
 
                               <Button asChild className="h-10 rounded-xl px-8 font-semibold bg-primary text-white shadow-sm">
                                  <Link href="/profile/me">Access Profile</Link>
                               </Button>
                            </div>
                         )}
 
                         {activeStep < 3 && (
                            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                               <Button
                                  variant="ghost"
                                  className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider gap-1.5 disabled:opacity-0"
                                  onClick={() => setActiveStep(prev => prev - 1)}
                                  disabled={activeStep === 0 || isPollingPayment}
                               >
                                  <ChevronLeft className="h-3.5 w-3.5" /> Backtrack
                               </Button>
 
                               <Button
                                  className="h-10 rounded-xl px-5 font-semibold bg-primary text-white shadow-sm text-sm group"
                                  onClick={() => activeStep === 2 ? handleSubmitDocuments() : setActiveStep(prev => prev + 1)}
                                  disabled={
                                     isSubmitting ||
                                     isPollingPayment ||
                                     (activeStep === 0 && !verifyStatus?.isEligible) ||
                                     (activeStep === 1 && verifyStatus?.status !== VerificationStatus.PENDING_DOCS) ||
                                     (activeStep === 2 && (!idFile || !passportFile || certFiles.length === 0))
                                  }
                               >
                                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : activeStep === 2 ? <ShieldCheck className="h-4 w-4 mr-1.5" /> : null}
                                  {activeStep === 2 ? 'Get Verified' : 'Proceed'}
                                  {activeStep < 2 && <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                               </Button>
                            </div>
                         )}
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>
       </div>
    );
}
