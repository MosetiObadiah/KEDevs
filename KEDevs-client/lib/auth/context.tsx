'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { User, AuthResponse, Role } from '@/lib/types/user';
import { getMe } from '@/lib/api/auth';

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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_profile');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('access_token');
    }
    return true;
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
        const me = await getMe();
        setUser(me);
        localStorage.setItem('user_profile', JSON.stringify(me));
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
  }, []);

  const completeAuth = useCallback((data: AuthResponse) => {
    storeTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, accessToken, login, register, googleAuth, logout, setUser, completeAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
