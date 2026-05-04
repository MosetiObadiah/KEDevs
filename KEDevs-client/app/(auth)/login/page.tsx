'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { GoogleButton } from '@/components/auth/google-button';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? null;
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Redirect ADMIN users to admin panel, others to dashboard
      // If 'from' is present but it's just the generic dashboard, prioritize /admin for admins
      const effectiveFrom = (user.role === 'ADMIN' && from === '/dashboard') ? null : from;
      const redirectTo = effectiveFrom || (user.role === 'ADMIN' ? '/admin' : '/dashboard');
      
      console.log('Login redirect:', { user: user.fullName, role: user.role, redirectTo });
      router.replace(redirectTo);
    }
  }, [user, router, from]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setUnverifiedUserId(null);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      // Let the useEffect handle the redirect based on user role
    } catch (error: any) {
      const msg = error.message ?? 'Login failed';
      const status = error.status;
      const userId = error.data?.userId;

      if (status === 403 && msg.toLowerCase().includes('not verified') && userId) {
        setUnverifiedUserId(userId);
        return;
      }

      if (msg.toLowerCase().includes('password')) {
        setError('password', { message: msg });
      } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user')) {
        setError('email', { message: msg });
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sage/60 text-sm">Sign in to your KEDevs account</p>
      </div>

      {unverifiedUserId && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-yellow-200/80 text-sm font-medium">Verification Required</p>
          <p className="text-yellow-200/60 text-xs">
            Please verify your email address to activate your account.
          </p>
          <Button
            onClick={() => router.replace(`/verify-email?userId=${unverifiedUserId}&redirect=${encodeURIComponent(from || '/dashboard')}`)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-9 text-xs"
          >
            Verify Email Now
          </Button>
        </div>
      )}


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-sage text-sm">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal focus:ring-teal/20"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-sage text-sm">
              Password
            </Label>
            <Link
              href="/reset-password"
              className="text-xs text-fern hover:text-teal transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage/40 hover:text-sage transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-xs text-sage/40 hover:text-teal transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold h-11 transition-all duration-200 shadow-lg shadow-teal/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-sage/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#2F3E46] px-2 text-sage/40">Or continue with</span>
        </div>
      </div>

      <GoogleButton mode="login" />

      <p className="mt-6 text-center text-sm text-sage/50">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-fern hover:text-teal transition-colors font-medium">
          Create one
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-teal animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
