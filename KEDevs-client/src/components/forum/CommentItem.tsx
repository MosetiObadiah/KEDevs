'use client';

import React, { useState } from 'react';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  MoreHorizontal, 
  Flag, 
  Edit2, 
  Trash2,
  Check,
  X,
  Reply,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { forumService } from '@/services/forumService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface CommentProps {
  comment: any;
  jobId: string;
  onUpdate: () => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, jobId, onUpdate, isReply = false }: CommentProps) {
  const { user, isLoggedIn } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = user?.id === comment.authorId;
  const canEdit = isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 15 * 60 * 1000;
  const canDelete = isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 60 * 60 * 1000;

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isLoggedIn) {
      toast.error('Please login to vote');
      return;
    }
    try {
      await forumService.voteComment(comment.id, type);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await forumService.replyToComment(jobId, comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
      onUpdate();
      toast.success('Reply posted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await forumService.editComment(comment.id, editContent.trim());
      setIsEditing(false);
      onUpdate();
      toast.success('Comment updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to edit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await forumService.deleteComment(comment.id);
      onUpdate();
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Reason for flagging:');
    if (!reason) return;
    try {
      await forumService.flagComment(comment.id, reason);
      toast.success('Comment flagged for review');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to flag comment');
    }
  };

  return (
    <div className={cn(
      "group relative transition-all duration-300",
      isReply ? "ml-8 md:ml-12 border-l-2 border-slate-100 pl-4 md:pl-6 mt-4" : "mt-6"
    )}>
      <div className="flex gap-4">
        {/* Voting Pillar */}
        <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-50/80 rounded-full py-2 px-1 h-fit border border-slate-100/50">
          <button 
            onClick={() => handleVote('UPVOTE')}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              comment.currentUserVote === 'UPVOTE' ? "text-primary bg-primary/10" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
            disabled={isAuthor || !isLoggedIn}
          >
            <ArrowBigUp className={cn("h-5 w-5", comment.currentUserVote === 'UPVOTE' && "fill-current")} />
          </button>
          <span className="text-xs font-black text-slate-700 min-w-[20px] text-center">
            {comment.upvoteCount}
          </span>
          <button 
            onClick={() => handleVote('DOWNVOTE')}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              comment.currentUserVote === 'DOWNVOTE' ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
            disabled={isAuthor || !isLoggedIn}
          >
            <ArrowBigDown className={cn("h-5 w-5", comment.currentUserVote === 'DOWNVOTE' && "fill-current")} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 rounded-lg border border-slate-200">
                <AvatarFallback className="text-[10px] font-black bg-slate-900 text-white">
                  {comment.authorName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-black text-slate-900">{comment.authorName}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                • {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
              {comment.isFlagged && (
                <Badge variant="destructive" className="h-4 px-1 rounded text-[8px] flex gap-0.5 items-center">
                  <ShieldAlert className="h-2.5 w-2.5" /> Flagged
                </Badge>
              )}
            </div>

            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-xl font-bold gap-2">
                      <Edit2 className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="rounded-xl font-bold gap-2 text-red-500">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                  {!isAuthor && (
                    <DropdownMenuItem onClick={handleFlag} className="rounded-xl font-bold gap-2">
                      <Flag className="h-4 w-4" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-2 animate-in fade-in duration-200">
              <Textarea
                className="min-h-[100px] rounded-[1.5rem] border-slate-200 focus-visible:ring-primary/20 font-medium"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={submitting} className="rounded-xl font-black gap-2">
                   {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                   Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <p className={cn(
              "text-sm leading-relaxed font-medium",
              comment.authorId === null ? "text-slate-400 italic" : "text-slate-600"
            )}>
              {comment.content}
            </p>
          )}

          {/* Action Row */}
          {!isEditing && (
            <div className="flex gap-4 pt-1">
              {!isReply && isLoggedIn && comment.authorId !== null && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}
            </div>
          )}

          {isReplying && (
            <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3">
                <div className="w-1 border-l-2 border-primary rounded-full ml-2" />
                <div className="flex-1 space-y-3">
                  <Textarea
                    className="min-h-[80px] rounded-[1.5rem] border-slate-200 focus-visible:ring-primary/20 font-medium"
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="rounded-xl font-bold">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handlePostReply} disabled={submitting} className="rounded-xl font-black gap-2">
                       {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Reply className="h-3 w-3" />}
                       Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  jobId={jobId} 
                  onUpdate={onUpdate} 
                  isReply={true} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
