'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword, resetPassword } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

// ── Forgot password form (request code) ──────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

// ── Reset password form (submit code + new password) ──────────────────────
const resetSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    code: z.string().length(6, 'Code must be exactly 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState('');

  // ── Forgot password ─────────────────────────────────────────────────────
  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const { mutate: sendForgot, isPending: isSending } = useMutation({
    mutationFn: (data: ForgotFormData) => forgotPassword(data.email),
    onSuccess: (_, variables) => {
      setRequestedEmail(variables.email);
      setEmailSent(true);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to send reset email.'),
  });

  // ── Reset password ──────────────────────────────────────────────────────
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: requestedEmail },
  });

  // Update default email value when requestedEmail changes
  if (requestedEmail && !resetForm.getValues('email')) {
    resetForm.setValue('email', requestedEmail);
  }

  const { mutate: submitReset, isPending: isResetting } = useMutation({
    mutationFn: (data: ResetFormData) => resetPassword(data.email, data.code, data.password),
    onSuccess: () => {
      toast.success('Password reset successfully! You can now log in.');
      router.replace('/login');
    },
    onError: (err: Error) => toast.error(err.message ?? 'Invalid or expired reset code.'),
  });

  // ── Step 1: Request code ────────────────────────────────────────────────
  if (!emailSent) {
    return (
      <>
        <div className="mb-7">
          <Link href="/login" className="text-sage/50 hover:text-sage text-sm inline-flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Forgot password?</h1>
          <p className="text-sage/60 text-sm">Enter your email and we&apos;ll send you a reset code.</p>
        </div>

        <form onSubmit={forgotForm.handleSubmit((d) => sendForgot(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sage text-sm">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
                {...forgotForm.register('email')}
              />
            </div>
            {forgotForm.formState.errors.email && (
              <p className="text-red-400 text-xs">{forgotForm.formState.errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSending}
            className="w-full gradient-primary hover:opacity-90 text-white font-semibold h-11 shadow-lg shadow-teal/20"
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
            ) : (
              'Send reset code'
            )}
          </Button>
        </form>
      </>
    );
  }

  // ── Step 2: Submit code + new password ──────────────────────────────────
  return (
    <>
      <div className="mb-7 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-teal" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
        <p className="text-sage/60 text-sm leading-relaxed">
          We sent a 6-digit code to <span className="text-white font-medium">{requestedEmail}</span>.
        </p>
      </div>

      <form onSubmit={resetForm.handleSubmit((d) => submitReset(d))} className="space-y-4">
        {/* Hidden email field if we want to allow editing, but here we just pass it from state */}
        <input type="hidden" {...resetForm.register('email')} />

        <div className="space-y-1.5">
          <Label htmlFor="reset-code" className="text-sage text-sm">Verification code</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="reset-code"
              placeholder="123456"
              maxLength={6}
              className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...resetForm.register('code')}
            />
          </div>
          {resetForm.formState.errors.code && (
            <p className="text-red-400 text-xs">{resetForm.formState.errors.code.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-sage text-sm">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className="pl-10 pr-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...resetForm.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage/40 hover:text-sage transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {resetForm.formState.errors.password && (
            <p className="text-red-400 text-xs">{resetForm.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-sage text-sm">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...resetForm.register('confirmPassword')}
            />
          </div>
          {resetForm.formState.errors.confirmPassword && (
            <p className="text-red-400 text-xs">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isResetting}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold h-11 shadow-lg shadow-teal/20"
        >
          {isResetting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting…</>
          ) : (
            'Reset password'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setEmailSent(false)}
          className="w-full text-sage/40 hover:text-sage hover:bg-white/5 text-xs h-8"
        >
          Didn&apos;t receive a code? Try again
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-teal animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
