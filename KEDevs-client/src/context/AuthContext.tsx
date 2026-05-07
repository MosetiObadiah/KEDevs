// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/lib/types';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';

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

  const login = async (credentials: any) => {
    const response = await authService.login(credentials);
    if (response.success) {
      const { accessToken, refreshToken, userId, email, fullName, role, emailVerified, requiresApproval } = response.data;
      
      const userData: User = {
        id: userId,
        email,
        fullName,
        role,
        isEmailVerified: emailVerified,
        isApproved: !requiresApproval
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Redirect based on role and status
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'DEVELOPER') {
        try {
          const profileResponse = await developerService.getMyProfile();
          if (profileResponse.success) {
            setIsOnboarded(true);
            localStorage.setItem('isOnboarded', 'true');
            router.push('/feed');
          } else {
            router.push('/onboarding/developer');
          }
        } catch (err) {
          router.push('/onboarding/developer');
        }
      } else if (role === 'EMPLOYER') {
        try {
          const profileResponse = await employerService.getMyProfile();
          if (profileResponse.success) {
            setIsOnboarded(true);
            localStorage.setItem('isOnboarded', 'true');
            if (requiresApproval) {
              router.push('/pending-approval');
            } else {
              router.push('/feed');
            }
          } else {
            router.push('/onboarding/employer');
          }
        } catch (err) {
          router.push('/onboarding/employer');
        }
      }
    }
  };

  const googleLogin = async (idToken: string, role?: string) => {
    const response = await authService.googleAuth({ idToken, role });
    if (response.success) {
      const { accessToken, refreshToken, userId, email, fullName, role: userRole, emailVerified, requiresApproval } = response.data;
      
      const userData: User = {
        id: userId,
        email,
        fullName,
        role: userRole,
        isEmailVerified: emailVerified,
        isApproved: !requiresApproval
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'DEVELOPER') {
        try {
          const profileResponse = await developerService.getMyProfile();
          if (profileResponse.success) {
            setIsOnboarded(true);
            localStorage.setItem('isOnboarded', 'true');
            router.push('/feed');
          } else {
            router.push('/onboarding/developer');
          }
        } catch (err) {
          router.push('/onboarding/developer');
        }
      } else if (userRole === 'EMPLOYER') {
        try {
          const profileResponse = await employerService.getMyProfile();
          if (profileResponse.success) {
            setIsOnboarded(true);
            localStorage.setItem('isOnboarded', 'true');
            if (requiresApproval) {
              router.push('/pending-approval');
            } else {
              router.push('/feed');
            }
          } else {
            router.push('/onboarding/employer');
          }
        } catch (err) {
          router.push('/onboarding/employer');
        }
      }
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
    // For fresh registration/verification, isOnboarded is false by default
    setIsOnboarded(false);
    localStorage.removeItem('isOnboarded');
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
      isLoading
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


