'use client';

import { useState, useEffect } from 'react';
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

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleButton({ mode, role }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { googleAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/feed';

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      use_fedcm_for_prompt: true,
      callback: async (response: any) => {
        setIsLoading(true);
        try {
          await googleAuth(response.credential, role);
          toast.success(mode === 'login' ? 'Welcome back!' : 'Account created with Google!');
          router.replace(from);
        } catch (error: any) {
          toast.error(error.message ?? 'Google authentication failed');
        } finally {
          setIsLoading(false);
        }
      },
    });

    // Render the official Google button into our container
    window.google.accounts.id.renderButton(
      document.getElementById('google-button-container'),
      { 
        theme: 'outline', 
        size: 'large', 
        width: 380, // Matches our card width
        shape: 'pill',
        text: mode === 'login' ? 'signin_with' : 'signup_with',
      }
    );

    // Also try to show the One Tap prompt
    window.google.accounts.id.prompt();
  }, [googleAuth, mode, role, router, from]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div id="google-button-container" className="w-full min-h-[44px] flex justify-center" />
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-sage/40 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          Authenticating with Google...
        </div>
      )}
    </div>
  );
}
