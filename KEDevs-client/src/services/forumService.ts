import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';

export const forumService = {
  async getJobComments(jobId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/forum/jobs/${jobId}/comments`);
  },

  async postJobComment(jobId: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/forum/jobs/${jobId}/comments`, { content });
  },

  async replyToComment(jobId: string, commentId: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/forum/jobs/${jobId}/replies`, { parentCommentId: commentId, content });
  },

  async voteComment(commentId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}/vote`, {});
  },

  async flagComment(commentId: string, reason: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}/flag`, { reason });
  },

  async editComment(commentId: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}`, { content });
  },

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/forum/comments/${commentId}`);
  },

  async getUserComments(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/forum/users/${userId}/comments`);
  },

  async getCommentReplies(commentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}/replies`);
  },

  async hideComment(commentId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}/hide`, {});
  },

  async unhideComment(commentId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/v1/forum/comments/${commentId}/unhide`, {});
  },
};
