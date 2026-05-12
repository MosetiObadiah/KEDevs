'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Building2,
  MoreVertical,
  Lock,
  Eye,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

export default function MyJobPosts() {
  const { user, isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await jobService.getMyPosts();
      if (response.success) {
        setPosts(response.data?.content || []);
      } else {
        setError('Failed to fetch job posts.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading job posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleClosePost = async (id: string) => {
    try {
      const res = await jobService.updateJobStatus(id, 'CLOSED');
      if (res.success) {
        toast.success('Job listing closed');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error('Failed to close listing');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await jobService.deleteJob(id);
      if (res.success) {
        toast.success('Job listing deleted');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error('Failed to delete listing');
    }
  };

  const formatJobType = (type: string) => {
    if (!type) return '';
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-end mb-8">
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 border-border/50">
              <Skeleton className="h-32 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        {/* Actions Header - No Title as per request */}
        <div className="flex justify-end mb-8">
          <Button className="h-12 px-6 font-bold shadow-lg shadow-primary/20" asChild>
            <Link href="/jobs/post">
              <Plus className="mr-2 h-5 w-5" /> Post New Job
            </Link>
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden bg-background">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Job Content - Matching /jobs style */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/jobs/${post.id}`}>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                            {post.title}
                          </h3>
                        </Link>
                        {(() => {
                          if (post.status === 'REMOVED') return <Badge variant="destructive" className="text-[10px] uppercase">Removed</Badge>;
                          const isExpired = post.applicationDeadline && new Date(post.applicationDeadline) < new Date();
                          if (isExpired) return <Badge variant="destructive" className="text-[10px] uppercase">Expired</Badge>;
                          if (post.status === 'OPEN') return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-[10px] uppercase">Active</Badge>;
                          return <Badge variant="secondary" className="text-[10px] uppercase">Closed</Badge>;
                        })()}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium mb-6">
                        <span className="flex items-center gap-1.5 font-bold text-foreground/80">
                          <Building2 className="h-4 w-4" /> {post.isPeerSourced || post.postedByRole !== 'EMPLOYER' ? (post.postedByName || 'Community Member') : post.companyName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {post.locationCity}, {post.locationCountry}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 text-muted-foreground">
                          {formatJobType(post.jobType)}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                          {post.workType}
                        </Badge>
                        {!post.isPeerSourced && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 ml-2">
                             <Users className="h-3.5 w-3.5" /> {post.applicationCount || 0} Applicants
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Management Actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center md:w-48 shrink-0 gap-4">
                      {post.status === 'REMOVED' ? (
                        <div className="w-full py-3 px-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-destructive text-center">
                          <AlertCircle className="h-4 w-4 mb-1" />
                          Post Unavailable
                        </div>
                      ) : (
                        <>
                          {!post.isPeerSourced ? (
                            <Button variant="outline" className="w-full font-bold group/btn h-11" asChild>
                              <Link href={`/jobs/${post.id}/applications`}>
                                Manage Talent
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          ) : (
                            <div className="w-full py-2 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <ExternalLink className="h-3 w-3" /> External Source
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100" asChild>
                              <Link href={`/jobs/post?edit=${post.id}`}>
                                <Edit3 className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-100 shadow-xl min-w-[180px]">
                                <DropdownMenuItem className="rounded-lg font-bold gap-3" asChild>
                                  <Link href={`/jobs/${post.id}`}>
                                    <Eye className="h-4 w-4" /> Preview Live
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {post.status !== 'CLOSED' && (
                                  <DropdownMenuItem className="rounded-lg font-bold gap-3 text-amber-600" onClick={() => handleClosePost(post.id)}>
                                    <Lock className="h-4 w-4" /> Close Listing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-lg font-bold gap-3 text-destructive" onClick={() => handleDeletePost(post.id)}>
                                  <Trash2 className="h-4 w-4" /> Delete Post
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-background rounded-3xl border border-dashed border-muted">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No jobs posted yet</h3>
                <p className="text-muted-foreground text-sm">Create your first listing to start connecting with talent.</p>
              </div>
              <Button asChild>
                <Link href="/jobs/post">Post Your First Job</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
