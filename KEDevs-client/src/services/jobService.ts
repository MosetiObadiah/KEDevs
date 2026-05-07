// src/services/jobService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';
import { JobSummary } from '@/lib/types';

export const jobService = {
  async getExternalJobs(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<JobSummary>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<JobSummary>>>(
      `/api/v1/jobs/external?page=${page}&size=${size}`
    );
  },
  
  async getJobs(params: any): Promise<ApiResponse<PaginatedResponse<JobSummary>>> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );
    const query = new URLSearchParams(cleanParams as any).toString();
    return apiClient.get<ApiResponse<PaginatedResponse<JobSummary>>>(`/api/v1/jobs?${query}`);
  },

  async getJobDetails(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/jobs/${id}`);
  },

  async postJob(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/jobs', data);
  },

  async updateJobStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/jobs/${id}/status?status=${status}`, {});
  },

  async applyToJob(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/jobs/${id}/apply`, data);
  },

  async getMyApplications(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>('/api/v1/jobs/my-applications');
  },

  async getMyPosts(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>('/api/v1/jobs/my-posts');
  }
};

