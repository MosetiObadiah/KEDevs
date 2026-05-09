// src/services/jobService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';
import { JobSummary } from '@/lib/types';

export const jobService = {
  async getPublicJobs(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<JobSummary>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<JobSummary>>>(
      `/api/v1/jobs/public?page=${page}&size=${size}`
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

  async updateJob(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>(`/api/v1/jobs/${id}`, data);
  },

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/jobs/${id}`);
  },

  async voteJob(id: string, voteType: 'UPVOTE' | 'DOWNVOTE'): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/jobs/${id}/vote`, { voteType });
  },

  async flagJob(id: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/jobs/${id}/flag`, { reason });
  },

  async applyToJob(id: string, resume: File, coverLetterFile: File | null, coverLetterText?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('resume', resume);
    if (coverLetterFile) {
      formData.append('coverLetter', coverLetterFile);
    }
    if (coverLetterText) {
      formData.append('coverLetterText', coverLetterText);
    }
    return apiClient.post<ApiResponse<any>>(`/api/v1/jobs/${id}/apply`, formData);
  },

  async updateJobStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/jobs/${id}/status?status=${status}`, {});
  },

  async updateApplicationStatus(jobId: string, appId: string, status: string, employerMessage?: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/jobs/${jobId}/applications/${appId}`, { status, employerMessage });
  },

  async getJobApplications(jobId: string): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/api/v1/jobs/${jobId}/applications`);
  },

  async getMyApplications(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>('/api/v1/jobs/my-applications');
  },

  async getMyPosts(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<any>>>('/api/v1/jobs/my-posts');
  }
};

