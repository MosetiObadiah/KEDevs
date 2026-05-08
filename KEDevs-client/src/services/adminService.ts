// src/services/adminService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';

export const adminService = {
  async getDashboard(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard');
  },

  async getDashboardSubscriptions(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard/subscriptions');
  },

  async getDashboardSignups(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard/signups');
  },

  async getDashboardRevenue(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard/revenue');
  },

  async getDashboardForum(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard/forum');
  },

  async getDashboardFlags(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard/flags');
  },

  async getActions(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/actions');
  },

  async getUsers(filters: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = new URLSearchParams(Object.entries(filters).filter(([_, value]) => value != null) as any).toString();
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/users${query ? `?${query}` : ''}`);
  },

  async getUserById(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/admin/users/${userId}`);
  },

  async getPendingEmployers(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/users/pending-employers?page=${page}&size=${size}`);
  },

  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/settings');
  },

  async updateSetting(key: string, value: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>(`/api/v1/admin/settings/${key}`, { value });
  },

  async getFlaggedUsers(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/users?page=${page}&size=${size}`);
  },

  async getFlaggedJobs(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/jobs?page=${page}&size=${size}`);
  },

  async getFlaggedComments(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/comments?page=${page}&size=${size}`);
  },

  async reviewUserFlag(flagId: string, data: { action: string; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/users/${flagId}/review`, data);
  },

  async reviewJobFlag(flagId: string, data: { action: string; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/jobs/${flagId}/review`, data);
  },

  async reviewCommentFlag(flagId: string, data: { action: string; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/comments/${flagId}/review`, data);
  },

  async approveEmployer(profileId: string, data: { approved: boolean; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/admin/employers/${profileId}/approval`, data);
  },

  async grantBadge(userId: string, verified: boolean): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/users/${userId}/badge`, { verified });
  },

  async performUserAction(userId: string, action: string, reason?: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/users/${userId}/action`, { action, reason });
  }
};
