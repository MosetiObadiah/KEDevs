import { apiClient, ApiResponse } from '@/lib/api-client';
import { PublicStats } from '@/lib/types';

export const statsService = {
  async getPublicStats(): Promise<ApiResponse<PublicStats>> {
    return apiClient.get<ApiResponse<PublicStats>>('/api/v1/stats/public');
  }
};
