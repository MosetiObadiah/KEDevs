'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Edit2, 
  Trash2,
  CornerDownRight,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ForumComment } from '@/lib/types/forum';
import { useAuth } from '@/lib/auth/hooks';
import { addReply, editComment, deleteComment, voteComment, flagComment } from '@/lib/api/forum';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: ForumComment;
  jobId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, jobId, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);

  const canEdit = user?.id === comment.authorId;

  const replyMutation = useMutation({
    mutationFn: (text: string) => addReply(jobId, text, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', jobId] });
      setIsReplying(false);
      setReplyText('');
      toast.success('Reply added');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (text: string) => editComment(comment.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', jobId] });
      setIsEditing(false);
      toast.success('Comment updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', jobId] });
      toast.success('Comment deleted');
    }
  });

  const voteMutation = useMutation({
    mutationFn: (type: 'UPVOTE' | 'DOWNVOTE') => voteComment(comment.id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', jobId] }),
  });

  const flagMutation = useMutation({
    mutationFn: (reason: string) => flagComment(comment.id, reason),
    onSuccess: () => toast.success('Comment flagged for review'),
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    updateMutation.mutate(editText);
  };

  if (comment.isHidden) return null;

  return (
    <div className={cn("group", isReply ? "ml-8 mt-4" : "mt-6")}>
      <div className="flex gap-4">
        {isReply && <CornerDownRight className="w-4 h-4 text-[#84A98C] mt-2 flex-shrink-0" />}
        <Avatar className="w-10 h-10 rounded-xl border border-[#CAD2C5]">
          <AvatarImage src={comment.authorProfileImageUrl} />
          <AvatarFallback className="bg-[#f4f6f5] text-[#2F3E46] font-bold">
            {comment.authorName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center">
              <span className="font-bold text-[#2F3E46] text-sm">{comment.authorName}</span>
              <span className="text-[10px] text-[#84A98C] ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && " • edited"}
              </span>
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-full hover:bg-[#CAD2C5]/20 flex items-center justify-center outline-none">
                  <MoreVertical className="w-4 h-4 text-[#84A98C]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-[#CAD2C5]">
                  {canEdit ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer rounded-lg">
                        <Edit2 className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate()} className="gap-2 text-red-600 cursor-pointer rounded-lg">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => {
                        const reason = prompt('Reason for flagging:');
                        if (reason) flagMutation.mutate(reason);
                      }}
                      className="gap-2 text-amber-600 cursor-pointer rounded-lg"
                    >
                      <Flag className="w-4 h-4" /> Flag
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[100px] rounded-xl border-[#CAD2C5]"
              />
              <div className="flex gap-2">
                <Button size="sm" type="submit" disabled={updateMutation.isPending} className="bg-[#52796F] text-white">
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-[#2F3E46] text-sm leading-relaxed whitespace-pre-wrap py-1">
              {comment.content}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center bg-[#f4f6f5] rounded-full px-2 py-0.5 border border-[#CAD2C5]/30">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2 hover:bg-white rounded-full", comment.currentUserVote === 'UPVOTE' && "text-[#52796F]")}
                onClick={() => voteMutation.mutate('UPVOTE')}
              >
                <ThumbsUp className={cn("w-3.5 h-3.5 mr-1", comment.currentUserVote === 'UPVOTE' && "fill-[#52796F]")} />
                <span className="text-[10px] font-bold">{comment.upvoteCount}</span>
              </Button>
              <div className="w-[1px] h-3 bg-[#CAD2C5]/50 mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2 hover:bg-white rounded-full", comment.currentUserVote === 'DOWNVOTE' && "text-red-500")}
                onClick={() => voteMutation.mutate('DOWNVOTE')}
              >
                <ThumbsDown className={cn("w-3.5 h-3.5", comment.currentUserVote === 'DOWNVOTE' && "fill-red-500")} />
              </Button>
            </div>

            {user && !isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsReplying(!isReplying)}
                className="text-[#52796F] text-[10px] font-bold h-7 hover:bg-[#52796F]/5 px-3 rounded-full"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Reply {comment.replyCount > 0 && `(${comment.replyCount})`}
              </Button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleReply} className="mt-4 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] rounded-2xl border-[#CAD2C5] bg-[#f4f6f5]/50"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  type="submit" 
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="bg-[#52796F] text-white font-bold rounded-xl"
                >
                  {replyMutation.isPending && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                  Post Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsReplying(false)}
                  className="rounded-xl font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} jobId={jobId} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
