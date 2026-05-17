'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MailCheck,
  ArrowRight,
  RefreshCcw,
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function VerifyEmailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuthData } = useAuth();

  const handleVerify = async () => {
    if (!userId || code.length !== 6) return;

    setError(null);
    setLoading(true);
    try {
      const response = await authService.verifyEmail(userId as string, code);
      if (response.success) {
        const { accessToken, refreshToken, userId, email, fullName, role, emailVerified, requiresApproval } = response.data;

        const userData = {
          id: userId,
          email,
          fullName,
          role,
          isEmailVerified: true,
          isApproved: !requiresApproval,
          isVerified: false
        };

        setAuthData(userData, accessToken, refreshToken);
        toast.success('Email verified successfully!');

        if (role === 'DEVELOPER') router.push('/onboarding/developer');
        else if (role === 'EMPLOYER') router.push('/onboarding/employer');
        else if (role === 'ADMIN') router.push('/admin/dashboard');
        else router.push('/feed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-40 -mt-40" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -mr-40 -mb-40" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 bg-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 relative">
              <MailCheck className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-4 mb-10">
              <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-3 py-1">
                SECURITY SYNC
              </Badge>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity Check</h1>
              <p className="text-sm font-medium text-slate-500">
                We've transmitted a <span className="text-slate-900 font-black">6-digit access code</span> to your inbox. Please enter it below.
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}

              <div className="relative">
                <Input
                  placeholder="000000"
                  className="h-20 rounded-2xl bg-slate-50 border-none text-center text-4xl font-black tracking-[0.5em] focus-visible:ring-primary/20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <Button
                className="w-full h-14 rounded-2xl font-black bg-slate-900 text-white shadow-xl shadow-slate-900/10 gap-2"
                disabled={loading || code.length !== 6}
                onClick={handleVerify}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                Verify Account
              </Button>

              <div className="pt-4 space-y-4">
                <p className="text-xs font-bold text-slate-400">Didn't receive the transmission?</p>
                <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                  <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Resend Access Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
