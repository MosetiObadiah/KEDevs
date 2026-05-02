import apiClient from '@/lib/apiClient';
import type { User } from '@/lib/types/user';
import type { Payment } from '@/lib/types/payment';
import type { PlatformSetting } from '@/lib/types/payment';
import type { Page } from '@/lib/types/job';

// ── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalDevelopers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingFlags: number;
  pendingEmployerApprovals: number;
}

export async function getDashboard(): Promise<DashboardStats> {
  const res = await apiClient.get<{ data: DashboardStats }>('/admin/dashboard');
  return res.data.data;
}

export interface RevenuePoint {
  date: string;
  amount: number;
}

export async function getRevenueTrend(period: 'week' | 'month' | 'year'): Promise<RevenuePoint[]> {
  const res = await apiClient.get<{ data: RevenuePoint[] }>('/admin/revenue', {
    params: { period },
  });
  return res.data.data;
}

// ── User management ───────────────────────────────────────────────────────

export async function getUsers(params: {
  page?: number;
  size?: number;
  role?: string;
  status?: string;
  keyword?: string;
}): Promise<Page<User>> {
  const res = await apiClient.get<{ data: Page<User> }>('/admin/users', { params });
  return res.data.data;
}

export async function banUser(userId: string, reason: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/ban`, { reason });
}

export async function suspendUser(
  userId: string,
  reason: string,
  suspendUntil?: string
): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/suspend`, { reason, suspendUntil });
}

export async function activateUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/activate`);
}

export async function approveEmployer(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/approve`);
}

export async function grantVerifiedBadge(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/verify`);
}

export async function revokeVerifiedBadge(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}/verify`);
}

// ── Flags ─────────────────────────────────────────────────────────────────

export interface FlagItem {
  id: string;
  type: 'JOB' | 'COMMENT' | 'USER';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: string;
  createdAt: string;
}

export async function getFlags(params: {
  page?: number;
  size?: number;
  type?: string;
  status?: string;
}): Promise<Page<FlagItem>> {
  const res = await apiClient.get<{ data: Page<FlagItem> }>('/admin/flags', { params });
  return res.data.data;
}

export async function reviewFlag(
  flagId: string,
  action: 'DISMISS' | 'ACTION',
  note?: string
): Promise<void> {
  await apiClient.patch(`/admin/flags/${flagId}`, { action, note });
}

// ── Platform settings ─────────────────────────────────────────────────────

export async function getPlatformSettings(): Promise<PlatformSetting[]> {
  const res = await apiClient.get<{ data: PlatformSetting[] }>('/admin/settings');
  return res.data.data;
}

export async function updatePlatformSetting(
  key: string,
  value: string
): Promise<PlatformSetting> {
  const res = await apiClient.put<{ data: PlatformSetting }>(`/admin/settings/${key}`, {
    value,
  });
  return res.data.data;
}

// ── Payments ──────────────────────────────────────────────────────────────

export async function getAllPayments(params: {
  page?: number;
  size?: number;
  status?: string;
}): Promise<Page<Payment>> {
  const res = await apiClient.get<{ data: Page<Payment> }>('/admin/payments', { params });
  return res.data.data;
}
