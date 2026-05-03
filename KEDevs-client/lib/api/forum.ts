import apiClient from '@/lib/apiClient';
import type { ForumComment } from '@/lib/types/forum';
import type { VoteType } from '@/lib/types/job';

export async function getComments(jobId: string): Promise<ForumComment[]> {
  const res = await apiClient.get<{ data: ForumComment[] }>(`/forum/${jobId}/comments`);
  return res.data.data;
}

export async function addComment(
  jobId: string,
  content: string,
  parentCommentId?: string
): Promise<ForumComment> {
  const res = await apiClient.post<{ data: ForumComment }>(`/forum/${jobId}/comments`, {
    content,
    parentCommentId,
  });
  return res.data.data;
}

export async function editComment(commentId: string, content: string): Promise<ForumComment> {
  const res = await apiClient.put<{ data: ForumComment }>(`/forum/comments/${commentId}`, {
    content,
  });
  return res.data.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/forum/comments/${commentId}`);
}

export async function voteComment(commentId: string, voteType: VoteType): Promise<void> {
  await apiClient.post(`/forum/comments/${commentId}/vote`, { voteType });
}

export async function flagComment(commentId: string, reason: string): Promise<void> {
  await apiClient.post(`/forum/comments/${commentId}/flag`, { reason });
}

export async function hideComment(commentId: string): Promise<void> {
  await apiClient.patch(`/forum/comments/${commentId}/hide`);
}

export async function getReplies(commentId: string): Promise<ForumComment[]> {
  const res = await apiClient.get<{ data: ForumComment[] }>(`/forum/comments/${commentId}/replies`);
  return res.data.data;
}
