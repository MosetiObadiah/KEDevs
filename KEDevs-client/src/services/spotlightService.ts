import { apiClient, ApiResponse } from '@/lib/api-client';

export const spotlightService = {
  async getCurrentSpotlight(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/current');
  },

  async getAvailability(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/availability');
  },

  async getMyStatus(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/my-status');
  },

  async getSlotHistory(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/admin/slots');
  },

  async adminOverride(slotId: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/spotlight/admin/slots/${slotId}/override`, { reason });
  },
};
