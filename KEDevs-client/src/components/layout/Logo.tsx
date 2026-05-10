'use client';

import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

export function Logo() {
  const { isLoggedIn, user } = useAuth();
  
  let href = '/';
  if (isLoggedIn && user) {
    if (user.role === 'DEVELOPER') {
      href = '/jobs';
    } else if (user.role === 'EMPLOYER') {
      href = '/developers';
    } else if (user.role === 'ADMIN') {
      href = '/admin';
    }
  }

  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="text-xl font-bold tracking-tight text-primary">
        KEDevs<span className="text-foreground/50">.</span>
      </span>
    </Link>
  );
}
