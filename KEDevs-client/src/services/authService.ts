// src/services/authService.ts
import { apiClient, ApiResponse } from '@/lib/api-client';
import { AuthResponse } from '@/lib/types';

export const authService = {
  async login(credentials: any): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', credentials);
  },

  async register(data: any): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', data);
  },

  async verifyEmail(userId: string, code: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(`/api/v1/auth/verify-email/${userId}`, { code });
  },

  async resendVerification(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/auth/resend-verification/${userId}`, {});
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh', { refreshToken });
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/password-reset/request', { email });
  },

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/auth/password-reset/confirm?email=${encodeURIComponent(email)}`, { code, newPassword });
  },

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/logout', { refreshToken });
  },
  
  async googleAuth(data: { idToken: string; role?: string }): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/google', data);
  }
};
