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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  return (
    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Forum Discussion</h2>
      </div>

      {!isLoggedIn ? (
        <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
          <Info className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
          <div>
            <p className="text-sm font-black text-blue-900 mb-1">Join the Conversation</p>
            <p className="text-xs font-medium text-blue-700 leading-relaxed">
              Sign in to join the discussion, ask questions, and see what other developers are saying about this role.
            </p>
          </div>
        </div>
      ) : (
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                 </div>
                 <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{user?.fullName}</span>
                 <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 h-4 border-slate-200 text-slate-400">YOU</Badge>
              </div>
              
              <Textarea
                className="min-h-[100px] rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 font-medium text-base resize-none"
                placeholder="Ask a question or share an insight about this role..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    Press <kbd className="font-sans px-1.5 py-0.5 rounded border border-slate-200 bg-white">Enter</kbd> to post
                 </p>
                 <Button
                    size="lg"
                    disabled={!newComment.trim() || submitting}
                    onClick={handlePostComment}
                    className="rounded-2xl px-8 font-black shadow-lg shadow-primary/10 h-12"
                 >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Post Comment
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-slate-100" />

      <div className="space-y-6 pb-12">
        {initialComments.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-400">No comments yet</h3>
            <p className="text-slate-400 font-medium">Be the first to start the discussion!</p>
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
    </div>
  );
}
