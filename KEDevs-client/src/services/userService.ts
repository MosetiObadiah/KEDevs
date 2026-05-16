import { apiClient, ApiResponse } from '@/lib/api-client';

export const userService = {
  async blockUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/api/v1/users/${userId}/block`, {});
  },

  async unblockUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/users/${userId}/block`);
  }
};
