// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  setAuthData: (userData: User, token: string, refreshToken?: string) => void;
  isLoading: boolean;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        const storedOnboarded = localStorage.getItem('isOnboarded');
        if (storedOnboarded === 'true') {
          setIsOnboarded(true);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isOnboarded');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (data: any) => {
    const { accessToken, refreshToken, userId, email, fullName, role, emailVerified, requiresApproval, onboarded } = data;

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

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (onboarded) localStorage.setItem('isOnboarded', 'true');
    else localStorage.removeItem('isOnboarded');

    // Redirect based on role and status
    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'DEVELOPER') {
      if (onboarded) {
        router.push('/jobs');
      } else {
        router.push('/onboarding/developer');
      }
    } else if (role === 'EMPLOYER') {
      if (onboarded) {
        if (requiresApproval) {
          router.push('/pending-approval');
        } else {
          router.push('/developers');
        }
      } else {
        router.push('/onboarding/employer');
      }
    }
  };

  const login = async (credentials: any) => {
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
      localStorage.removeItem('token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string, role?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleAuth({ idToken, role });
      if (response.success) {
        handleAuthSuccess(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authService.logout(refreshToken).catch(console.error);
    }
    setUser(null);
    setIsOnboarded(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isOnboarded');
    router.push('/login');
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('isOnboarded', 'true');
  };

  const setAuthData = (userData: User, token: string, refreshToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setIsOnboarded(false);
    localStorage.removeItem('isOnboarded');
  };

  const refreshUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
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
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isOnboarded,
      login,
      googleLogin,
      logout,
      completeOnboarding,
      setAuthData,
      isLoading,
      refreshUserStatus
    }}>
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
