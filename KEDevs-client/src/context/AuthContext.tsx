// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/lib/types';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { developerService } from '@/services/developerService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (credentials: any) => Promise<void>;
  googleLogin: (token: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
        // Check if profile exists
        try {
          const profileResponse = await developerService.getMyProfile();
          if (profileResponse.success) {
            router.push('/feed');
          } else {
            router.push('/onboarding/developer');
          }
        } catch (err) {
          router.push('/onboarding/developer');
        }
      } else if (role === 'EMPLOYER') {
        if (requiresApproval) {
          router.push('/pending-approval');
        } else {
          router.push('/feed');
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
            router.push('/feed');
          } else {
            router.push('/onboarding/developer');
          }
        } catch (err) {
          router.push('/onboarding/developer');
        }
      } else if (userRole === 'EMPLOYER') {
        if (requiresApproval) {
          router.push('/pending-approval');
        } else {
          router.push('/feed');
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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      googleLogin,
      logout,
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


