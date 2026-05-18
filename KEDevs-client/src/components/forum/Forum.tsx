'use client';

import React, { useState } from 'react';
import { Send, MessageSquare, Info, Loader2 } from 'lucide-react';
import CommentItem from './CommentItem';
import { forumService } from '@/services/forumService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ForumProps {
  jobId: string;
  initialComments: any[];
  onRefresh: () => void;
}

export default function Forum({ jobId, initialComments, onRefresh }: ForumProps) {
  const { isLoggedIn, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await forumService.postJobComment(jobId, newComment.trim());
      if (response.success) {
        setNewComment('');
        onRefresh();
        toast.success('Comment posted successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl-[1.25rem] bg-primary/10 text-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Forum Discussion</h2>
      </div>

      <div className="space-y-6">
        {initialComments.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-xl-[3rem] animate-in fade-in duration-700">
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
              />
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-slate-100" />

      <div className="sticky bottom-6 z-30">
        {!isLoggedIn ? (
          <div className="p-6 rounded-xl-[2rem] bg-azure-50/90 backdrop-blur border border-azure-100 flex items-start gap-4 shadow-xl shadow-azure-500/5">
            <Info className="h-6 w-6 text-azure-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-black text-azure-900 mb-1">Join the Conversation</p>
              <p className="text-xs font-medium text-azure-700 leading-relaxed">
                Sign in to join the discussion, ask questions, and see what other developers are saying about this role.
              </p>
            </div>
          </div>
        ) : (
          <Card className="rounded-xl-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden bg-white/95 backdrop-blur">
            <CardContent className="p-4 px-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[8px] font-black uppercase">
                         {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{user?.fullName}</span>
                      <Badge variant="outline" className="text-[7px] uppercase font-black px-1.5 h-3.5 border-primary/20 text-primary bg-primary/5">YOU</Badge>
                   </div>
                   <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest px-2">
                      <kbd className="font-sans px-1 py-0.5 rounded-xl border border-slate-200 bg-white">Shift + Enter</kbd> for new line
                   </p>
                </div>
                
                <div className="flex gap-3 items-end">
                   <Textarea
                     className="min-h-[48px] h-[48px] rounded-xl-[1.25rem] border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 font-medium text-sm resize-none py-3"
                     placeholder="Share an insight..."
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                       }
                     }}
                   />
                   <Button
                      size="icon"
                      disabled={!newComment.trim() || submitting}
                      onClick={handlePostComment}
                      className="rounded-xl shrink-0 shadow-lg shadow-primary/10 h-12 w-12"
                   >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
