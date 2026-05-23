// src/services/developerService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';
import { DeveloperSummary, CurrentSpotlightResponse } from '@/lib/types';

export const developerService = {
  async getPublicDevelopers(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<DeveloperSummary>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DeveloperSummary>>>(
      `/api/v1/developers/public?page=${page}&size=${size}`
    );
  },

  async getDeveloperProfile(profileId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/developers/${profileId}`);
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
  },

  async addProject(data: any, screenshot?: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('project', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/projects', formData);
  },

  async updateProject(projectId: string, data: any, screenshot?: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('project', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    return apiClient.put<ApiResponse<any>>(`/api/v1/developers/profile/projects/${projectId}`, formData);
  },

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/projects/${projectId}`);
  },

  async uploadProjectScreenshot(projectId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('screenshot', file);
    return apiClient.post<ApiResponse<any>>(`/api/v1/developers/profile/projects/${projectId}/screenshot`, formData, {
      headers: {} as HeadersInit,
    });
  },

  async uploadProfilePhoto(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/photo', formData);
  },

  async uploadVerificationDocument(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/verification-document', formData);
  },

  async addOSS(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/oss', data);
  },

  async updateOSS(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>(`/api/v1/developers/profile/oss/${id}`, data);
  },

  async deleteOSS(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/oss/${id}`);
  },

  async addLanguage(language: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/languages', { language });
  },

  async removeLanguage(language: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/languages/${language}`);
  },

  async addEducation(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/education', data);
  },

  async deleteEducation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/education/${id}`);
  },

  async addCertification(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/certifications', data);
  },

  async deleteCertification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/certifications/${id}`);
  },
  async uploadCertificationImage(id: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<any>>(`/api/v1/developers/profile/certifications/${id}/image`, formData);
  },

  async addAchievement(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/developers/profile/achievements', data);
  },

  async updateAchievement(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>(`/api/v1/developers/profile/achievements/${id}`, data);
  },

  async deleteAchievement(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/achievements/${id}`);
  },

  async endorseDeveloper(profileId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/developers/${profileId}/endorsements`, data);
  },

  async deleteEndorsement(endorsementId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/developers/profile/endorsements/${endorsementId}`);
  },

  async flagDeveloper(profileId: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/developers/${profileId}/flag`, { reason });
  },

  async filterDevelopers(data: any): Promise<ApiResponse<PaginatedResponse<DeveloperSummary>>> {
    return apiClient.post<ApiResponse<PaginatedResponse<DeveloperSummary>>>('/api/v1/developers/filter', data);
  },

  async updateVisibility(data: { profileVisibility: string }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/developers/profile/visibility?visibility=${data.profileVisibility}`, {});
  },

  async toggleFeaturedProject(projectId: string, featured: boolean): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/developers/profile/projects/${projectId}/featured`, { featured });
  },

  async updateAvailability(data: { availabilityStatus: string }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/developers/profile/availability?status=${data.availabilityStatus}`, {});
  },
  async getPastSpotlights(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/spotlight/past?page=${page}&size=${size}`);
  }
};

