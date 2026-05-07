// src/components/auth/RouteGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const publicRoutes = ['/', '/login', '/register', '/jobs', '/developers', '/companies', '/contact', '/verify-email', '/reset-password'];
const devOnboarding = '/onboarding/developer';
const empOnboarding = '/onboarding/employer';
const pendingApproval = '/pending-approval';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isOnboarded, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isLoggedIn && user) {
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
        router.push('/feed');
        return;
      }
      if (isEmp && user.isApproved && pathname === pendingApproval) {
        router.push('/feed');
        return;
      }

    } else if (!isPublicRoute) {
      router.push('/login');
    }
  }, [isLoggedIn, isOnboarded, user, pathname, router]);

  return <>{children}</>;
}
