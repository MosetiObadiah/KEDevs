// src/services/jobService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';
import { JobSummary } from '@/lib/types';

export const jobService = {
  async getPublicJobs(postedById?: string, page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<JobSummary>>> {
    const url = postedById
      ? `/api/v1/jobs/public?postedById=${postedById}&page=${page}&size=${size}`
      : `/api/v1/jobs/public?page=${page}&size=${size}`;
    return apiClient.get<ApiResponse<PaginatedResponse<JobSummary>>>(url);
  },

  async getPinnedJobs(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/api/v1/jobs/pinned');
  },

  async getFilterMetadata(): Promise<ApiResponse<{ qualifications: string[], experienceYears: number[] }>> {
    return apiClient.get<ApiResponse<{ qualifications: string[], experienceYears: number[] }>>('/api/v1/jobs/metadata');
  },
  
  async getJobs(params: any): Promise<ApiResponse<PaginatedResponse<JobSummary>>> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value == null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach(val => {
          if (val != null && val !== '') {
            urlParams.append(key, val);
          }
        });
      } else {
        urlParams.append(key, String(value));
      }
    });
    return apiClient.get<ApiResponse<PaginatedResponse<JobSummary>>>(`/api/v1/jobs?${urlParams.toString()}`);
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
  },

  async verifyUrl(url: string): Promise<ApiResponse<{ isSafe: boolean }>> {
    return apiClient.post<ApiResponse<{ isSafe: boolean }>>('/api/v1/jobs/verify-url', { url });
  },

  async exportJobsPdf(params: any): Promise<Blob> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value == null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach(val => {
          if (val != null && val !== '') urlParams.append(key, val);
        });
      } else {
        urlParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/jobs/export?${urlParams.toString()}`, {
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to export PDF');
    return response.blob();
  },

  async exportMyPostsPdf(): Promise<Blob> {
    const headers = apiClient.getHeaders();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/v1/jobs/my-posts/export/pdf`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to export my posts to PDF');
    return response.blob();
  },

  async exportJobApplicationsPdf(jobId: string): Promise<Blob> {
    const headers = apiClient.getHeaders();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applications/export/pdf`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to export job applications to PDF');
    return response.blob();
  },

  async getPinnedSlotAvailability(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/jobs/pinned/slots');
  }
};

