'use client';

import { JobPost } from '@/lib/types/job';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VoteButtons } from './VoteButtons';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  ExternalLink,
  MoreVertical,
  Flag,
  Loader2,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { voteJob, flagJob } from '@/lib/api/jobs';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface JobCardProps {
  job: JobPost;
}

export function JobCard({ job }: JobCardProps) {
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      await voteJob(job.id, type);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record vote');
      throw error; // Let VoteButtons handle rollback
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) return;
    setIsFlagging(true);
    try {
      await flagJob(job.id, flagReason);
      toast.success('Job reported successfully');
      setIsFlagDialogOpen(false);
      setFlagReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to report job');
    } finally {
      setIsFlagging(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const timeAgo = mounted ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : '';

  return (
    <Card className="group border-[#CAD2C5]/50 hover:border-[#52796F]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#52796F]/5 bg-white overflow-hidden">
      <div className="flex">
        {/* Voting Sidebar */}
        <div className="bg-[#f4f6f5]/50 p-3 flex items-start border-r border-[#CAD2C5]/30">
          <VoteButtons
            initialUpvotes={job.upvoteCount ?? 0}
            initialDownvotes={0}
            initialUserVote={job.currentUserVote}
            onVote={handleVote}
            size="sm"
          />
        </div>

        <div className="flex-1 min-w-0">
          <CardHeader className="pt-6 pb-2">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-xl font-bold text-[#2F3E46] group-hover:text-[#52796F] transition-colors truncate">
                    {job.title}
                  </h3>
                  {job.visibility === 'EXTERNAL' && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 bg-teal/5 text-teal border-teal/20">
                      Hidden Job
                    </Badge>
                  )}
                  {job.isPeerSourced && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 bg-amber-50 text-amber-600 border-amber-200">
                      <Share2 className="w-3 h-3 mr-1" /> Shared by Peer
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#84A98C]">
                   <span className="font-semibold">{job.companyName}</span>
                   <span>•</span>
                   <span>{timeAgo}</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-[#52796F]/10 focus:outline-none transition-colors">
                  <MoreVertical className="w-4 h-4 text-[#84A98C]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsFlagDialogOpen(true)} className="text-red-500">
                    <Flag className="w-4 h-4 mr-2" /> Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] border-0 text-[10px] font-bold">
                {job.workType}
              </Badge>
              <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] border-0 text-[10px] font-bold">
                {job.experienceLevel}
              </Badge>
              <Badge variant="secondary" className="bg-[#f4f6f5] text-[#354F52] border-0 text-[10px] font-bold">
                {job.jobType}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(job.tags || []).slice(0, 3).map((tag, idx) => {
                const tagStr = typeof tag === 'string' ? tag : tag.tag;
                const tagId = typeof tag === 'string' ? `${tag}-${idx}` : tag.id;
                return (
                  <span key={tagId} className="text-xs text-[#52796F] font-medium">
                    #{tagStr}
                  </span>
                );
              })}
              {(job.tags || []).length > 3 && (
                <span className="text-xs text-[#84A98C]">+{job.tags!.length - 3} more</span>
              )}
            </div>

            <div className="flex items-center gap-6 text-xs text-[#84A98C]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.locationCity || 'Remote'}
              </span>
              {job.visibility === 'INTERNAL' && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {job.applicationCount ?? 0} applicants
                </span>
              )}
              {job.visibility === 'EXTERNAL' && (
                <span className="flex items-center gap-1.5 text-teal">
                  <ExternalLink className="w-3.5 h-3.5" />
                  External Application
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0 pb-6">
            <Link href={`/jobs/${job.id}`} className="w-full">
              <Button variant="ghost" className="w-full justify-between hover:bg-[#52796F]/5 text-[#52796F] font-bold text-xs group/btn">
                {job.visibility === 'EXTERNAL' ? 'View Details & Apply' : 'View Opportunity'}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </div>
      </div>

      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent className="max-w-md rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2F3E46]">Report Job Post</DialogTitle>
            <DialogDescription>
              Help us maintain a safe community. Why are you reporting this job?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#84A98C]">Reason for report</Label>
              <Textarea 
                placeholder="e.g. Fraudulent activity, inappropriate content, etc."
                className="min-h-[100px] rounded-2xl bg-[#f4f6f5] border-0 focus-visible:ring-1 focus-visible:ring-[#52796F]"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsFlagDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={handleFlag}
              disabled={isFlagging || !flagReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8"
            >
              {isFlagging && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Report Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function JobSkeleton() {
  return (
    <Card className="border-[#CAD2C5]/50 bg-white overflow-hidden animate-pulse">
      <div className="flex">
        <div className="bg-[#f4f6f5]/50 w-12 border-r border-[#CAD2C5]/30" />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-6 bg-[#f4f6f5] rounded w-3/4" />
          <div className="h-4 bg-[#f4f6f5] rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-6 bg-[#f4f6f5] rounded w-20" />
            <div className="h-6 bg-[#f4f6f5] rounded w-20" />
          </div>
          <div className="h-10 bg-[#f4f6f5] rounded w-full" />
        </div>
      </div>
    </Card>
  );
}
