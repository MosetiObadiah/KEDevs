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
      try {
         const response = await verificationService.getStatus();
         if (response.success) {
            setVerifyStatus(response.data);
            const status = response.data.status;
            if (status === VerificationStatus.PENDING_PAYMENT && activeStep < 1) setActiveStep(1);
            else if (status === VerificationStatus.PENDING_DOCS && activeStep < 2) setActiveStep(2);
            else if ((status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED || status === VerificationStatus.REJECTED) && activeStep < 3) setActiveStep(3);
         }
      } catch (err) {
         console.error('Failed to fetch verification status', err);
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
         toast.error(err.message || 'Document submission failed');
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

   // Prevent re-verification if already approved/verified
   if (verifyStatus?.status === VerificationStatus.APPROVED) {
      return (
         <div className="min-h-screen bg-muted/30 pb-20 pt-12 animate-in fade-in duration-700">
            <div className="container mx-auto px-6 max-w-2xl">
               <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                  <CardContent className="p-16 text-center space-y-8">
                     <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                        <BadgeCheck className="h-12 w-12 text-emerald-500" />
                     </div>
                     <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900">Already Verified</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                           Your identity has already been verified. You carry the <span className="text-emerald-600 font-black">Verified Badge</span> on the KEDevs platform.
                        </p>
                     </div>
                     <Button asChild className="h-14 rounded-2xl font-black bg-slate-900 px-10 shadow-xl">
                        <Link href="/profile/me">Go to Dashboard</Link>
                     </Button>
                  </CardContent>
               </Card>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-muted/30 pb-20 pt-12 animate-in fade-in duration-700">
         <div className="container mx-auto px-6 max-w-6xl">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-2">
                  <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1">
                     Trust Protocol
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Identity Verification</h1>
                  <p className="text-muted-foreground font-semibold text-lg leading-relaxed">
                     Complete the verification sequence to earn your <span className="text-emerald-500 font-black italic">Verified Badge</span>.
                  </p>
               </div>
            </div>

            {verifyStatus?.status === VerificationStatus.REJECTED ? (
               <Card className="rounded-[2.5rem] border-none shadow-xl shadow-red-500/5 overflow-hidden bg-white">
                  <CardContent className="p-16 text-center space-y-8">
                     <div className="h-24 w-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto">
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
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Sidebar: Progress */}
                  <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
                     <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white sticky top-24 overflow-hidden">
                        <CardHeader className="pb-4 pt-8 px-8">
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Sequence Progress</h3>
                        </CardHeader>
                        <CardContent className="px-8 pb-10 space-y-6">
                           {steps.map((step, i) => {
                              const Icon = step.icon;
                              const isActive = activeStep === i;
                              const isCompleted = activeStep > i;

                              return (
                                 <div key={step.id} className="flex items-center gap-4 group">
                                    <div className={cn(
                                       "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                                       isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" :
                                          isCompleted ? "bg-emerald-500 text-white border-emerald-500" :
                                             "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                       {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className={cn(
                                          "text-xs font-black uppercase tracking-wider",
                                          isActive ? "text-primary" : "text-slate-500"
                                       )}>
                                          {step.label}
                                       </span>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          {isActive ? 'Active Phase' : isCompleted ? 'Completed' : 'Pending'}
                                       </span>
                                    </div>
                                 </div>
                              );
                           })}
                        </CardContent>
                     </Card>

                  </div>

                  {/* Main Content Area */}
                  <div className="lg:col-span-2 order-1 lg:order-2 space-y-10">
                     <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                        <CardContent className="p-10 md:p-14">
                           {activeStep === 0 && (
                              <div className="space-y-10">
                                 <div className="space-y-4">
                                    <h3 className="text-2xl font-black flex items-center gap-2">
                                       <div className="h-6 w-1.5 bg-primary rounded-full" />
                                       Phase 01: Eligibility Scan
                                    </h3>
                                    <p className="text-muted-foreground font-medium italic leading-relaxed">We audit your profile for baseline compliance and completeness.</p>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {verifyStatus && Object.entries(verifyStatus.profileCompleteness).map(([req, met]) => (
                                       <div key={req} className={cn(
                                          "p-5 rounded-2xl border transition-all flex items-center gap-4",
                                          met ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-100"
                                       )}>
                                          <div className={cn(
                                             "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                             met ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                                          )}>
                                             {met ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className={cn("text-xs font-black uppercase tracking-widest", met ? "text-emerald-900" : "text-slate-400")}>{req}</span>
                                             <span className="text-[10px] font-bold text-slate-400">{met ? 'Verified' : 'Action Required'}</span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                              </div>
                           )}

                           {activeStep === 1 && (
                              <div className="space-y-10 text-center">
                                 <div className="h-20 w-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Smartphone className="h-10 w-10 text-primary" />
                                 </div>
                                 <div className="space-y-4">
                                    <h3 className="text-2xl font-black flex items-center justify-center gap-2">
                                       <div className="h-6 w-1.5 bg-primary rounded-full" />
                                       Phase 02: Transaction Authorization
                                    </h3>
                                    <p className="text-muted-foreground font-medium italic leading-relaxed">
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
                                       disabled={isSubmitting || isPollingPayment || (verifyStatus?.status !== VerificationStatus.NONE && verifyStatus?.status !== VerificationStatus.PENDING_PAYMENT)}
                                    >
                                       {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                                       {verifyStatus?.status === VerificationStatus.PENDING_DOCS ? 'Payment Confirmed' : 'Authorize STK Push'}
                                    </Button>

                                    {isPollingPayment && (
                                       <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                                          <div className="text-left">
                                             <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Awaiting M-Pesa Confirmation</p>
                                             <p className="text-[10px] font-medium text-amber-600 mt-0.5">Checking every 5 seconds · up to 50 seconds</p>
                                          </div>
                                       </div>
                                    )}

                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Encrypted M-Pesa Direct Interface</p>
                                 </div>
                              </div>
                           )}

                           {activeStep === 2 && (
                              <div className="space-y-10">
                                 <div className="space-y-4">
                                    <h3 className="text-2xl font-black flex items-center gap-2">
                                       <div className="h-6 w-1.5 bg-primary rounded-full" />
                                       Phase 03: Digital Vault Upload
                                    </h3>
                                    <p className="text-muted-foreground font-medium italic leading-relaxed">Please transmit high-fidelity copies of your identification artifacts.</p>
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
                                       (verifyStatus?.status as string) === VerificationStatus.APPROVED ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                                    )}>
                                       {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? <BadgeCheck className="h-16 w-16" /> : <Clock className="h-16 w-16 animate-spin-slow" />}
                                    </div>
                                 </div>

                                 <div className="space-y-4 max-w-lg mx-auto">
                                    <h3 className="text-3xl font-black flex items-center justify-center gap-2">
                                       <div className="h-6 w-1.5 bg-primary rounded-full" />
                                       {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? 'Protocol Success' : 'Review Sequence Active'}
                                    </h3>
                                    <p className="text-muted-foreground font-medium italic leading-relaxed">
                                       {(verifyStatus?.status as string) === VerificationStatus.APPROVED
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
                                          (verifyStatus?.status as string) === VerificationStatus.APPROVED ? "bg-emerald-500" : "bg-amber-500"
                                       )}>
                                          {(verifyStatus?.status as string) === VerificationStatus.APPROVED ? 'AUTHORIZED' : 'UNDER_AUDIT'}
                                       </Badge>
                                    </div>
                                 </div>

                                 <Button asChild className="h-16 rounded-[2rem] px-12 font-black bg-slate-900 shadow-2xl shadow-slate-900/20 text-lg">
                                    <Link href="/profile/me">Access Profile</Link>
                                 </Button>
                              </div>
                           )}

                           {activeStep < 3 && (
                              <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
                                 <Button
                                    variant="ghost"
                                    className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 disabled:opacity-0"
                                    onClick={() => setActiveStep(prev => prev - 1)}
                                    disabled={activeStep === 0 || isPollingPayment}
                                 >
                                    <ChevronLeft className="h-4 w-4" /> Backtrack
                                 </Button>

                                 <Button
                                    className="h-16 rounded-2xl px-12 font-black bg-primary text-white shadow-xl shadow-primary/20 text-lg group"
                                    onClick={() => activeStep === 2 ? handleSubmitDocuments() : setActiveStep(prev => prev + 1)}
                                    disabled={
                                       isSubmitting ||
                                       isPollingPayment ||
                                       // Step 0: proceed blocked if profile not eligible
                                       (activeStep === 0 && !verifyStatus?.isEligible) ||
                                       // Step 1: proceed blocked only if payment is NOT yet confirmed (status is still PENDING_PAYMENT or NONE)
                                       (activeStep === 1 && verifyStatus?.status !== VerificationStatus.PENDING_DOCS)
                                    }
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
               </div>
            )}
         </div>
      </div>
   );
}
