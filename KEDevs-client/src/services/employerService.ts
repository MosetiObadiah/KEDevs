// src/services/employerService.ts
import { apiClient, ApiResponse } from '@/lib/api-client';

export const employerService = {
  async createProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/employers/profile', data);
  },

  async getMyProfile(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/employers/profile/me');
  },

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>('/api/v1/employers/profile', data);
  }
};
