'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks';
import type { Role } from '@/lib/types/user';

// ── AuthGuard — redirect to /login if not authenticated ───────────────────

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// ── RoleGuard — redirect to /dashboard if role doesn't match ──────────────────

interface RoleGuardProps {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: string;
}

export function RoleGuard({ role, children, fallback = '/dashboard' }: RoleGuardProps) {
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

// ── AdminGuard — redirect to /dashboard if not ADMIN ───────────────────────────

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ADMIN" fallback="/dashboard">
      {children}
    </RoleGuard>
  );
}
