'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks';
import type { Role } from '@/lib/types/user';

// ── AuthGuard — redirect to /login if not authenticated ───────────────────

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// ── RoleGuard — redirect to /feed if role doesn't match ──────────────────

interface RoleGuardProps {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: string;
}

export function RoleGuard({ role, children, fallback = '/feed' }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowedRolesStr = Array.isArray(role) ? role.join(',') : role;

  useEffect(() => {
    const allowed = allowedRolesStr.split(',');
    if (!isLoading && user && !allowed.includes(user.role)) {
      router.replace(fallback);
    }
  }, [user, isLoading, router, allowedRolesStr, fallback]);

  if (isLoading || !user || !allowedRolesStr.split(',').includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// ── AdminGuard — redirect to /feed if not ADMIN ───────────────────────────

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ADMIN" fallback="/feed">
      {children}
    </RoleGuard>
  );
}
