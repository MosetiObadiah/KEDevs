// src/services/chatService.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api-client';

export interface ConversationSummary {
  id: string;
  contactRequestId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  developerAccepted: boolean;
  employerAccepted: boolean;
  blockedByDeveloper: boolean;
  blockedByEmployer: boolean;
  deletedByDeveloper: boolean;
  deletedByEmployer: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export const chatService = {
  async getConversations(): Promise<ApiResponse<ConversationSummary[]>> {
    return apiClient.get<ApiResponse<ConversationSummary[]>>('/api/v1/chat/conversations');
  },

  async getMessages(
    conversationId: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<ChatMessage>>>(
      `/api/v1/chat/conversations/${conversationId}/messages?page=${page}&size=${size}&sort=createdAt,desc`
    );
  },

  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ApiResponse<ChatMessage>>(`/api/v1/chat/conversations/${conversationId}/messages`, {
      content,
    });
  },

  async acceptConversation(conversationId: string): Promise<ApiResponse<ConversationSummary>> {
    return apiClient.post<ApiResponse<ConversationSummary>>(`/api/v1/chat/conversations/${conversationId}/accept`, {});
  },

  async toggleBlock(conversationId: string): Promise<ApiResponse<ConversationSummary>> {
    return apiClient.post<ApiResponse<ConversationSummary>>(`/api/v1/chat/conversations/${conversationId}/toggle-block`, {});
  },

  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/chat/conversations/${conversationId}`);
  },
};
