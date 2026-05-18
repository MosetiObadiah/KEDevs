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
import { adminService } from '@/services/adminService';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

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
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagContent, setFlagContent] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const isAuthor = user?.id === comment.authorId;
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 15 * 60 * 1000;
  const canDelete = (isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 60 * 60 * 1000) || isAdmin;

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
    if (!flagContent.trim()) {
      toast.error('Reason for reporting is required.');
      return;
    }
    setIsSubmittingFlag(true);
    try {
      await forumService.flagComment(comment.id, flagContent.trim());
      toast.success('Comment flagged for review');
      setIsFlagOpen(false);
      setFlagContent('');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to flag comment');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const handleAdminHideToggle = async () => {
    try {
      if (comment.isHidden) {
        await forumService.unhideComment(comment.id);
        toast.success('Comment made visible');
      } else {
        await forumService.hideComment(comment.id);
        toast.success('Comment hidden from general view');
      }
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle hide status');
    }
  };

  const handleAdminWarn = async () => {
    const reason = prompt('Reason for warning the user:');
    if (!reason) return;
    try {
      await adminService.performUserAction(comment.authorId, 'WARN', reason);
      toast.success('Formal warning issued to author');
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue warning');
    }
  };

  return (
    <div className={cn(
      "group relative transition-all duration-300",
      isReply ? "ml-8 md:ml-12 border-l-2 border-slate-100 pl-4 md:pl-6 mt-4" : "mt-6"
    )}>
      <div className="flex gap-4">
        {/* Voting Pillar */}
        {!isReply && (
          <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-50/80 rounded-full py-2 px-1 h-fit border border-slate-100/50">
            <button
              onClick={() => handleVote('UPVOTE')}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                comment.currentUserVote === 'UPVOTE' ? "text-primary bg-primary/10" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
                comment.currentUserVote === 'DOWNVOTE' ? "text-danger-500 bg-danger-50" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}
              disabled={isAuthor || !isLoggedIn}
            >
              <ArrowBigDown className={cn("h-5 w-5", comment.currentUserVote === 'DOWNVOTE' && "fill-current")} />
            </button>
          </div>
        )}

        {/* Content Area - Card Wrapped */}
        <div className={cn(
          "flex-1 p-5 rounded-xl-[2rem] border transition-all",
          isAuthor ? "bg-primary/[0.02] border-primary/10 shadow-sm shadow-primary/5" : "bg-slate-50/30 border-slate-100",
          "group-hover:border-primary/20 group-hover:bg-white transition-all duration-500"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 rounded-xl border border-slate-200">
                <AvatarFallback className="text-[10px] font-black bg-slate-900 text-white uppercase">
                  {comment.authorName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-black text-slate-900">{comment.authorName}</span>
              {isAuthor && (
                <Badge variant="outline" className="text-[8px] uppercase font-black px-2 h-4 border-primary/20 text-primary bg-primary/5">YOU</Badge>
              )}
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1 w-1 bg-slate-200 rounded-full" />
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
              {comment.isFlagged && (
                <Badge variant="destructive" className="h-4 px-1 rounded-xl text-[8px] flex gap-0.5 items-center">
                  <ShieldAlert className="h-2.5 w-2.5" /> Flagged
                </Badge>
              )}
              {comment.isHidden && (
                <Badge variant="secondary" className="h-4 px-1 rounded-xl text-[8px] flex gap-0.5 items-center bg-slate-200 text-slate-700">
                  <X className="h-2.5 w-2.5" /> Hidden by Admin
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
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-xl font-medium gap-2">
                      <Edit2 className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="rounded-xl font-medium gap-2 text-danger-500">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                  {!isAuthor && !isAdmin && (
                    <DropdownMenuItem onClick={() => setIsFlagOpen(true)} className="rounded-xl font-medium gap-2">
                      <Flag className="h-4 w-4" /> Report
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={handleAdminHideToggle} className="rounded-xl font-medium gap-2 text-azure-500">
                        <ShieldAlert className="h-4 w-4" /> {comment.isHidden ? 'Unhide Comment' : 'Hide Comment'}
                      </DropdownMenuItem>
                      {comment.authorId && (
                        <DropdownMenuItem onClick={handleAdminWarn} className="rounded-xl font-medium gap-2 text-orange-600">
                          <Flag className="h-4 w-4" /> Warn Author
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-2 animate-in fade-in duration-200">
              <Textarea
                className="min-h-[100px] rounded-xl-[1.5rem] border-slate-200 focus-visible:ring-primary/20 font-medium"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-xl font-medium">
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
              "text-sm leading-relaxed font-medium whitespace-pre-wrap",
              (comment.authorId === null || (comment.isHidden && !isAdmin)) ? "text-slate-500 italic" : "text-slate-700"
            )}>
              {(comment.isHidden && !isAdmin) ? '[This comment has been hidden by an administrator]' : comment.content}
            </p>
          )}

          {/* Action Row */}
          {!isEditing && (
            <div className="flex gap-4 pt-3 mt-1 border-t border-slate-50/50">
              {!isReply && isLoggedIn && comment.authorId !== null && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}
              {isReply && isLoggedIn && comment.authorId !== null && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleVote('UPVOTE')} className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors", comment.currentUserVote === 'UPVOTE' ? "text-primary" : "text-slate-500 hover:text-slate-700")}>
                    <ArrowBigUp className="h-3 w-3" /> {comment.upvoteCount}
                  </button>
                </div>
              )}
            </div>
          )}

          {isReplying && (
            <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3">
                <div className="w-1 border-l-2 border-primary rounded-full ml-2" />
                <div className="flex-1 space-y-3">
                  <Textarea
                    className="min-h-[80px] rounded-xl-[1.5rem] border-slate-200 focus-visible:ring-primary/20 font-medium"
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="rounded-xl font-medium">
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

      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Flag className="h-6 w-6" />
              </div>
              Report Comment
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Please describe why you are reporting this comment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Reason for Reporting</span>
                <span className={cn(flagContent.length > 500 ? "text-destructive" : "")}>
                  {flagContent.length}/500
                </span>
              </Label>
              <Textarea
                placeholder="e.g. Inappropriate language, spam..."
                className="min-h-[120px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-destructive/20"
                value={flagContent}
                onChange={(e) => setFlagContent(e.target.value.slice(0, 500))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-medium" onClick={() => setIsFlagOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl font-black px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleFlag}
              disabled={isSubmittingFlag || !flagContent.trim()}
            >
              {isSubmittingFlag ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
