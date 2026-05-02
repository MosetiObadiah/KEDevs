import axios from 'axios';
import type { User, AuthResponse } from '@/lib/types/user';
import type { Role } from '@/lib/types/user';

// All auth calls go through Next.js route handlers (cookie management)

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>('/api/auth/login', { email, password });
  return res.data;
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}): Promise<{ userId: string }> {
  const res = await axios.post<{ userId: string }>('/api/auth/register', data);
  return res.data;
}

export async function googleAuth(idToken: string, role?: Role): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>('/api/auth/google', { idToken, role });
  return res.data;
}

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
  const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
    '/api/auth/refresh',
    { refreshToken: rt }
  );
  return res.data;
}

export async function verifyEmail(userId: string, code: string): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>('/api/auth/verify-email', { userId, code });
  return res.data;
}

// Direct Spring Boot calls (no cookie management needed)
import apiClient from '@/lib/apiClient';

export async function resendVerification(userId: string): Promise<void> {
  await apiClient.post(`/auth/resend-verification/${userId}`);
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/password-reset/request', { email });
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await apiClient.post(`/auth/password-reset/confirm?email=${encodeURIComponent(email)}`, { code, newPassword });
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<{ data: User }>('/users/me');
  return res.data.data;
}
