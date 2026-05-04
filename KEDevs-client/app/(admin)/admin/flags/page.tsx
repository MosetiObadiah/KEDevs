'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Flag, FileText, MessageSquare, Users, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminFlagsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('jobs');
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewConfig, setReviewConfig] = useState<{ id: string, type: string, reporter: string, reason: string } | null>(null);
  const [action, setAction] = useState<string>('DISMISS');
  const [adminReason, setAdminReason] = useState('');

  const { data: jobFlags, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin', 'flags', 'jobs'],
    queryFn: adminApi.getJobFlags,
  });

  const { data: commentFlags, isLoading: commentsLoading } = useQuery({
    queryKey: ['admin', 'flags', 'comments'],
    queryFn: adminApi.getCommentFlags,
  });

  const { data: userFlags, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'flags', 'users'],
    queryFn: adminApi.getUserFlags,
  });

  const reviewJobFlagMutation = useMutation({
    mutationFn: ({ id, act, rsn }: any) => adminApi.reviewJobFlag(id, act, rsn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags', 'jobs'] });
      closeModal();
      toast.success('Job flag reviewed');
    }
  });

  const reviewCommentFlagMutation = useMutation({
    mutationFn: ({ id, act, rsn }: any) => adminApi.reviewCommentFlag(id, act, rsn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags', 'comments'] });
      closeModal();
      toast.success('Comment flag reviewed');
    }
  });

  const reviewUserFlagMutation = useMutation({
    mutationFn: ({ id, act, rsn }: any) => adminApi.reviewUserFlag(id, act, rsn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags', 'users'] });
      closeModal();
      toast.success('User flag reviewed');
    }
  });

  const handleReviewClick = (flag: any, type: string) => {
    setReviewConfig({ id: flag.id, type, reporter: flag.reporterName, reason: flag.reason });
    setAction('DISMISS');
    setAdminReason('');
    setReviewModalOpen(true);
  };

  const closeModal = () => {
    setReviewModalOpen(false);
    setReviewConfig(null);
    setAdminReason('');
  };

  const submitReview = () => {
    if (!reviewConfig) return;
    
    if (reviewConfig.type === 'job') {
      reviewJobFlagMutation.mutate({ id: reviewConfig.id, act: action, rsn: adminReason });
    } else if (reviewConfig.type === 'comment') {
      reviewCommentFlagMutation.mutate({ id: reviewConfig.id, act: action, rsn: adminReason });
    } else if (reviewConfig.type === 'user') {
      reviewUserFlagMutation.mutate({ id: reviewConfig.id, act: action, rsn: adminReason });
    }
  };

  const isPending = reviewJobFlagMutation.isPending || reviewCommentFlagMutation.isPending || reviewUserFlagMutation.isPending;

  const renderFlagCard = (flag: any, type: string) => (
    <Card key={flag.id} className="border-secondary shadow-sm mb-4 group hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={flag.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}>
                {flag.status}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">#{flag.id.slice(0, 8)}</span>
            </div>
            <h4 className="font-black text-lg text-foreground mt-2">
              {flag.targetTitle || `Target ID: ${flag.targetId}`}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Reported by <span className="text-primary">{flag.reporterName}</span> on {new Date(flag.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {flag.status === 'PENDING' && (
            <Button onClick={() => handleReviewClick(flag, type)} className="bg-primary hover:bg-[#354F52] text-white font-bold rounded-xl px-6">
              Take Action
            </Button>
          )}
        </div>
        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Flag className="w-8 h-8 text-red-900" />
          </div>
          <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 opacity-60">Report Details</p>
          <p className="text-sm text-red-800 font-medium leading-relaxed">{flag.reason}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Flag Management</h1>
        <p className="text-muted-foreground mt-1 font-medium">Review reported jobs, comments, and users</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-secondary rounded-2xl h-14 p-1.5 shadow-sm">
          <TabsTrigger value="jobs" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary">
            <FileText className="w-4 h-4 mr-2" /> Jobs
            {jobFlags && jobFlags.filter(f => f.status === 'PENDING').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white border-transparent px-1.5 py-0.5 text-[10px]">
                {jobFlags.filter(f => f.status === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary">
            <MessageSquare className="w-4 h-4 mr-2" /> Comments
            {commentFlags && commentFlags.filter(f => f.status === 'PENDING').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white border-transparent px-1.5 py-0.5 text-[10px]">
                {commentFlags.filter(f => f.status === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary">
            <Users className="w-4 h-4 mr-2" /> Users
            {userFlags && userFlags.filter(f => f.status === 'PENDING').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white border-transparent px-1.5 py-0.5 text-[10px]">
                {userFlags.filter(f => f.status === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          {jobsLoading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : 
            (!jobFlags || jobFlags.length === 0) ? <p className="text-center text-muted-foreground p-12">No job flags.</p> :
            jobFlags.map((f: any) => renderFlagCard(f, 'job'))}
        </TabsContent>

        <TabsContent value="comments">
          {commentsLoading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : 
            (!commentFlags || commentFlags.length === 0) ? <p className="text-center text-muted-foreground p-12">No comment flags.</p> :
            commentFlags.map((f: any) => renderFlagCard(f, 'comment'))}
        </TabsContent>

        <TabsContent value="users">
          {usersLoading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : 
            (!userFlags || userFlags.length === 0) ? <p className="text-center text-muted-foreground p-12">No user flags.</p> :
            userFlags.map((f: any) => renderFlagCard(f, 'user'))}
        </TabsContent>
      </Tabs>

      <Dialog open={reviewModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Review Flag</DialogTitle>
            <DialogDescription>
              Reported by {reviewConfig?.reporter}.<br/>
              Reason: {reviewConfig?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={action} onValueChange={(val) => setAction(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISMISS">Dismiss Flag</SelectItem>
                  {reviewConfig?.type === 'job' && (
                    <>
                      <SelectItem value="REMOVE_JOB">Remove Job</SelectItem>
                      <SelectItem value="WARN_POSTER">Warn Poster</SelectItem>
                      <SelectItem value="BAN_POSTER">Ban Poster</SelectItem>
                    </>
                  )}
                  {reviewConfig?.type === 'comment' && (
                    <>
                      <SelectItem value="HIDE_COMMENT">Hide Comment</SelectItem>
                      <SelectItem value="DELETE_COMMENT">Delete Comment</SelectItem>
                      <SelectItem value="WARN_AUTHOR">Warn Author</SelectItem>
                    </>
                  )}
                  {reviewConfig?.type === 'user' && (
                    <>
                      <SelectItem value="WARN">Warn User</SelectItem>
                      <SelectItem value="SUSPEND">Suspend User</SelectItem>
                      <SelectItem value="BAN">Ban User</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for action</label>
              <Textarea 
                placeholder="Reason (will be logged in audit trail)..." 
                value={adminReason}
                onChange={e => setAdminReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={submitReview} disabled={isPending || !adminReason}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
