import { apiClient, ApiResponse } from '@/lib/api-client';

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async submitMessage(data: ContactSubmission): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/v1/contact', data);
  },

  async getSupportMessages(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/contact/messages?page=${page}&size=${size}`);
  },

  async markMessageRead(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/contact/messages/${id}/read`, {});
  },

  async replyToMessage(id: string, replyMessage: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/contact/messages/${id}/reply`, { replyMessage });
  },
};
