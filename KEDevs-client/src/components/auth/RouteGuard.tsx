// src/components/auth/RouteGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const publicRoutes = ['/', '/login', '/register', '/jobs', '/developers', '/companies', '/verify-email', '/reset-password'];
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
      const isDev = user.userType === 'DEVELOPER';
      const isEmp = user.userType === 'EMPLOYER';
      const onboardingPath = isDev ? devOnboarding : empOnboarding;

      // 1. Force Onboarding
      if (!isOnboarded && pathname !== onboardingPath) {
        router.push(onboardingPath);
        return;
      }

      // 2. Force Approval for Employers
      if (isOnboarded && isEmp && !user.isApproved && pathname !== pendingApproval && pathname !== empOnboarding) {
        router.push(pendingApproval);
        return;
      }

      // 3. Prevent accessing onboarding/pending if already done
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
