import apiClient from '@/lib/apiClient';
import type { User } from '@/lib/types/user';
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

export interface SignupPoint { date: string; count: number; }
export interface RevenuePoint { paymentType: string; totalAmount: number; }
export interface SubscriptionStats { active: number; expired: number; cancelled: number; }
export interface ForumStats { totalComments: number; hiddenComments: number; flaggedComments: number; }
export interface FlagStats { pendingJobFlags: number; pendingCommentFlags: number; pendingUserFlags: number; }

export async function getDashboard(): Promise<DashboardStats> {
  const res = await apiClient.get<DashboardStats>('/admin/dashboard');
  return res.data;
}

export async function getSignupTrend(): Promise<SignupPoint[]> {
  const res = await apiClient.get<SignupPoint[]>('/admin/dashboard/signups');
  return res.data;
}

export async function getRevenueTrend(): Promise<RevenuePoint[]> {
  const res = await apiClient.get<RevenuePoint[]>('/admin/dashboard/revenue');
  return res.data;
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const res = await apiClient.get<SubscriptionStats>('/admin/dashboard/subscriptions');
  return res.data;
}

export async function getForumStats(): Promise<ForumStats> {
  const res = await apiClient.get<ForumStats>('/admin/dashboard/forum');
  return res.data;
}

export async function getFlagStats(): Promise<FlagStats> {
  const res = await apiClient.get<FlagStats>('/admin/dashboard/flags');
  return res.data;
}

// ── User management ───────────────────────────────────────────────────────

export async function getUsers(params: {
  page?: number; size?: number; role?: string; status?: string; search?: string;
}): Promise<Page<User>> {
  const res = await apiClient.get<Page<User>>('/admin/users', { params });
  return res.data;
}

export async function getUserById(id: string): Promise<User> {
  const res = await apiClient.get<User>(`/admin/users/${id}`);
  return res.data;
}

export async function performUserAction(
  userId: string,
  action: 'BAN' | 'SUSPEND' | 'REACTIVATE' | 'WARN',
  reason: string
): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/action`, { action, reason });
}

export async function getPendingEmployers(): Promise<User[]> {
  const res = await apiClient.get<User[]>('/admin/users/pending-employers');
  return res.data;
}

export async function approveEmployer(profileId: string, approved: boolean, reason?: string): Promise<void> {
  await apiClient.patch(`/admin/employers/${profileId}/approval`, { approved, reason });
}

export async function manageBadge(userId: string, action: 'GRANT' | 'REVOKE'): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/badge`, { action });
}

// ── Flags ─────────────────────────────────────────────────────────────────

export interface FlagItem {
  id: string;
  targetId: string;
  targetTitle?: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: string;
  createdAt: string;
}

export async function getJobFlags(): Promise<FlagItem[]> {
  const res = await apiClient.get<Page<FlagItem>>('/admin/flags/jobs');
  return res.data.content || [];
}

export async function reviewJobFlag(
  flagId: string,
  action: 'DISMISS' | 'REMOVE_JOB' | 'WARN_POSTER' | 'BAN_POSTER',
  reason: string
): Promise<void> {
  await apiClient.post(`/admin/flags/jobs/${flagId}/review`, { action, reason });
}

export async function getUserFlags(): Promise<FlagItem[]> {
  const res = await apiClient.get<Page<FlagItem>>('/admin/flags/users');
  return res.data.content || [];
}

export async function reviewUserFlag(
  flagId: string,
  action: 'DISMISS' | 'WARN' | 'SUSPEND' | 'BAN',
  reason: string
): Promise<void> {
  await apiClient.post(`/admin/flags/users/${flagId}/review`, { action, reason });
}

export async function getCommentFlags(): Promise<FlagItem[]> {
  const res = await apiClient.get<Page<FlagItem>>('/admin/flags/comments');
  return res.data.content || [];
}

export async function reviewCommentFlag(
  flagId: string,
  action: 'DISMISS' | 'HIDE_COMMENT' | 'DELETE_COMMENT' | 'WARN_AUTHOR',
  reason: string
): Promise<void> {
  await apiClient.post(`/admin/flags/comments/${flagId}/review`, { action, reason });
}

// ── Platform settings ─────────────────────────────────────────────────────

export async function getPlatformSettings(): Promise<PlatformSetting[]> {
  const res = await apiClient.get<PlatformSetting[]>('/admin/settings');
  return res.data;
}

export async function updatePlatformSetting(key: string, value: string): Promise<PlatformSetting> {
  const res = await apiClient.put<PlatformSetting>(`/admin/settings/${key}`, { value });
  return res.data;
}

// ── Audit log ─────────────────────────────────────────────────────────────

export interface AuditAction {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  reason?: string;
  createdAt: string;
}

export async function getAuditLog(params: { page?: number; from?: string; to?: string } = {}): Promise<Page<AuditAction>> {
  const res = await apiClient.get<Page<AuditAction>>('/admin/actions', { params });
  return res.data;
}

// ── Spotlight admin ───────────────────────────────────────────────────────

export interface AdminSpotlightSlot {
  id: string;
  developerId: string;
  developerName: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  overriddenByAdmin: boolean;
  reason?: string;
}

export async function getAdminSpotlightSlots(): Promise<AdminSpotlightSlot[]> {
  const res = await apiClient.get<AdminSpotlightSlot[]>('/spotlight/admin/slots');
  return res.data;
}

export async function overrideSpotlightSlot(slotId: string, reason: string): Promise<void> {
  await apiClient.patch(`/spotlight/admin/slots/${slotId}/override`, { reason });
}
