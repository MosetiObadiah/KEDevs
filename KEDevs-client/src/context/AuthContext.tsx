// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { User } from '@/lib/types';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  login: (credentials: any) => Promise<void>;
  googleLogin: (token: string, role?: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  setAuthData: (userData: User) => void;
  isLoading: boolean;
  refreshUserStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: validate session by calling /me.
  // The access_token cookie is sent automatically — if valid, we get the user back.
  // On 401, the cookie is missing/expired and the user is logged out.
  useEffect(() => {
    authService.me()
      .then(response => {
        if (response.success && response.data) {
          const d = response.data;
          const userData: User = {
            id: d.userId,
            email: d.email,
            fullName: d.fullName,
            role: d.role,
            isEmailVerified: d.emailVerified,
            isApproved: !d.requiresApproval,
            isVerified: d.isVerified || !d.requiresApproval,
            spotlightStatus: { isActive: false },
            accountStatus: d.accountStatus || 'ACTIVE',
            rejectionReason: d.rejectionReason
          };
          setUser(userData);
          // Restore onboarded state from backend (fallback to localStorage if undefined)
          const isOnboardedTrue = d.onboarded ?? (localStorage.getItem('isOnboarded') === 'true');
          setIsOnboarded(isOnboardedTrue);
          // Persist user profile info (non-sensitive) for fast renders before /me resolves
          localStorage.setItem('user', JSON.stringify(userData));
          if (isOnboardedTrue) localStorage.setItem('isOnboarded', 'true');
          else localStorage.removeItem('isOnboarded');
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('isOnboarded');
        }
      })
      .catch(() => {
        // 401 = not logged in, that's fine
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isOnboarded');
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Handles successful auth responses (login, register, Google, verify-email).
   * Tokens are no longer in the response body — they're in httpOnly cookies.
   * We only store non-sensitive user profile data in localStorage for fast hydration.
   */
  const handleAuthSuccess = useCallback((data: any) => {
    const { userId, email, fullName, role, emailVerified, requiresApproval, onboarded } = data;

    const userData: User = {
      id: userId,
      email,
      fullName,
      role,
      isEmailVerified: emailVerified,
      isApproved: !requiresApproval,
      isVerified: data.isVerified || !requiresApproval,
      spotlightStatus: { isActive: false },
      accountStatus: data.accountStatus || 'ACTIVE'
    };

    setUser(userData);
    setIsOnboarded(onboarded);

    // Store non-sensitive profile info only
    localStorage.setItem('user', JSON.stringify(userData));
    if (onboarded) localStorage.setItem('isOnboarded', 'true');
    else localStorage.removeItem('isOnboarded');

    // WebSocket-only token: sessionStorage is tab-scoped and cleared on browser close.
    // SockJS/STOMP cannot use httpOnly cookies during the handshake, so we store
    // the raw access token here for the STOMP connectHeaders ONLY.
    // This is a documented tradeoff — see troubles.md.
    if (data.accessToken) sessionStorage.setItem('ws_token', data.accessToken);

    // Redirect based on role and status
    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'DEVELOPER') {
      router.push(onboarded ? '/jobs' : '/onboarding/developer');
    } else if (role === 'EMPLOYER') {
      if (onboarded) {
        router.push(requiresApproval ? '/pending-approval' : '/developers');
      } else {
        router.push('/onboarding/employer');
      }
    }
  }, [router]);

  const login = useCallback(async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        handleAuthSuccess(response.data);
      } else {
        setUser(null);
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setUser(null);
      localStorage.removeItem('user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const googleLogin = useCallback(async (idToken: string, role?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleAuth({ idToken, role });
      if (response.success) {
        handleAuthSuccess(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    authService.logout().catch(console.error);
    setUser(null);
    setIsOnboarded(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isOnboarded');
    sessionStorage.removeItem('ws_token');
    router.push('/login');
  }, [router]);

  const completeOnboarding = useCallback(() => {
    setIsOnboarded(true);
    localStorage.setItem('isOnboarded', 'true');
  }, []);

  /** Called after profile updates that don't require re-auth — no token needed. */
  const setAuthData = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsOnboarded(false);
    localStorage.removeItem('isOnboarded');
  }, []);

  const refreshUserStatus = useCallback(async () => {
    try {
      const response = await authService.me();
      if (response.success && response.data) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = {
            ...parsedUser,
            accountStatus: response.data.accountStatus || 'ACTIVE',
            isApproved: !response.data.requiresApproval,
            isVerified: response.data.isVerified
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.error('Failed to refresh user status', e);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.me();
      if (response.success && response.data) {
        const d = response.data;
        const userData: User = {
          id: d.userId,
          email: d.email,
          fullName: d.fullName,
          role: d.role,
          isEmailVerified: d.emailVerified,
          isApproved: !d.requiresApproval,
          isVerified: d.isVerified || !d.requiresApproval,
          spotlightStatus: { isActive: false },
          accountStatus: d.accountStatus || 'ACTIVE'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (d.onboarded !== undefined) {
          setIsOnboarded(d.onboarded);
          if (d.onboarded) localStorage.setItem('isOnboarded', 'true');
          else localStorage.removeItem('isOnboarded');
        }
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    isOnboarded,
    login,
    googleLogin,
    logout,
    completeOnboarding,
    setAuthData,
    isLoading,
    refreshUserStatus,
    refreshUser
  }), [
    user,
    isOnboarded,
    login,
    googleLogin,
    logout,
    completeOnboarding,
    setAuthData,
    isLoading,
    refreshUserStatus,
    refreshUser
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
