import { apiClient, ApiResponse } from '@/lib/api-client';

export const paymentService = {
  async initiateVerifiedBadge(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/verified-badge', data);
  },

  async initiateSpotlight(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/spotlight', data);
  },

  async initiateSearchToken(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/search-token', data);
  },

  async initiateProUpgrade(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/pro-upgrade', data);
  },

  async initiateAnnualMembership(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/annual-membership', data);
  },

  async handleCallback(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/callback', data);
  },

  async getSubscriptions(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/payments/subscriptions');
  },

  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/payments/settings');
  },

  async getHistory(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/payments/history');
  },

  async confirmSpotlight(): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/payments/confirm-spotlight', {});
  },
};
