// src/services/adminService.ts
import { apiClient, ApiResponse } from '@/lib/api-client';

export const adminService = {
  async getDashboard(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/admin/dashboard');
  },

  async getPendingEmployers(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/admin/users/pending-employers?page=${page}&size=${size}`);
  },

  async approveEmployer(profileId: string, data: { approved: boolean; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/admin/employers/${profileId}/approval`, data);
  }
};
