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

  /**
   * Refreshes the access token.
   * No body needed — the refresh_token httpOnly cookie is sent automatically
   * via credentials: 'include' in the API client.
   */
  async refreshToken(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/refresh', {});
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/password-reset/request', { email });
  },

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/auth/password-reset/confirm?email=${encodeURIComponent(email)}`, { code, newPassword });
  },

  /**
   * Logs out the current user.
   * No refresh token argument needed — the cookie is sent automatically.
   * The server revokes the token and expires both cookies.
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/logout', {});
  },

  async googleAuth(data: { idToken: string; role?: string }): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/google', data);
  },

  async me(): Promise<ApiResponse<AuthResponse>> {
    return apiClient.get<ApiResponse<AuthResponse>>('/api/v1/auth/me');
  },

  async appeal(message: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/auth/appeal', { message });
  }
};
