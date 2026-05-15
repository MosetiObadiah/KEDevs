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
  async getPublicCompanies(page = 0, size = 20): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/employers/public?page=${page}&size=${size}`);
  },

  async getCompanyDetails(id: string): Promise<ApiResponse<CompanyProfile>> {
    return apiClient.get<ApiResponse<CompanyProfile>>(`/api/v1/employers/public/${id}`);
  },
  
  async flagCompany(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/employers/${id}/flag`, { reason });
  }
};
