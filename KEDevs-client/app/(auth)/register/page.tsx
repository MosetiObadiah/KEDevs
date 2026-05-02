'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Briefcase, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleButton } from '@/components/auth/google-button';

type RegisterableRole = 'DEVELOPER' | 'EMPLOYER';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['DEVELOPER', 'EMPLOYER'] as [RegisterableRole, ...RegisterableRole[]]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES: { value: RegisterableRole; label: string; description: string; icon: typeof Code2 }[] = [
  {
    value: 'DEVELOPER',
    label: 'Developer',
    description: 'Find jobs & showcase skills',
    icon: Code2,
  },
  {
    value: 'EMPLOYER',
    label: 'Employer',
    description: 'Hire top Kenyan talent',
    icon: Briefcase,
  },
];

export default function RegisterPage() {
  const { register: registerUser, user } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/feed');
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'DEVELOPER' },
  });

  const selectedRole = watch('role');

  async function onSubmit(data: RegisterFormData) {
    try {
      const { userId } = await registerUser({
        email: data.email,
        password: data.password,
        fullName: `${data.firstName} ${data.lastName}`,
        role: data.role,
      });
      toast.success('Account created! Check your email for a verification code.');
      router.replace(`/verify-email?userId=${userId}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Registration failed';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { message: msg });
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-sage/60 text-sm">Join Kenya&apos;s developer community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div className="space-y-2">
          <Label className="text-sage text-sm">I am a…</Label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center',
                  selectedRole === value
                    ? 'border-teal bg-teal/15 text-white'
                    : 'border-sage/20 bg-white/5 text-sage/60 hover:border-sage/40 hover:text-sage'
                )}
              >
                <Icon className={cn('w-6 h-6', selectedRole === value ? 'text-teal' : '')} />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs opacity-70">{description}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-red-400 text-xs">{errors.role.message}</p>}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-first" className="text-sage text-sm">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
              <Input
                id="reg-first"
                placeholder="Jane"
                className="pl-9 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-last" className="text-sage text-sm">Last name</Label>
            <Input
              id="reg-last"
              placeholder="Doe"
              className="bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...register('lastName')}
            />
            {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-sage text-sm">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-sage text-sm">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm" className="text-sage text-sm">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
            <Input
              id="reg-confirm"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="pl-10 bg-white/5 border-sage/20 text-white placeholder:text-sage/30 focus:border-teal"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold h-11 transition-all shadow-lg shadow-teal/20 mt-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account…</>
          ) : (
            'Create account'
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

      <GoogleButton mode="register" role={selectedRole} />

      <p className="mt-5 text-center text-sm text-sage/50">
        Already have an account?{' '}
        <Link href="/login" className="text-fern hover:text-teal transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
