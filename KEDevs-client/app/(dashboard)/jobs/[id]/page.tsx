'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getJob, voteJob, updateJobStatus, deleteJob, applyToJob } from '@/lib/api/jobs';
import { ForumSection } from '@/components/forum/ForumSection';
import { VoteButtons } from '@/components/jobs/VoteButtons';
import { JobFormModal } from '@/components/jobs/JobFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Share2, 
  ChevronLeft,
  Settings,
  XCircle,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth/hooks';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function JobDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyContent, setApplyContent] = useState('');

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => getJob(id),
  });

  const voteMutation = useMutation({
    mutationFn: (type: 'UPVOTE' | 'DOWNVOTE') => voteJob(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs', id] }),
  });

  const applyMutation = useMutation({
    mutationFn: (data: { coverLetter: string }) => applyToJob(id, data),
    onSuccess: () => {
      toast.success('Application sent successfully!');
      setIsApplyModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
    },
    onError: (error: any) => toast.error(error.message || 'Failed to apply'),
  });

  const closeJobMutation = useMutation({
    mutationFn: () => updateJobStatus(id, 'CLOSED'),
    onSuccess: () => {
      toast.success('Job marked as closed');
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: () => deleteJob(id),
    onSuccess: () => {
      toast.success('Job deleted successfully');
      router.push('/dashboard');
    },
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-8">
      <div className="h-10 bg-[#f4f6f5] rounded-xl w-1/4" />
      <div className="h-40 bg-[#f4f6f5] rounded-3xl w-full" />
      <div className="h-96 bg-[#f4f6f5] rounded-3xl w-full" />
    </div>
  );

  if (!job) return (
    <div className="max-w-4xl mx-auto p-24 text-center">
      <h2 className="text-2xl font-bold text-[#2F3E46]">Opportunity not found</h2>
      <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
    </div>
  );

  const isOwner = user?.id === job.employerId;
  const canApply = user && user.role === 'DEVELOPER' && !isOwner && !job.hasApplied && job.status === 'OPEN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-[#52796F] hover:text-[#354F52] mb-8 group">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white rounded-[40px] p-8 md:p-12 border border-[#CAD2C5]/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <Badge className={cn(
                 "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border-0",
                 job.status === 'OPEN' ? "bg-teal/10 text-teal" : "bg-red-500/10 text-red-500"
               )}>
                 {job.status}
               </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2F3E46] leading-tight mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-[#84A98C] font-semibold">
                  <span className="hover:text-[#52796F] transition-colors">{job.companyName}</span>
                  <span>•</span>
                  <span>{job.locationCity || 'Remote'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] h-8 px-4 font-bold border-0">
                  <Briefcase className="w-3.5 h-3.5 mr-2" />
                  {job.jobType}
                </Badge>
                <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] h-8 px-4 font-bold border-0">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  {job.workType}
                </Badge>
                <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] h-8 px-4 font-bold border-0">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                  {job.experienceLevel}
                </Badge>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="bg-[#f4f6f5]/30 rounded-3xl p-6 md:p-8 border border-[#CAD2C5]/20">
                  <h3 className="text-lg font-bold text-[#2F3E46] mb-4">Role Description</h3>
                  <p className="text-[#354F52] leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-2">
                {(job.tags || []).map((tag, idx) => {
                  const tagStr = typeof tag === 'string' ? tag : tag.tag;
                  const tagId = typeof tag === 'string' ? `tag-${tag}-${idx}` : tag.id;
                  return (
                    <Badge key={tagId} variant="outline" className="rounded-xl px-4 py-1.5 border-[#CAD2C5] text-[#52796F] font-semibold">
                      #{tagStr}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Forum Section */}
          <section className="bg-white rounded-[40px] p-8 md:p-12 border border-[#CAD2C5]/50 shadow-sm">
             <ForumSection jobId={id} />
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside className="space-y-6">
          <div className="bg-[#2F3E46] text-white rounded-[40px] p-8 shadow-2xl sticky top-24">
             <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                   <p className="text-[#CAD2C5]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Community Trust</p>
                   <div className="flex justify-center">
                     <VoteButtons
                        initialUpvotes={job.upvotes || 0}
                        initialDownvotes={job.downvotes || 0}
                        initialUserVote={job.userVote}
                        onVote={(type) => voteMutation.mutateAsync(type)}
                        orientation="horizontal"
                        className="bg-white/10 border-white/5"
                     />
                   </div>
                </div>
             </div>

             <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-[#CAD2C5]/60">Applicants</span>
                   <span className="font-bold flex items-center gap-1.5">
                     <Users className="w-4 h-4" /> {job.applicationCount}
                   </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-[#CAD2C5]/60">Posted</span>
                   <span className="font-bold flex items-center gap-1.5">
                     <Calendar className="w-4 h-4" /> {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                   </span>
                </div>
                {job.salary && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#CAD2C5]/60">Budget</span>
                    <span className="font-bold text-teal">{job.salary}</span>
                  </div>
                )}
             </div>

             <div className="space-y-3">
                {canApply ? (
                  <Button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full h-14 bg-teal hover:bg-[#84A98C] text-[#2F3E46] font-extrabold text-lg rounded-2xl shadow-lg shadow-teal/20"
                  >
                    Apply Now
                  </Button>
                ) : job.hasApplied ? (
                  <Button disabled className="w-full h-14 bg-teal/20 text-teal font-extrabold text-lg rounded-2xl cursor-not-allowed">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Applied
                  </Button>
                ) : null}

                {!user && (
                   <Link href={`/login?from=/jobs/${id}`} className="block">
                     <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10">
                        Sign in to Apply
                     </Button>
                   </Link>
                )}

                {isOwner && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <Button 
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline" 
                      className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Posting
                    </Button>
                    
                    {job.status === 'OPEN' && (
                      <Button 
                        onClick={() => closeJobMutation.mutate()}
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Close Job
                      </Button>
                    )}

                    <Button 
                      onClick={() => {
                        if (confirm('Permanently delete this job?')) deleteJobMutation.mutate();
                      }}
                      variant="outline" 
                      className="w-full h-12 rounded-xl border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </Button>

                    {user?.role === 'EMPLOYER' && (
                      <Link href={`/jobs/${id}/applications`} className="block">
                         <Button className="w-full h-12 bg-white text-[#2F3E46] hover:bg-[#CAD2C5] font-bold rounded-xl">
                            Review Applicants ({job.applicationCount})
                         </Button>
                      </Link>
                    )}
                  </div>
                )}

                <Button variant="ghost" className="w-full text-[#CAD2C5]/60 hover:text-white hover:bg-white/5">
                   <Share2 className="w-4 h-4 mr-2" />
                   Share Role
                </Button>
             </div>
          </div>
        </aside>
      </div>

      <JobFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        job={job}
      />

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-md rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2F3E46]">Apply for this Position</DialogTitle>
            <DialogDescription>
              Introduce yourself to <strong>{job.companyName}</strong>. Your profile will be attached automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#84A98C]">Cover Note (Optional)</Label>
                <Textarea 
                  placeholder="Why are you a good fit?"
                  className="min-h-[120px] rounded-2xl bg-[#f4f6f5] border-0 focus-visible:ring-1 focus-visible:ring-teal"
                  value={applyContent}
                  onChange={(e) => setApplyContent(e.target.value)}
                />
             </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={() => applyMutation.mutate({ coverLetter: applyContent })}
              disabled={applyMutation.isPending}
              className="bg-teal hover:bg-[#84A98C] text-[#2F3E46] font-bold rounded-xl px-8"
            >
              {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
