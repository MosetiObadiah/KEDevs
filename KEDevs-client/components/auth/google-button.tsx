'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Role } from '@/lib/types/user';

interface GoogleButtonProps {
  mode: 'login' | 'register';
  role?: Role;
}

export function GoogleButton({ mode, role }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { googleAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/feed';

  async function handleGoogleClick() {
    // In a real app, you would use a Google SDK to get an ID token.
    // For this demo, we'll prompt for a mock token to trigger the backend flow.
    const mockToken = prompt('Enter a mock Google ID Token for testing (any string):');
    if (!mockToken) return;

    setIsLoading(true);
    try {
      const data = await googleAuth(mockToken, role);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created with Google!');
      
      // If unapproved employer, they stay in restricted state but we redirect them to dashboard
      router.replace(from);
    } catch (error: any) {
      toast.error(error.message ?? 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      onClick={handleGoogleClick}
      className="w-full bg-white/5 border-sage/20 text-white hover:bg-white/10 hover:border-sage/40 h-11 transition-all flex items-center justify-center gap-3"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-teal" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
    </Button>
  );
}
