'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { 
  MapPin, 
  Briefcase, 
  Calendar as CalendarIcon, 
  ThumbsUp, 
  ThumbsDown, 
  Mail, 
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { forumService } from '@/services/forumService';
import ApplyDialog from '@/components/jobs/ApplyDialog';
import Forum from '@/components/forum/Forum';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await jobService.getJobDetails(id as string);
        if (response.success) {
          setJob(response.data);
          setUpvoteCount(response.data.upvoteCount || 0);
          setIsUpvoted(response.data.currentUserVote === 'UPVOTE');
          setIsDownvoted(response.data.currentUserVote === 'DOWNVOTE');
        }
      } catch (err: any) {
        const msg = err.message || 'Job not found';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const response = await forumService.getJobComments(id as string);
        if (response.success) {
          const raw = response.data;
          setComments(Array.isArray(raw) ? raw : raw?.content || []);
        }
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchJob();
    fetchComments();
  }, [id]);

  const isPoster = user?.id === job?.postedById;

  const handleEditJob = () => {
    setEditForm({
      title: job.title || '',
      summary: job.summary || '',
      description: job.description || '',
      locationCity: job.locationCity || '',
      locationCountry: job.locationCountry || '',
      jobType: job.jobType || '',
      workType: job.workType || '',
      experienceLevel: job.experienceLevel || '',
      minQualification: job.minQualification || '',
      minExperienceYears: job.minExperienceYears ?? 0,
      applicationDeadline: job.applicationDeadline || '',
      contactEmail: job.contactEmail || '',
      visibility: job.visibility || 'PUBLIC',
      tags: (job.tags || []).join(', '),
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!job?.id) return;
    setEditLoading(true);
    try {
      const payload = {
        ...editForm,
        minExperienceYears: Number(editForm.minExperienceYears),
        tags: editForm.tags ? editForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };
      const response = await jobService.updateJob(job.id, payload);
      if (response.success) {
        setJob({ ...job, ...response.data });
        setEditOpen(false);
        toast.success('Job updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    } finally {
      setEditLoading(false);
    }
  };

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isLoggedIn || !id) {
      toast.error('Please login to vote');
      return;
    }

    const originalUpvoted = isUpvoted;
    const originalDownvoted = isDownvoted;
    const originalCount = upvoteCount;

    // Optimistic UI
    if (type === 'UPVOTE') {
      if (isUpvoted) {
        setIsUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      } else {
        setIsUpvoted(true);
        setUpvoteCount(prev => prev + 1);
        setIsDownvoted(false);
      }
    } else {
      if (isDownvoted) {
        setIsDownvoted(false);
      } else {
        setIsDownvoted(true);
        if (isUpvoted) {
          setUpvoteCount(prev => prev - 1);
          setIsUpvoted(false);
        }
      }
    }

    try {
      const response = await jobService.voteJob(id as string, type);
      if (!response.success) {
        throw new Error(response.message || 'Failed to register vote');
      }
    } catch (err: any) {
      setIsUpvoted(originalUpvoted);
      setIsDownvoted(originalDownvoted);
      setUpvoteCount(originalCount);
      toast.error(err.message || 'Failed to register vote');
    }
  };

  const formatQualification = (q: string) => {
    if (!q) return 'Not Specified';
    return q.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .replace('Bachelors', "Bachelor's Degree")
            .replace('Masters', "Master's Degree")
            .replace('Equivalent Experience', 'Equivalent Work Experience');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <Skeleton className="h-10 w-32 mb-8 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">{error || 'Job not found'}</h2>
        <Button asChild>
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          {/* LEFT COLUMN (70%) */}
          <div className="lg:col-span-7 space-y-10 min-w-0">
            {/* 1. Job Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground leading-tight break-words">
                {job.title}
              </h1>
              
              {/* Show company name for employer jobs, hide for peer/personal */}
              {!job.isPeerSourced && job.postedByRole === 'EMPLOYER' && job.companyName && (
                <p className="text-xl text-muted-foreground font-medium break-words">
                  {job.companyName}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {job.locationCity}, {job.locationCountry}
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {job.jobType?.replace(/_/g, ' ')} • {job.workType}
                </span>
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {job.experienceLevel?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* 2. Job Description */}
            <div className="space-y-4 min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold">Job Description</h2>
              <div className="space-y-2 min-w-0">
                <h3 className="text-base font-medium text-foreground">About the Role</h3>
                <div className="prose prose-sm prose-slate max-w-none text-muted-foreground leading-relaxed [word-break:break-word] [overflow-wrap:anywhere] overflow-hidden">
                  <ReactMarkdown>{job.description}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* 3. Requirements */}
            <Card className="rounded-xl border shadow-none">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-lg font-semibold">Requirements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Minimum Experience</p>
                    <p className="text-base font-semibold text-foreground">
                      {job.minExperienceYears || 0} Years
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Min Qualification</p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {formatQualification(job.minQualification)}
                    </p>
                  </div>
                </div>

                {job.tags && job.tags.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. Forum Discussion */}
            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-semibold">Forum Discussion</h2>
              <Forum 
                jobId={id as string} 
                initialComments={comments} 
                onRefresh={async () => {
                  try {
                    const response = await forumService.getJobComments(id as string);
                    if (response.success) {
                      const raw = response.data;
                      setComments(Array.isArray(raw) ? raw : raw?.content || []);
                    }
                  } catch (err) {}
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN (30%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 5. Community Sentiment */}
            <Card className="rounded-xl border shadow-none">
              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Community Sentiment</p>
                <div className="flex items-center gap-3">
                  <Button 
                    variant={isUpvoted ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleVote('UPVOTE')}
                    className="flex-1"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {upvoteCount}
                  </Button>
                  <Button 
                    variant={isDownvoted ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleVote('DOWNVOTE')}
                    className={cn("flex-1", isDownvoted && "bg-destructive text-destructive-foreground")}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 6. Apply Section */}
            <Card className="rounded-xl border shadow-none bg-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-semibold">Ready to Apply?</h3>
                
                {job.isPeerSourced ? (
                  <Button size="lg" className="w-full font-bold" asChild>
                    <Link href={job.sourceUrl || '#'} target="_blank">
                      Apply on External Site
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                ) : isPoster ? (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full py-3 justify-center text-sm font-semibold rounded-lg">
                      You Posted This Job
                    </Badge>
                    <Button size="sm" variant="outline" className="w-full font-semibold" onClick={handleEditJob}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Job
                    </Button>
                  </div>
                ) : job.hasApplied ? (
                  <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" disabled>
                    Application Sent
                  </Button>
                ) : (
                  <Button size="lg" className="w-full font-bold" onClick={() => setApplyOpen(true)}>
                    Apply Now
                  </Button>
                )}

                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 shrink-0" />
                    <span>
                      Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Flexible'}
                    </span>
                  </div>
                  {job.contactEmail && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{job.contactEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 7. Shared By (Peer-Sourced Only) */}
            {(job.isPeerSourced || job.postedByRole !== 'EMPLOYER') && (
              <Card className="rounded-xl border shadow-none">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Shared By</p>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {job.postedByName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{job.postedByName || 'Community Member'}</span>
                        <Badge variant="outline" className="w-fit text-[10px] h-4 border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase tracking-tighter">
                          Community Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full font-semibold" asChild>
                    <Link href={`/developers/${job.postedById}`}>
                      View Developer Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ApplyDialog 
        open={applyOpen} 
        onClose={() => setApplyOpen(false)} 
        job={job} 
        onSuccess={() => {
          setJob({ ...job, hasApplied: true });
          toast.success('Application sent!');
          setTimeout(() => router.push('/jobs/my-applications'), 2000);
        }} 
      />

      {/* Edit Job Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[1.5rem] max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Job Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Job Title</Label>
              <Input value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Summary</Label>
              <Input value={editForm.summary || ''} onChange={e => setEditForm({...editForm, summary: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description (Markdown)</Label>
              <Textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="min-h-[140px] rounded-xl font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</Label>
                <Input value={editForm.locationCity || ''} onChange={e => setEditForm({...editForm, locationCity: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Country</Label>
                <Input value={editForm.locationCountry || ''} onChange={e => setEditForm({...editForm, locationCountry: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Job Type</Label>
                <Select value={editForm.jobType || ''} onValueChange={v => setEditForm({...editForm, jobType: v})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE'].map(t => <SelectItem key={t} value={t}>{t.replace('_',' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Type</Label>
                <Select value={editForm.workType || ''} onValueChange={v => setEditForm({...editForm, workType: v})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['REMOTE','HYBRID','ONSITE'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Experience Level</Label>
                <Select value={editForm.experienceLevel || ''} onValueChange={v => setEditForm({...editForm, experienceLevel: v})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['JUNIOR','MID_LEVEL','SENIOR','LEAD','PRINCIPAL'].map(t => <SelectItem key={t} value={t}>{t.replace('_',' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Experience (Years)</Label>
                <Input type="number" min={0} value={editForm.minExperienceYears ?? 0} onChange={e => setEditForm({...editForm, minExperienceYears: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibility</Label>
                <Select value={editForm.visibility || 'PUBLIC'} onValueChange={v => setEditForm({...editForm, visibility: v})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Application Deadline</Label>
                <Input type="date" value={editForm.applicationDeadline || ''} onChange={e => setEditForm({...editForm, applicationDeadline: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags (comma-separated)</Label>
              <Input value={editForm.tags || ''} onChange={e => setEditForm({...editForm, tags: e.target.value})} className="h-12 rounded-xl" placeholder="e.g. react, typescript, remote" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-black" onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
