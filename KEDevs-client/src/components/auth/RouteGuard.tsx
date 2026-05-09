// src/components/auth/RouteGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

const publicRoutes = ['/', '/login', '/register', '/jobs', '/developers', '/companies', '/contact', '/verify-email', '/reset-password'];
const devOnboarding = '/onboarding/developer';
const empOnboarding = '/onboarding/employer';
const pendingApproval = '/pending-approval';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isOnboarded, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (isLoading) return;

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prevent flash of protected content
  if (!isLoggedIn && !isPublicRoute) {
    return null;
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
