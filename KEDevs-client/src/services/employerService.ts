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

  async uploadLogo(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<any>>('/api/v1/employers/profile/logo', formData);
  },

  async uploadVerificationDocuments(
    incorporationCertificate: File,
    kraPinCertificate: File,
    businessPermit: File
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('incorporationCertificate', incorporationCertificate);
    formData.append('kraPinCertificate', kraPinCertificate);
    formData.append('businessPermit', businessPermit);
    return apiClient.post<ApiResponse<any>>('/api/v1/employers/profile/verification-documents', formData);
  },

  async contactDeveloper(developerId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/employers/contact/${developerId}`, data);
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
  },

  async getIncomingInquiries(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/employers/inquiries?page=${page}&size=${size}`);
  },

  async respondToInquiry(inquiryId: string, status: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/employers/inquiries/${inquiryId}?status=${status}`, {});
  }
};
