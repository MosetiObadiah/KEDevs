'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Briefcase, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  Flag, 
  Edit2, 
  Trash2, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  EyeOff, 
  AlertTriangle,
  Building2,
  ChevronLeft,
  ShieldCheck,
  ExternalLink,
  Zap,
  Globe,
  Loader2,
  Share2,
  CheckCircle2
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

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
        setError('Failed to fetch job details.');
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

  const handleFlagJob = async () => {
    if (!id) return;
    try {
      await jobService.flagJob(id as string, 'Suspicious job listing');
      toast.success('Job flagged for review.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to flag job.');
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
      await jobService.voteJob(id as string, type);
    } catch (err: any) {
      setIsUpvoted(originalUpvoted);
      setIsDownvoted(originalDownvoted);
      setUpvoteCount(originalCount);
      toast.error('Failed to register vote');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <Skeleton className="h-12 w-3/4 mb-4 rounded-2xl" />
        <Skeleton className="h-6 w-1/4 mb-12 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[200px] w-full rounded-[2.5rem]" />
           </div>
           <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
           </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
           <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black mb-4">{error || 'Job not found'}</h2>
        <Button variant="outline" className="rounded-2xl h-12 font-black px-8" asChild>
           <Link href="/jobs">Back to Jobs Board</Link>
        </Button>
      </div>
    );
  }

  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" className="rounded-xl font-black text-slate-500 hover:text-slate-900 group" asChild>
            <Link href="/jobs">
               <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
               Back to Directory
            </Link>
          </Button>
          
          <div className="flex gap-2">
             <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10">
                <Share2 className="h-4 w-4" />
             </Button>
             {isLoggedIn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl">
                    {isPoster ? (
                      <>
                        <DropdownMenuItem className="rounded-xl font-bold gap-2">
                          <Edit2 className="h-4 w-4" /> Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl font-bold gap-2">
                          <XCircle className="h-4 w-4" /> Close Job
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl font-bold gap-2 text-red-500">
                          <Trash2 className="h-4 w-4" /> Delete Job
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={handleFlagJob} className="rounded-xl font-bold gap-2">
                        <Flag className="h-4 w-4" /> Report Job
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Job Info */}
          <div className="lg:col-span-8 space-y-10">
             <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                   <Badge className={cn(
                      "rounded-lg font-black uppercase text-[10px] tracking-widest px-3 py-1",
                      isExpired ? "bg-red-100 text-red-600 border-red-200" : "bg-emerald-100 text-emerald-600 border-emerald-200"
                   )}>
                      {isExpired ? 'EXPIRED' : (job.status === 'OPEN' ? 'ACCEPTING APPLICATIONS' : 'CLOSED')}
                   </Badge>
                   <Badge variant="outline" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-3 py-1 bg-white border-slate-200">
                      {job.jobType?.replace(/_/g, '-')}
                   </Badge>
                </div>

                <div className="space-y-2">
                   <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                      {job.title}
                   </h1>
                   <div className="flex items-center gap-4 pt-2">
                      <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                         {job.companyName?.charAt(0)}
                      </div>
                      <Link href={`/companies/${job.companyId}`} className="text-xl font-black text-primary hover:underline transition-all">
                         {job.companyName}
                      </Link>
                      <ShieldCheck className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                   </div>
                </div>

                <div className="flex flex-wrap gap-8 py-6 px-8 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 border border-slate-100">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-primary" /> {job.locationCity}, {job.locationCountry}
                      </p>
                   </div>
                   <Separator orientation="vertical" className="h-10 bg-slate-100 hidden md:block" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work Type</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                         <Globe className="h-4 w-4 text-primary" /> {job.workType}
                      </p>
                   </div>
                   <Separator orientation="vertical" className="h-10 bg-slate-100 hidden md:block" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                         <Briefcase className="h-4 w-4 text-primary" /> {job.experienceLevel?.replace(/_/g, ' ')}
                      </p>
                   </div>
                </div>
             </div>

             {/* Job Description Card */}
             <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/30 overflow-hidden">
                <CardHeader className="bg-slate-900 p-8 text-white">
                   <CardTitle className="text-2xl font-black uppercase tracking-tight">Job Description</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                   <div className="prose prose-slate max-w-none">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">About the Role</h3>
                      <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                         {job.description}
                      </p>
                   </div>

                   <Separator className="bg-slate-100" />

                   <div className="space-y-6">
                      <h3 className="text-2xl font-black text-slate-900">Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum Experience</p>
                            <p className="text-xl font-black text-slate-900">{job.minExperienceYears} {job.minExperienceYears === 1 ? 'Year' : 'Years'}</p>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Qualification</p>
                            <p className="text-xl font-black text-slate-900 truncate">
                               {job.minQualification === 'BACHELORS' ? "Bachelor's Degree" : 
                                job.minQualification === 'DIPLOMA' ? 'Diploma' : 
                                job.minQualification === 'SELF_TAUGHT' ? 'Self-Taught' : job.minQualification}
                            </p>
                         </div>
                      </div>
                      {job.requirements && (
                         <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap mt-4 p-6 rounded-[2rem] bg-slate-50/50 italic border-l-4 border-primary">
                            {job.requirements}
                         </p>
                      )}
                   </div>

                   {job.tags && job.tags.length > 0 && (
                      <div className="pt-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Keywords</p>
                         <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag: string) => (
                               <Badge key={tag} className="h-10 px-5 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm hover:bg-primary hover:text-white transition-all cursor-default">
                                  #{tag}
                               </Badge>
                            ))}
                         </div>
                      </div>
                   )}
                </CardContent>
             </Card>

             {/* Forum Section */}
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

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
             {/* Voting Card */}
             <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardContent className="p-8 space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Community Sentiment</p>
                      <div className="flex items-center gap-1.5 text-primary font-black">
                         <Zap className="h-4 w-4 fill-current" />
                         <span>{upvoteCount} Upvotes</span>
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <Button 
                         variant={isUpvoted ? "default" : "outline"} 
                         className={cn(
                            "flex-1 h-16 rounded-[1.5rem] font-black transition-all gap-2",
                            isUpvoted ? "bg-primary shadow-lg shadow-primary/20" : "border-slate-200 hover:border-primary/50"
                         )}
                         onClick={() => handleVote('UPVOTE')}
                      >
                         <ThumbsUp className={cn("h-5 w-5", isUpvoted && "fill-current")} />
                         Upvote
                      </Button>
                      <Button 
                         variant={isDownvoted ? "destructive" : "outline"} 
                         className={cn(
                            "flex-1 h-16 rounded-[1.5rem] font-black transition-all gap-2",
                            isDownvoted ? "bg-red-500 shadow-lg shadow-red-500/20" : "border-slate-200 hover:border-red-200"
                         )}
                         onClick={() => handleVote('DOWNVOTE')}
                      >
                         <ThumbsDown className={cn("h-5 w-5", isDownvoted && "fill-current")} />
                         Downvote
                      </Button>
                   </div>
                </CardContent>
             </Card>

             {/* Application Card */}
             <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/10 overflow-hidden bg-slate-900 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <CardContent className="p-8 space-y-8 relative z-10">
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">Ready to Apply?</h3>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">
                         Submit your profile and documents directly to the employer.
                      </p>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                            <CalendarIcon className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Deadline</p>
                            <p className="text-sm font-black text-white">
                               {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Flexible'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                            <Send className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Contact</p>
                            <p className="text-sm font-black text-white truncate max-w-[200px]">{job.contactEmail}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {job.isPeerSourced ? (
                        <Button className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" asChild>
                           <Link href={job.sourceUrl || '#'} target="_blank">
                              Apply on External Site <ExternalLink className="ml-2 h-5 w-5" />
                           </Link>
                        </Button>
                      ) : isLoggedIn ? (
                         isPoster ? (
                            <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-white/20 bg-white/5 text-white font-black opacity-50 cursor-not-allowed">
                               You Posted This Job
                            </Button>
                         ) : user?.role === 'DEVELOPER' && (
                            job.hasApplied ? (
                               <Button className="w-full h-16 rounded-[1.5rem] bg-emerald-500 text-white font-black text-lg cursor-default shadow-xl shadow-emerald-500/20">
                                  <CheckCircle2 className="mr-2 h-5 w-5" /> Already Applied
                               </Button>
                            ) : (
                               <Button 
                                  className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                                  onClick={() => setApplyOpen(true)}
                               >
                                  Apply Now <Zap className="ml-2 h-5 w-5 fill-white" />
                               </Button>
                            )
                         )
                      ) : (
                         <div className="space-y-4">
                            <Button className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20" asChild>
                               <Link href="/register">Sign up to Apply</Link>
                            </Button>
                            <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                               Requires registration to submit
                            </p>
                         </div>
                      )}
                   </div>
                </CardContent>
             </Card>

             {/* Company Quick Links */}
             <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-6">
                   <CardTitle className="text-xl font-black">Employer Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                   <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-2xl">
                         <AvatarFallback className="bg-primary text-white font-black">{job.companyName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                         <p className="font-black text-slate-900 truncate">{job.companyName}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Employer</p>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 font-bold" asChild>
                      <Link href={`/companies/${job.companyId}`}>View Company Profile</Link>
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>

      <ApplyDialog 
        open={applyOpen} 
        onClose={() => setApplyOpen(false)} 
        job={job} 
        onSuccess={() => {
           setJob({ ...job, hasApplied: true });
           toast.success('Application sent! Redirecting to your dashboard...', {
              icon: '🚀'
           });
           setTimeout(() => router.push('/jobs/my-applications'), 2000);
        }} 
      />
    </div>
  );
}
