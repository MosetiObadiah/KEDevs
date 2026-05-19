'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Send, MessageSquare, Info, Loader2, Reply, X } from 'lucide-react';
import CommentItem from './CommentItem';
import { forumService } from '@/services/forumService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ForumProps {
  jobId: string;
  jobTitle?: string;
  initialComments: any[];
  onRefresh: () => void;
}

export default function Forum({ jobId, jobTitle, initialComments, onRefresh }: ForumProps) {
  const { isLoggedIn, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      let response;
      if (replyingTo) {
        response = await forumService.replyToComment(jobId, replyingTo.id, newComment.trim());
      } else {
        response = await forumService.postJobComment(jobId, newComment.trim());
      }
      
      if (response.success) {
        setNewComment('');
        setReplyingTo(null);
        onRefresh();
        toast.success(replyingTo ? 'Reply posted successfully' : 'Comment posted successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyClick = (id: string, authorName: string) => {
    setReplyingTo({ id, authorName });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Breadcrumbs replacing redundant title */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
        <Link href="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
        <span className="text-slate-350">/</span>
        <span className="max-w-[180px] truncate text-slate-550">{jobTitle || 'Job details'}</span>
        <span className="text-slate-355">/</span>
        <span className="text-slate-900 font-bold">Discussion</span>
      </div>

      <div className="space-y-6">
        {initialComments.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-2xl animate-in fade-in duration-700">
            <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No comments yet</h3>
            <p className="text-slate-500 font-medium">Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {initialComments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                jobId={jobId} 
                onUpdate={onRefresh}
                onReply={handleReplyClick}
              />
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-slate-100" />

      <div className="sticky bottom-6 z-30">
        {!isLoggedIn ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 shadow-sm">
            <Info className="h-6 w-6 text-slate-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">Join the Conversation</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Sign in to join the discussion, ask questions, and see what other developers are saying about this role.
              </p>
            </div>
          </div>
        ) : (
          /* Redesigned Compact Compose Box */
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
            {/* Avatar and name header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 rounded-full border border-slate-200">
                  <AvatarFallback className="text-[9px] font-bold bg-slate-900 text-white uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-slate-800">{user?.fullName}</span>
                <Badge variant="outline" className="text-[9px] uppercase font-semibold px-1.5 py-0.5 border-slate-200 text-slate-650 bg-slate-50 select-none">YOU</Badge>
              </div>
            </div>

            {/* Replying indicator */}
            {replyingTo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg w-fit animate-in fade-in slide-in-from-top-1 select-none border border-slate-100">
                <Reply className="h-3.5 w-3.5" />
                <span>Replying to {replyingTo.authorName}</span>
                <button onClick={() => setReplyingTo(null)} className="ml-1 text-slate-400 hover:text-slate-750 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              className="min-h-[70px] rounded-xl border-slate-200 focus-visible:ring-primary/20 font-medium text-sm p-3 resize-none bg-slate-50/20"
              placeholder="Share an insight or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
            />

            {/* Footer details */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 select-none">Shift + Enter for new line</span>
              <Button
                onClick={handlePostComment}
                disabled={!newComment.trim() || submitting}
                className="rounded-xl px-5 h-9 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-sm flex gap-2 items-center transition-colors"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
