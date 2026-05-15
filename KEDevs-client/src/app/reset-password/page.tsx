'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email.trim());
      if (response.success) {
        toast.success('Reset code dispatched to your inbox!');
        setSuccessMessage(`A verification code has been sent to ${email}. Please check your inbox.`);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process request. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.confirmPasswordReset(email.trim(), code.trim(), newPassword);
      if (response.success) {
        toast.success('Password secured successfully!');
        setSuccessMessage('Your password has been successfully reset.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code or expired link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
           <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 mb-4">
              IDENTITY PROTECTION
           </span>
           <h1 className="text-4xl font-black tracking-tight text-slate-900">
             {step === 1 ? 'Recover Account' : 'Reset Password'}
           </h1>
           <p className="text-slate-500 font-semibold mt-2">
             {step === 1 
               ? "Retrieve your dashboard access safely" 
               : "Finalize your new secure credentials"}
           </p>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden bg-white">
          <CardContent className="p-8 md:p-10">
            
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-900 mb-6 animate-in shake duration-300">
                 <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                 <p className="text-xs font-black">{error}</p>
              </div>
            )}

            {successMessage && step === 2 && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 mb-6 animate-in slide-in-from-top-4">
                 <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                 <p className="text-xs font-bold">{successMessage}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="jane@example.com" 
                      className="pl-11 h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  {loading ? 'Sending Code...' : 'Submit Request'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Enter 6-digit code" 
                        className="pl-11 h-14 rounded-2xl border-slate-200 font-bold tracking-widest focus-visible:ring-primary/20"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-11 h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-11 h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {loading ? 'Securing Password...' : 'Update Password'}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center w-full text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest gap-2"
                >
                  <ArrowLeft className="h-3 w-3" /> Change Email Address
                </button>
              </form>
            )}

          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 flex justify-center border-t border-slate-100">
             <p className="text-sm font-bold text-slate-500">
                Remembered it? <Link href="/login" className="text-primary font-black hover:underline ml-1">Sign In</Link>
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
