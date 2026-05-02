'use client';

import { useRef, useState, KeyboardEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { verifyEmail, resendVerification } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, MailCheck, RefreshCw } from 'lucide-react';

const CODE_LENGTH = 6;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') ?? '';

  const { completeAuth } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ── Verify mutation ─────────────────────────────────────────────────────
  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: () => verifyEmail(userId, digits.join('')),
    onSuccess: (data) => {
      toast.success('Account verified successfully!');
      completeAuth(data);
      
      const redirect = searchParams.get('redirect') ?? '/profile/me';
      router.replace(redirect);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Invalid or expired code. Please try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    },
  });

  // ── Resend mutation ─────────────────────────────────────────────────────
  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () => resendVerification(userId),
    onSuccess: () => {
      toast.success('A new code has been sent to your email.');
      setCountdown(60);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not resend code.'),
  });

  // ── OTP input handlers ──────────────────────────────────────────────────
  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (next.every((d) => d !== '') && char) {
      verify();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    [...pasted].forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
    if (next.every((d) => d !== '')) verify();
  }

  const isComplete = digits.every((d) => d !== '');


  return (
    <>
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-teal/20 border border-teal/30 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-teal" />
        </div>
      </div>

      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-sage/60 text-sm leading-relaxed">
          We sent a 6-digit verification code to your email. Enter it below to activate your account.
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <Input
            key={i}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={(el) => { inputRefs.current[i] = el; }}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-11 h-12 text-center text-lg font-bold bg-white/5 border-sage/20 text-white
              focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all duration-200
              ${digit ? 'border-teal/60 bg-teal/10' : ''}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => verify()}
          disabled={!isComplete || isVerifying}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold h-11 shadow-lg shadow-teal/20"
        >
          {isVerifying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
          ) : (
            'Verify email'
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => resend()}
          disabled={isResending || !userId || countdown > 0}
          className="w-full text-sage/60 hover:text-sage hover:bg-white/5"
        >
          {isResending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resending…</>
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" />Resend code</>
          )}
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-sage/40">
        Wrong email?{' '}
        <a href="/register" className="text-fern hover:text-teal transition-colors">
          Go back
        </a>
      </p>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-teal animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
