import type { VoteType, FlagStatus } from './job';

export type CommentFlagStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

export interface ForumComment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorProfileImageUrl?: string;
  content: string;
  parentCommentId?: string | null;
  replies: ForumComment[];
  upvotes: number;
  downvotes: number;
  userVote?: VoteType | null;
  isHidden: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentVote {
  id: string;
  commentId: string;
  userId: string;
  voteType: VoteType;
  createdAt: string;
}

export interface CommentFlag {
  id: string;
  commentId: string;
  userId: string;
  reason: string;
  status: CommentFlagStatus;
  createdAt: string;
}

export type { VoteType, FlagStatus };
