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
  }
};
