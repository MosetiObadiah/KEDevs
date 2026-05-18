'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';

const publicRoutes = ['/', '/login', '/register', '/jobs', '/developers', '/companies', '/contact', '/verify-email', '/reset-password', '/spotlight'];
const devOnboarding = '/onboarding/developer';
const empOnboarding = '/onboarding/employer';
const pendingApproval = '/pending-approval';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isOnboarded, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checkIsPublicRoute = (path: string): boolean => {
    if (!path) return false;

    // Exact public paths
    const exactPublics = [
      '/',
      '/login',
      '/register',
      '/jobs',
      '/developers',
      '/companies',
      '/contact',
      '/verify-email',
      '/reset-password',
      '/spotlight'
    ];

    if (exactPublics.includes(path)) return true;

    // Check dynamic verify-email page: /verify-email/[id]
    const verifyEmailRegex = /^\/verify-email\/[^\/]+$/;
    if (verifyEmailRegex.test(path)) {
      return true;
    }

    // Check dynamic job detail page: /jobs/[id] (where [id] is a UUID/slug, but not special paths)
    // Avoid matching /jobs/post, /jobs/my-applications, /jobs/my-posts, etc.
    const genericJobDetailRegex = /^\/jobs\/[^\/]+$/;
    if (genericJobDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedJobPaths = ['post', 'my-applications', 'my-posts', 'edit'];
      if (!protectedJobPaths.includes(segment)) {
        return true;
      }
    }

    // Check dynamic developer detail page: /developers/[id]
    // Avoid matching edit, onboarding, etc.
    const developerDetailRegex = /^\/developers\/[^\/]+$/;
    if (developerDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedDevPaths = ['edit', 'onboarding'];
      if (!protectedDevPaths.includes(segment)) {
        return true;
      }
    }

    // Check dynamic company detail page: /companies/[id]
    const companyDetailRegex = /^\/companies\/[^\/]+$/;
    if (companyDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedCompanyPaths = ['edit', 'new'];
      if (!protectedCompanyPaths.includes(segment)) {
        return true;
      }
    }

    return false;
  };

  const isPublicRoute = checkIsPublicRoute(pathname || '');

  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn && user) {
      // 0. If user is SUSPENDED or BANNED, let AppLayout intercept rendering completely and skip redirects
      if (user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
        return;
      }

      const isDev = user.role === 'DEVELOPER';
      const isEmp = user.role === 'EMPLOYER';
      const isAdmin = user.role === 'ADMIN';

      // 1. Skip onboarding for ADMIN
      if (isAdmin) {
        if (pathname === devOnboarding || pathname === empOnboarding || pathname === pendingApproval) {
          router.push('/admin/dashboard');
        }
        return;
      }

      // 1.5. Force Email Verification for unverified users
      if (!user.isEmailVerified) {
        const verifyEmailPath = `/verify-email/${user.id}`;
        if (pathname !== verifyEmailPath) {
          router.push(verifyEmailPath);
          return;
        }
        return; // stay on verify email page, don't execute onboarding redirect
      }

      // Prevent accessing verify-email if already verified
      const verifyEmailRegex = /^\/verify-email\/[^\/]+$/;
      if (user.isEmailVerified && verifyEmailRegex.test(pathname || '')) {
        router.push(isDev ? '/jobs' : (isEmp ? '/developers' : '/admin/dashboard'));
        return;
      }

      const onboardingPath = isDev ? devOnboarding : empOnboarding;

      // 2. Force Onboarding
      if (!isOnboarded && pathname !== onboardingPath) {
        router.push(onboardingPath);
        return;
      }

      // 3. Force Approval for Employers
      if (isOnboarded && isEmp && !user.isApproved && pathname !== pendingApproval && pathname !== empOnboarding) {
        router.push(pendingApproval);
        return;
      }

      // 4. Prevent accessing onboarding/pending if already done
      if (isOnboarded && (pathname === devOnboarding || pathname === empOnboarding)) {
        router.push('/developers');
        return;
      }
      if (isEmp && user.isApproved && pathname === pendingApproval) {
        router.push('/developers');
        return;
      }

      // 5. Prevent accessing login/register if already logged in
      if (pathname === '/login' || pathname === '/register') {
        router.push(isDev ? '/jobs' : (isEmp ? '/developers' : '/admin/dashboard'));
        return;
      }

    } else if (!isPublicRoute) {
      router.push('/login');
    }
  }, [isLoggedIn, isOnboarded, user, pathname, router, isLoading, isPublicRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-white animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-16 w-16 bg-primary/5 rounded-xl-[1.5rem] flex items-center justify-center animate-pulse">
            <Zap className="h-8 w-8 text-primary fill-primary" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synchronizing Session</p>
          <p className="text-sm font-medium text-slate-900 italic">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content
  if (!isLoggedIn && !isPublicRoute) {
    return null;
  }

  // Prevent flash if email verification is required
  if (isLoggedIn && user && !user.isEmailVerified) {
    if (pathname !== `/verify-email/${user.id}`) {
      return null;
    }
  }

  // Prevent flash of protected content if onboarding is required
  if (isLoggedIn && user && user.role !== 'ADMIN' && !isOnboarded) {
    const onboardingPath = user.role === 'DEVELOPER' ? devOnboarding : empOnboarding;
    if (pathname !== onboardingPath) {
      return null;
    }
  }

  // Prevent flash for Employers awaiting approval
  if (isLoggedIn && user && user.role === 'EMPLOYER' && isOnboarded && !user.isApproved && pathname !== pendingApproval && pathname !== empOnboarding) {
    return null;
  }

  return <>{children}</>;
}
