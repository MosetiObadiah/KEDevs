'use client';

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { User, AuthResponse, Role } from '@/lib/types/user';
// getMe removed since the backend does not have a generic /users/me endpoint

// ── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
  }) => Promise<{ userId: string }>;
  googleAuth: (idToken: string, role?: Role) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  completeAuth: (data: AuthResponse) => void;
  profile: any | null;
  isProfileLoading: boolean;
  isProfileFetched: boolean;
  refreshProfile: () => Promise<void>;
  hasProfile: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helper — store tokens in localStorage ─────────────────────────────────

function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | undefined>(undefined);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const profileFetchInitiatedRef = useRef(false);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      const { profileApi } = await import('@/lib/api/profile');
      // ADMIN users don't have profiles, so just mark as loaded
      if (user.role === 'ADMIN') {
        setProfile({}); // Empty object indicates profile is loaded (for admins)
        return;
      }
      if (user.role === 'DEVELOPER') {
        const p = await profileApi.getMyDeveloperProfile();
        setProfile(p);
      } else if (user.role === 'EMPLOYER') {
        const p = await profileApi.getMyEmployerProfile();
        setProfile(p);
      }
    } catch (err: any) {
      // 404 means profile not created yet - expected for new users
      if (err.response?.status !== 404) {
        console.error('Failed to fetch profile:', err);
      }
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && profile === undefined && !isProfileLoading && !profileFetchInitiatedRef.current) {
      profileFetchInitiatedRef.current = true;
      refreshProfile();
    }
  }, [user, profile, isProfileLoading]);

  // Rehydrate on mount — read localStorage token, then fetch /users/me
  useEffect(() => {
    async function rehydrate() {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setIsLoading(false);
        setUser(null);
        return;
      }
      setAccessToken(storedToken);
      try {
        const profileStr = localStorage.getItem('user_profile');
        if (profileStr) {
          const me = JSON.parse(profileStr);
          setUser(me);
        } else {
          throw new Error('No user profile found in storage');
        }
      } catch {
        // Token is invalid/expired — clear and let middleware redirect
        clearTokens();
        localStorage.removeItem('user_profile');
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    rehydrate();
  }, []);

  // ── login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      const error = new Error(err.message ?? 'Login failed');
      (error as any).data = err.data;
      (error as any).status = res.status;
      throw error;
    }
    const data: AuthResponse = await res.json();
    storeTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  // ── register ─────────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      fullName: string;
      role: Role;
    }): Promise<{ userId: string }> => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Registration failed');
      }
      return res.json();
    },
    []
  );

  // ── googleAuth ────────────────────────────────────────────────────────────
  const googleAuth = useCallback(async (idToken: string, role?: Role): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Google sign-in failed');
    }
    const data: AuthResponse = await res.json();
    storeTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
    localStorage.removeItem('user_profile');
    setAccessToken(null);
    setUser(null);
    profileFetchInitiatedRef.current = false;
  }, []);

  const completeAuth = useCallback((data: AuthResponse) => {
    storeTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isLoading, 
        accessToken, 
        login, 
        register, 
        googleAuth, 
        logout, 
        setUser, 
        completeAuth,
        profile,
        isProfileLoading,
        isProfileFetched: profile !== undefined,
        refreshProfile,
        hasProfile: !!profile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
