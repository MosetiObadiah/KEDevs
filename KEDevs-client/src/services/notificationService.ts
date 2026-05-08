import { apiClient, ApiResponse } from '@/lib/api-client';

export const notificationService = {
  async getPreferences(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/notifications/preferences');
  },

  async updatePreferences(data: any): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>('/api/v1/notifications/preferences', data);
  },

  async markRead(notificationId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/notifications/${notificationId}/read`, {});
  },

  async markAllRead(): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>('/api/v1/notifications/read-all', {});
  },

  async getNotifications(page = 0, size = 20): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/notifications?page=${page}&size=${size}`);
  },

  async getUnread(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/notifications/unread');
  },

  async getUnreadCount(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/v1/notifications/unread-count');
  },
};
