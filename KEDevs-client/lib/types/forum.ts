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
  upvoteCount: number;
  currentUserVote?: VoteType | null;
  replyCount: number;
  isHidden: boolean;
  isFlagged: boolean;
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
