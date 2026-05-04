'use client';

import { useState } from 'react';
import { ForumComment } from '@/lib/types/forum';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoteButtons } from '@/components/jobs/VoteButtons';
import { 
  MessageSquare, 
  Flag, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  EyeOff, 
  ChevronDown, 
  ChevronUp,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth/hooks';
import { 
  voteComment, 
  addComment, 
  addReply,
  editComment, 
  deleteComment, 
  hideComment, 
  getReplies 
} from '@/lib/api/forum';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: ForumComment;
  jobId: string;
  depth?: number;
}

export function CommentItem({ comment, jobId, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: replies, isLoading: isLoadingReplies } = useQuery({
    queryKey: ['forum', comment.id, 'replies'],
    queryFn: () => getReplies(comment.id),
    enabled: isExpanded,
  });

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      await voteComment(comment.id, type);
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
      throw error;
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      await addReply(jobId, replyContent, comment.id);
      toast.success('Reply posted');
      setReplyContent('');
      setIsReplyOpen(false);
      setIsExpanded(true);
      queryClient.invalidateQueries({ queryKey: ['forum', comment.id, 'replies'] });
      queryClient.invalidateQueries({ queryKey: ['forum', jobId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to post reply');
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await editComment(comment.id, editContent);
      toast.success('Comment updated');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['forum', jobId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(comment.id);
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['forum', jobId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const canEdit = user?.id === comment.authorId && 
    (Date.now() - new Date(comment.createdAt).getTime()) < 15 * 60 * 1000;

  if (comment.isHidden && user?.role !== 'ADMIN') return null;

  return (
    <div className={cn(
      "relative pl-4 border-l-2 border-[#CAD2C5]/30 mt-6 first:mt-0",
      depth > 0 ? "ml-4" : ""
    )}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarImage src={comment.authorProfileImageUrl} />
            <AvatarFallback className="bg-[#52796F] text-white font-bold">
              {comment.authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <VoteButtons
            initialUpvotes={comment.upvoteCount}
            initialUserVote={comment.currentUserVote}
            onVote={handleVote}
            size="sm"
            className="p-0.5"
          />
        </div>

        <div className="flex-1 bg-white rounded-2xl p-4 border border-[#CAD2C5]/50 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold text-[#2F3E46] text-sm">{comment.authorName}</span>
              <span className="text-[10px] text-[#84A98C] ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.editedAt && " • edited"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                <MoreVertical className="w-4 h-4 text-[#84A98C]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {user?.id === comment.authorId && (
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => hideComment(comment.id)}>
                    <EyeOff className="w-4 h-4 mr-2" /> Hide (Admin)
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div className="space-y-3 mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" className="bg-[#52796F] text-white" onClick={handleEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#354F52] leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4">
            {depth < 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-[#52796F] hover:bg-[#52796F]/5"
                onClick={() => setIsReplyOpen(!isReplyOpen)}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Reply
              </Button>
            )}
            
            {comment.replyCount > 0 && depth < 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-[#84A98C]"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 mr-1.5" /> : <ChevronDown className="w-3.5 h-3.5 mr-1.5" />}
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {isReplyOpen && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsReplyOpen(false)}>Cancel</Button>
                <Button size="sm" className="bg-[#52796F] text-white" onClick={handleReply}>Post Reply</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2">
          {isLoadingReplies ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#52796F]" />
            </div>
          ) : (
            replies?.content.map(reply => (
              <CommentItem key={reply.id} comment={reply} jobId={jobId} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
