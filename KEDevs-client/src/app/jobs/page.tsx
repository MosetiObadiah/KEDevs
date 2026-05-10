'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Briefcase,
  FilterX,
  Plus,
  Building2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { JobSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const { user, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [workType, setWorkType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [upvotedJobs, setUpvotedJobs] = useState<Set<string>>(new Set());
  const [downvotedJobs, setDownvotedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobs({
          page: 0,
          size: 20,
          title: searchTerm,
          workType: workType === 'All' ? undefined : workType
        });
        if (response.success) {
          setJobs(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, workType]);

  const handleVote = async (id: string, vote: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;

    const wasUpvoted = upvotedJobs.has(id);
    const wasDownvoted = downvotedJobs.has(id);
    const prevUpvoted = new Set(upvotedJobs);
    const prevDownvoted = new Set(downvotedJobs);

    if (vote === 'UP') {
      if (wasUpvoted) {
        prevUpvoted.delete(id);
      } else {
        prevUpvoted.add(id);
        prevDownvoted.delete(id);
      }
    } else {
      if (wasDownvoted) {
        prevDownvoted.delete(id);
      } else {
        prevDownvoted.add(id);
        prevUpvoted.delete(id);
      }
    }

    setUpvotedJobs(prevUpvoted);
    setDownvotedJobs(prevDownvoted);

    try {
      await jobService.voteJob(id, vote === 'UP' ? 'UPVOTE' : 'DOWNVOTE');
    } catch (err: any) {
      setUpvotedJobs(upvotedJobs);
      setDownvotedJobs(downvotedJobs);
      console.error(err);
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row justify-end items-center gap-6 mb-6">
          {isLoggedIn && (
            <Button className="h-12 px-6 font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/jobs/post">
                <Plus className="mr-2 h-5 w-5" /> Post a Job
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Jobs</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Title, company..." 
                      className="pl-10 text-sm border-border/50 focus-visible:ring-primary/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Work Type</label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="ONSITE">On-site</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20">
                      <SelectValue placeholder="Newest First" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="upvotes">Most Upvoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || workType !== 'All') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-muted-foreground"
                    onClick={() => {
                      setSearchTerm('');
                      setWorkType('All');
                    }}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Job List area */}
          <main className="lg:col-span-3 space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <Card key={i} className="p-6 border-border/50">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <Skeleton className="h-7 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/3 mb-6" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-32 rounded-xl" />
                    </div>
                  </Card>
                ))
              ) : jobs.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-background rounded-3xl border border-dashed border-muted">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">No jobs found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
                  </div>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Job Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Link href={`/jobs/${job.id}`}>
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                                {job.title}
                              </h3>
                            </Link>
                            {(() => {
                              const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                              if (isExpired) return <Badge variant="destructive" className="text-[10px] uppercase">Expired</Badge>;
                              if (job.status === 'OPEN') return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-[10px] uppercase">Open</Badge>;
                              return <Badge variant="secondary" className="text-[10px] uppercase">Closed</Badge>;
                            })()}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium mb-6">
                            <span className="flex items-center gap-1.5 font-bold text-foreground/80">
                              <Building2 className="h-4 w-4" /> {job.isPeerSourced && job.postedByName ? job.postedByName : job.companyName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" /> {job.locationCity}, {job.locationCountry}
                            </span>
                            {job.applicationDeadline && (
                              <span className="flex items-center gap-1.5 text-rose-500">
                                <Calendar className="h-4 w-4" /> Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 text-muted-foreground">
                              {formatJobType(job.jobType)}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                              {job.workType}
                            </Badge>
                            {job.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] font-medium bg-muted/30 border-muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Voting & CTA */}
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between md:w-40 shrink-0 gap-4">
                          <div className="flex items-center gap-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className={cn(
                                      "h-9 w-9 rounded-full border border-border/50",
                                      upvotedJobs.has(job.id) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary"
                                    )}
                                    onClick={(e) => handleVote(job.id, 'UP', e)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isLoggedIn ? "Upvote" : "Login to upvote"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className={cn(
                                      "h-9 w-9 rounded-full border border-border/50",
                                      downvotedJobs.has(job.id) ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "hover:bg-destructive/10 hover:text-destructive"
                                    )}
                                    onClick={(e) => handleVote(job.id, 'DOWN', e)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isLoggedIn ? "Downvote" : "Login to downvote"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-destructive hover:bg-destructive/10" disabled={!isLoggedIn}>
                                    <Flag className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Report Job</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <div className="text-right flex-1 md:flex-none">
                            <div className="hidden md:block mb-3">
                              <span className="text-sm font-black text-primary uppercase tracking-widest">{job.upvoteCount} Upvotes</span>
                            </div>
                            <Button 
                              variant={user?.role === 'DEVELOPER' ? 'default' : 'outline'} 
                              className="w-full font-bold group/btn" 
                              asChild
                            >
                              <Link href={isLoggedIn ? `/jobs/${job.id}` : '/register'}>
                                {isLoggedIn ? (user?.role === 'DEVELOPER' ? 'Apply Now' : 'Details') : 'Register'} 
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

