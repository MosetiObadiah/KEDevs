import { apiClient, ApiResponse } from '@/lib/api-client';

export const spotlightService = {
  async overrideAdminSlot(slotId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/spotlight/admin/slots/${slotId}/override`, data);
  },

  async getMyStatus(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/my-status');
  },

  async getCurrent(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/current');
  },

  async getAvailability(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/spotlight/availability');
  },

  async getAdminSlots(page = 0, size = 20): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/spotlight/admin/slots?page=${page}&size=${size}`);
  }
};
