'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LockKeyhole, 
  Mail, 
  ShieldCheck, 
  Key, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
      toast.success('Reset code transmitted');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-40 -mb-40" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 relative">
               <LockKeyhole className="h-10 w-10 text-white" />
               <div className="absolute -top-2 -right-2 bg-primary rounded-xl p-1.5 shadow-lg border-2 border-white">
                  <Key className="h-4 w-4 text-white" />
               </div>
            </div>

            <div className="space-y-4 mb-10">
               <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-slate-50 text-slate-400 border-slate-100 px-3 py-1">
                  SECURITY PROTOCOL
               </Badge>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reset Access</h1>
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Enter your registered <span className="text-slate-900 font-bold italic">identity email</span> and we'll transmit a secure synchronization code.
                </p>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                   <Input 
                      placeholder="identity@kedevs.com" 
                      type="email"
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-12 font-bold focus-visible:ring-primary/20"
                   />
                </div>
                <Button 
                   className="w-full h-14 rounded-2xl font-black bg-slate-900 text-white shadow-xl shadow-slate-900/10 gap-2"
                   onClick={handleSendCode}
                   disabled={loading}
                >
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                   Send Recovery Code
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Apply the <span className="text-slate-900 font-black italic">6-digit code</span> and establish a new secure access key.
                </p>
                <div className="space-y-3">
                   <Input 
                      placeholder="000000" 
                      className="h-14 rounded-2xl bg-slate-50 border-none text-center text-xl font-black tracking-widest"
                   />
                   <Input 
                      placeholder="New Secure Password" 
                      type="password"
                      className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
                   />
                   <Input 
                      placeholder="Confirm New Password" 
                      type="password"
                      className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
                   />
                </div>
                <Button 
                   className="w-full h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/10 gap-2"
                >
                   <ShieldCheck className="h-5 w-5" />
                   Re-establish Access
                </Button>
              </div>
            )}

            <div className="mt-10">
               <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-primary font-black uppercase text-[10px] tracking-widest transition-all group">
                  <ChevronLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-1" />
                  Return to Login
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
