// src/services/developerService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';
import { DeveloperSummary, CurrentSpotlightResponse } from '@/lib/types';

export const developerService = {
  async getPublicDevelopers(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<DeveloperSummary>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DeveloperSummary>>>(
      `/api/v1/developers/public?page=${page}&size=${size}`
    );
  },

  async getCurrentSpotlight(): Promise<ApiResponse<CurrentSpotlightResponse>> {
    return apiClient.get<ApiResponse<CurrentSpotlightResponse>>('/api/v1/spotlight/current');
  },

  async createProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile', data);
  },

  async getMyProfile(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/developers/profile/me');
  },

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>('/api/v1/developers/profile', data);
  },

  async addSkill(skill: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/developers/profile/skills', { skill });
  },

  async removeSkill(skill: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/skills/${skill}`);
  }
};

