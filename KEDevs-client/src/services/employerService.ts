// src/services/employerService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';

export const employerService = {
  async createProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/employers/profile', data);
  },

  async getMyProfile(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/employers/profile/me');
  },

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>('/api/v1/employers/profile', data);
  },

  async getSavedSearches(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/employers/searches');
  },

  async saveSearch(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/employers/searches', data);
  },

  async deleteSearch(searchId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/employers/searches/${searchId}`);
  },

  async contactDeveloper(developerId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/employers/contact/${developerId}`, data);
  },

  async bookmarkDeveloper(developerId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/employers/bookmarks/${developerId}`, {});
  },

  async removeBookmark(developerId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/employers/bookmarks/${developerId}`);
  },

  async getBookmarks(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/employers/bookmarks');
  },

  async getContactRequests(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/employers/contact/requests');
  },

  async respondContactRequest(requestId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/employers/contact/requests/${requestId}`, data);
  },

  async getPublicEmployers(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/employers/public?page=${page}&size=${size}`);
  },

  async getPublicEmployer(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/employers/public/${id}`);
  }
};
