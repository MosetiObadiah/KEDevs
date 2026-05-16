import { apiClient, ApiResponse } from '@/lib/api-client';

export interface PaymentInitiationResponse {
  checkoutRequestId: string;
  message: string;
  amount: number;
}

export interface PlatformSetting {
  settingKey: string;
  settingValue: string;
  description: string;
}

export const paymentService = {
  async initiateVerifiedBadge(data: { phoneNumber: string }): Promise<ApiResponse<PaymentInitiationResponse>> {
    return apiClient.post<ApiResponse<PaymentInitiationResponse>>('/api/v1/payments/verified-badge', data);
  },

  async initiateSpotlight(data: { phoneNumber: string, spotlightType: 'DAY' | 'WEEK' }): Promise<ApiResponse<PaymentInitiationResponse>> {
    return apiClient.post<ApiResponse<PaymentInitiationResponse>>('/api/v1/payments/spotlight', data);
  },

  async initiatePinnedJob(data: { phoneNumber: string, jobId: string, durationType: 'DAY' | '3DAYS' | '7DAYS' }): Promise<ApiResponse<PaymentInitiationResponse>> {
    return apiClient.post<ApiResponse<PaymentInitiationResponse>>('/api/v1/payments/pinned-job', data);
  },

  async handleCallback(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/callback', data);
  },

  async getSettings(): Promise<ApiResponse<PlatformSetting[]>> {
    return apiClient.get<ApiResponse<PlatformSetting[]>>('/api/v1/payments/settings');
  },

  async getHistory(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/payments/history?page=${page}&size=${size}`);
  },

  async confirmSpotlight(): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/confirm-spotlight', {});
  },

  async confirmPinnedJob(): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/confirm-pinned-job', {});
  },

  async getPaymentStatus(checkoutRequestId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/payments/status/${checkoutRequestId}`);
  },
};
