'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Edit3, 
  X, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Briefcase,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Lock,
  Eye
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const statusConfig: Record<string, { label: string, color: string }> = {
  'OPEN': { label: 'Active', color: 'bg-emerald-100 text-emerald-600' },
  'UNDER_REVIEW': { label: 'In Review', color: 'bg-amber-100 text-amber-600' },
  'CLOSED': { label: 'Closed', color: 'bg-slate-100 text-slate-500' },
  'EXPIRED': { label: 'Expired', color: 'bg-red-100 text-red-600' },
};

export default function MyJobPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing your listings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-12 max-w-5xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-8 mb-6">
         <Button className="rounded-2xl h-14 px-8 font-black bg-slate-900 shadow-xl shadow-slate-900/10 gap-2" asChild>
            <Link href="/jobs/post">
               <Plus className="h-5 w-5" /> Post New Job
            </Link>
         </Button>
      </div>

      {error && (
         <div className="p-6 rounded-[2rem] bg-red-50 border border-red-100 flex gap-4 mb-8">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 leading-relaxed">{error}</p>
         </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const config = statusConfig[post.status] || { label: post.status, color: 'bg-slate-100 text-slate-600' };
            
            return (
              <Card key={post.id} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                       <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <Briefcase className="h-8 w-8" />
                       </div>
                       <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                             <Link href={`/jobs/${post.id}`} className="text-2xl font-black text-slate-900 hover:text-emerald-600 transition-colors truncate">
                                {post.title}
                             </Link>
                             <Badge className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-none", config.color)}>
                                {config.label}
                             </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                             <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {post.locationCity}, {post.locationCountry}</span>
                             <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1.5 text-slate-900"><Users className="h-3.5 w-3.5" /> 12 Applicants</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <Button variant="outline" className="rounded-2xl font-black h-12 px-6 gap-2 border-slate-100" asChild>
                          <Link href={`/jobs/${post.id}/applications`}>
                             <Users className="h-4 w-4 text-emerald-500" /> Manage Talent
                          </Link>
                       </Button>
                       
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50">
                                <MoreVertical className="h-5 w-5" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[2rem] p-2 border-slate-100 shadow-2xl min-w-[200px]">
                             <DropdownMenuItem className="rounded-xl font-bold gap-3 py-3" asChild>
                                <Link href={`/jobs/post?edit=${post.id}`}>
                                   <Edit3 className="h-4 w-4" /> Edit Details
                                </Link>
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-xl font-bold gap-3 py-3" asChild>
                                <Link href={`/jobs/${post.id}`}>
                                   <Eye className="h-4 w-4" /> Preview Live
                                </Link>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-slate-50" />
                             {post.status !== 'CLOSED' && (
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 py-3 text-amber-600" onClick={() => handleClosePost(post.id)}>
                                   <Lock className="h-4 w-4" /> Close Listing
                                </DropdownMenuItem>
                             )}
                             <DropdownMenuItem className="rounded-xl font-bold gap-3 py-3 text-red-500" onClick={() => handleDeletePost(post.id)}>
                                <Trash2 className="h-4 w-4" /> Permanently Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 p-12 text-center bg-white">
           <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Plus className="h-12 w-12" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Build Your Team</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
              You haven't posted any jobs yet. Create your first listing to connect with top tech talent in Kenya.
           </p>
           <Button size="lg" className="rounded-2xl font-black h-14 px-10 bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20" asChild>
              <Link href="/jobs/post">Post Your First Job</Link>
           </Button>
        </Card>
      )}
    </div>
  );
}
