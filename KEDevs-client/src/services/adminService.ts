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

  async getDashboardRevenueTrends(days = 30): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/admin/dashboard/revenue/trends?days=${days}`);
  },

  async getVerificationRequests(role?: string, page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    const q = new URLSearchParams();
    if (role) q.append('role', role);
    q.append('page', page.toString());
    q.append('size', size.toString());
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/verification/requests?${q.toString()}`);
  },

  async reviewVerificationRequest(requestId: string, data: { status: string; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/verification/requests/${requestId}/review`, data);
  },

  async getVerificationHistory(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/verification/history?page=${page}&size=${size}`);
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

  async getAuditLog(params: { page?: number; size?: number; action?: string; actorId?: string } = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const q = new URLSearchParams();
    q.append('page', String(params.page ?? 0));
    q.append('size', String(params.size ?? 25));
    q.append('sort', 'createdAt,desc');
    if (params.action) q.append('action', params.action);
    if (params.actorId) q.append('actorId', params.actorId);
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/audit?${q.toString()}`);
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
    return apiClient.put<ApiResponse<any>>(`/api/v1/admin/settings/${key}`, { settingValue: String(value) });
  },

  async getFlaggedUsers(page = 0, size = 20, history?: boolean): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/users?page=${page}&size=${size}${history !== undefined ? `&history=${history}` : ''}`);
  },

  async getFlaggedJobs(page = 0, size = 20, history?: boolean): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/jobs?page=${page}&size=${size}${history !== undefined ? `&history=${history}` : ''}`);
  },

  async getFlaggedComments(page = 0, size = 20, history?: boolean): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/flags/comments?page=${page}&size=${size}${history !== undefined ? `&history=${history}` : ''}`);
  },

  async reviewUserFlag(flagId: string, data: { outcome: string; notes?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/users/${flagId}/review`, { outcome: data.outcome, notes: data.notes || 'Reviewed by admin' });
  },

  async reviewJobFlag(flagId: string, data: { outcome: string; notes?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/jobs/${flagId}/review`, { outcome: data.outcome, notes: data.notes || 'Reviewed by admin' });
  },

  async reviewCommentFlag(flagId: string, data: { outcome: string; notes?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/flags/comments/${flagId}/review`, { outcome: data.outcome, notes: data.notes || 'Reviewed by admin' });
  },

  async approveEmployer(profileId: string, data: { approved: boolean; notes?: string }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/admin/employers/${profileId}/approval`, {
      approved: data.approved,
      notes: data.notes || 'Employer approval updated'
    });
  },

  async grantBadge(userId: string, action: 'GRANT' | 'REVOKE', notes = 'Badge action by admin'): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/users/${userId}/badge`, { action, notes });
  },

  async performUserAction(userId: string, action: string, notes?: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/users/${userId}/action`, { action, notes });
  },

  async getApplicationsOverTime(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/analytics/applications-over-time');
  },

  async getTopSkills(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/analytics/top-skills');
  },

  async getRevenueByType(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/analytics/revenue-by-type');
  },

  async getDeveloperLocations(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/analytics/developer-locations');
  },

  async exportFlags(format: 'csv' | 'pdf', category?: string, history?: boolean): Promise<Blob> {
    const headers = apiClient.getHeaders();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const q = new URLSearchParams();
    q.append('format', format);
    if (category) q.append('category', category);
    if (history !== undefined) q.append('history', String(history));
    
    const response = await fetch(`${baseUrl}/api/v1/admin/flags/export?${q.toString()}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to export flags: ${response.statusText}`);
    }
    return response.blob();
  },

  async exportReport(data: { charts: string[]; dateRange: string; generatedBy: string }): Promise<Blob> {
    const headers = apiClient.getHeaders();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/v1/admin/analytics/export-report`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to export PDF: ${response.statusText}`);
    }
    return response.blob();
  },

  // ── Job Advertisement Slots ──────────────────────────────────────────
  async getJobAdvertisements(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/job-advertisements?page=${page}&size=${size}`);
  },

  async getJobAdvertisementHistory(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/admin/job-advertisements/history?page=${page}&size=${size}`);
  },

  async overrideJobAdvertisement(slotId: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/admin/job-advertisements/${slotId}/override`, { reason });
  },

  async exportJobAdvertisementsPdf(): Promise<Blob> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${baseUrl}/api/v1/admin/job-advertisements/export/pdf`, { headers });
    if (!response.ok) throw new Error(`Failed to export PDF: ${response.statusText}`);
    return response.blob();
  },

  async exportJobAdvertisementsCsv(): Promise<Blob> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${baseUrl}/api/v1/admin/job-advertisements/export/csv`, { headers });
    if (!response.ok) throw new Error(`Failed to export CSV: ${response.statusText}`);
    return response.blob();
  },
};

