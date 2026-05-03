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
  const from = searchParams.get('from') ?? '/dashboard';

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;

    // Use a static flag or check if already initialized to prevent multiple calls
    if (!window.google._isInitialized) {
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
      window.google._isInitialized = true;
    }

    // 2. Render button with a slight delay to ensure container is ready
    const renderTimeout = setTimeout(() => {
      const container = document.getElementById('google-button-container');
      if (container && window.google?.accounts?.id) {
        // Clear container to prevent duplicate button issues on back/forward navigation
        container.innerHTML = ''; 
        
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 380,
          shape: 'pill',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
        });
      }
    }, 100);

    // Also try to show the One Tap prompt
    // We add a slight delay and a cleanup to prevent "multiple outstanding requests"
    const timeout = setTimeout(() => {
      if (window.google?.accounts?.id && !window.google._isPrompted) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
          }
        });
        window.google._isPrompted = true;
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearTimeout(renderTimeout);
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
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
