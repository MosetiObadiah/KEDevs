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
  Loader2,
  Share2
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
  onReply?: (id: string, authorName: string) => void;
}

export default function CommentItem({ comment, jobId, onUpdate, isReply = false, onReply }: CommentProps) {
  const { user, isLoggedIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
    if (isAuthor) {
      toast.error('You cannot vote on your own comment');
      return;
    }
    try {
      await forumService.voteComment(comment.id, type);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
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

  const renderRoleBadge = (role?: string) => {
    if (!role) return null;
    switch (role.toUpperCase()) {
      case 'APPLICANT':
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none shrink-0">
            Applicant
          </Badge>
        );
      case 'EMPLOYER':
        return (
          <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none shrink-0">
            Employer
          </Badge>
        );
      case 'DEVELOPER':
        return (
          <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none shrink-0">
            Developer
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge className="bg-purple-50 hover:bg-purple-50 text-purple-700 border-purple-100 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none shrink-0">
            Admin
          </Badge>
        );
      default:
        return null;
    }
  };

  const replyTargetId = isReply ? comment.parentCommentId : comment.id;

  return (
    <div className={cn(
      "group relative transition-all duration-300",
      isReply ? "ml-10 mt-4" : "mt-6"
    )}>
      <div className="flex gap-4">
        {/* Content Area - Card Wrapped */}
        <div className={cn(
          "flex-1 p-5 rounded-2xl border transition-all",
          isAuthor ? "bg-primary/[0.01] border-slate-200/80 shadow-sm" : "bg-white border-slate-250/80 shadow-sm",
          "group-hover:border-slate-350 transition-all duration-300"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Avatar className="h-7 w-7 rounded-full border border-slate-200 shrink-0">
                <AvatarFallback className="text-[10px] font-black bg-slate-900 text-white uppercase">
                  {comment.authorName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-slate-800 shrink-0">{comment.authorName}</span>
              {isAuthor && (
                <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 h-4.5 border-primary/20 text-primary bg-primary/5 select-none shrink-0">YOU</Badge>
              )}
              {renderRoleBadge(comment.authorRole)}
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 select-none shrink-0">
                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
              {comment.isFlagged && (
                <Badge variant="destructive" className="h-4 px-1 rounded-xl text-[8px] flex gap-0.5 items-center select-none shrink-0">
                  <ShieldAlert className="h-2.5 w-2.5" /> Flagged
                </Badge>
              )}
              {comment.isHidden && (
                <Badge variant="secondary" className="h-4 px-1 rounded-xl text-[8px] flex gap-0.5 items-center bg-slate-200 text-slate-700 select-none shrink-0">
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
                className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-primary/20 font-medium text-sm"
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
              "text-sm leading-relaxed font-medium whitespace-pre-wrap py-1 text-slate-800",
              (comment.authorId === null || (comment.isHidden && !isAdmin)) ? "text-slate-500 italic" : ""
            )}>
              {(comment.isHidden && !isAdmin) ? '[This comment has been hidden by an administrator]' : comment.content}
            </p>
          )}

          {/* Action Row */}
          {!isEditing && (
            <div className="flex flex-wrap gap-3 items-center pt-3 mt-3 border-t border-slate-100">
              {/* Vote buttons container */}
              <div className="flex items-center gap-1 bg-slate-50/50 border border-slate-100 rounded-xl p-0.5">
                <button
                  onClick={() => handleVote('UPVOTE')}
                  className={cn(
                    "p-1.5 px-3 rounded-lg transition-colors flex items-center gap-1",
                    comment.currentUserVote === 'UPVOTE'
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  )}
                  disabled={!isLoggedIn}
                  title="Upvote"
                >
                  <ArrowBigUp className={cn("h-4 w-4", comment.currentUserVote === 'UPVOTE' && "fill-current")} />
                  <span className="text-xs font-bold">{comment.upvoteCount}</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-200 self-center" />
                <button
                  onClick={() => handleVote('DOWNVOTE')}
                  className={cn(
                    "p-1.5 px-2 rounded-lg transition-colors",
                    comment.currentUserVote === 'DOWNVOTE'
                      ? "text-danger-500 bg-danger-50"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  )}
                  disabled={!isLoggedIn}
                  title="Downvote"
                >
                  <ArrowBigDown className={cn("h-4 w-4", comment.currentUserVote === 'DOWNVOTE' && "fill-current")} />
                </button>
              </div>

              {/* Reply Button */}
              {isLoggedIn && comment.authorId !== null && onReply && (
                <button
                  onClick={() => onReply(replyTargetId, comment.authorName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}#comment-${comment.id}`);
                  toast.success("Link copied to clipboard!");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>

              {/* Report Button */}
              {!isAuthor && !isAdmin && isLoggedIn && (
                <button
                  onClick={() => setIsFlagOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-auto"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </button>
              )}
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
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-8 bg-white">
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
                className="min-h-[120px] rounded-xl border-slate-200 resize-none font-medium text-sm p-4 focus-visible:ring-destructive/20"
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
