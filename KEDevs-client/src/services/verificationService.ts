import { ApiResponse } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

export enum VerificationStatus {
  NONE = 'NONE',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_DOCS = 'PENDING_DOCS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface VerificationStatusResponse {
  status: VerificationStatus;
  profileCompleteness: Record<string, boolean>;
  isEligible: boolean;
  requestId: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
}

export interface InitiateVerificationResponse {
  requestId: string;
  checkoutRequestId: string;
  customerMessage: string;
}

export const verificationService = {
  async getStatus(): Promise<ApiResponse<VerificationStatusResponse>> {
    return apiClient.get<ApiResponse<VerificationStatusResponse>>('/api/v1/verification/status');
  },

  async initiate(phoneNumber: string): Promise<ApiResponse<InitiateVerificationResponse>> {
    return apiClient.post<ApiResponse<InitiateVerificationResponse>>(
      `/api/v1/verification/initiate?phoneNumber=${phoneNumber}`
    );
  },

  async submitDocuments(formData: FormData): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/v1/verification/submit-documents', formData);
  },
};
