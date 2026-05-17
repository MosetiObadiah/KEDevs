// src/services/companyService.ts
import { apiClient, ApiResponse } from '@/lib/api-client';

export interface CompanyProfile {
  id: string;
  userId: string;
  contactPersonName: string;
  contactEmail: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  locationHQ: string;
  companyBio: string;
  logoUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  isApproved: boolean;
  isVerified?: boolean;
  isProAccount: boolean;
  createdAt: string;
}

export const companyService = {
  async getPublicCompanies(page = 0, size = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    });
    // Flatten arrays for Spring Data binding
    if (filters?.industries) {
      params.delete('industries');
      filters.industries.forEach((i: string) => params.append('industries', i));
    }
    if (filters?.sizes) {
      params.delete('sizes');
      filters.sizes.forEach((s: string) => params.append('sizes', s));
    }
    
    return apiClient.get<ApiResponse<any>>(`/api/v1/employers/public?${params.toString()}`);
  },

  async getCompanyDetails(id: string): Promise<ApiResponse<CompanyProfile>> {
    return apiClient.get<ApiResponse<CompanyProfile>>(`/api/v1/employers/public/${id}`);
  },
  
  async flagCompany(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/employers/${id}/flag`, { reason });
  },

  async exportCompanies(filters?: any): Promise<Blob> {
    const params = new URLSearchParams(filters);
    if (filters?.industries) {
      params.delete('industries');
      filters.industries.forEach((i: string) => params.append('industries', i));
    }
    if (filters?.sizes) {
      params.delete('sizes');
      filters.sizes.forEach((s: string) => params.append('sizes', s));
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/api/v1/employers/public/export?${params.toString()}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  async sendInquiry(companyId: string, message: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/employers/public/${companyId}/inquire`, { message });
  }
};
