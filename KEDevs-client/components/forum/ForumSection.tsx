'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, addComment } from '@/lib/api/forum';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/hooks';

interface ForumSectionProps {
  jobId: string;
}

export function ForumSection({ jobId }: ForumSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['forum', jobId],
    queryFn: () => getComments(jobId),
  });

  const postMutation = useMutation({
    mutationFn: (content: string) => addComment(jobId, content),
    onSuccess: () => {
      setNewComment('');
      toast.success('Comment posted successfully');
      queryClient.invalidateQueries({ queryKey: ['forum', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postMutation.mutate(newComment);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#52796F]/10 rounded-xl">
          <MessageSquare className="w-5 h-5 text-[#52796F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#2F3E46]">Discussion</h2>
        <span className="bg-[#f4f6f5] text-[#84A98C] text-xs font-bold px-2 py-0.5 rounded-full">
          {comments?.totalElements || 0}
        </span>
      </div>

      {/* Post New Comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-[#CAD2C5]/50 shadow-sm space-y-4">
          <div className="flex gap-4">
             <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts or ask a question about this role..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] bg-[#f4f6f5] border-0 focus-visible:ring-1 focus-visible:ring-[#52796F] rounded-2xl resize-none"
                />
             </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={postMutation.isPending || !newComment.trim()}
              className="bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl px-6 font-bold"
            >
              {postMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-[#f4f6f5] rounded-3xl p-8 text-center border-2 border-dashed border-[#CAD2C5]">
          <p className="text-[#354F52] font-medium mb-4">Join the discussion</p>
          <Button variant="outline" className="rounded-xl border-[#CAD2C5]">
            Sign in to comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-[#f4f6f5] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#f4f6f5] rounded w-1/4" />
                <div className="h-16 bg-[#f4f6f5] rounded w-full" />
              </div>
            </div>
          ))
        ) : (!comments || comments.content.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-[#84A98C] text-sm">No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          comments.content.map((comment) => (
            <CommentItem key={comment.id} comment={comment} jobId={jobId} />
          ))
        )}
      </div>
    </div>
  );
}
