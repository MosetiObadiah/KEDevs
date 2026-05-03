'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPosts, deleteJob, updateJobStatus } from '@/lib/api/jobs';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Settings, 
  Trash2, 
  XCircle, 
  Users, 
  Eye, 
  Plus,
  Loader2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';
import { JobFormModal } from '@/components/jobs/JobFormModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MyPostsPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['jobs', 'my-posts'],
    queryFn: getMyPosts,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my-posts'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => updateJobStatus(id, 'CLOSED'),
    onSuccess: () => {
      toast.success('Job closed');
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my-posts'] });
    },
  });

  if (isLoading) return (
    <div className="max-w-6xl mx-auto p-10 space-y-4">
      <div className="h-10 bg-[#f4f6f5] rounded-xl w-1/4 animate-pulse" />
      <div className="h-64 bg-[#f4f6f5] rounded-3xl w-full animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2F3E46]">My Job Posts</h1>
          <p className="text-[#84A98C] font-medium">Manage your active and past opportunities</p>
        </div>
        <Button 
          onClick={() => { setSelectedJob(null); setIsEditModalOpen(true); }}
          className="bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl h-12 px-6 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Post
        </Button>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="py-24 text-center bg-[#f4f6f5] rounded-[40px] border-2 border-dashed border-[#CAD2C5]">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-[#84A98C]">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#2F3E46] mb-2">You haven&apos;t posted any jobs yet</h3>
          <p className="text-[#84A98C] max-w-sm mx-auto mb-8">
            Start hiring the best Kenyan tech talent by creating your first job posting today.
          </p>
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-[#52796F] text-white rounded-xl"
          >
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[32px] p-6 border border-[#CAD2C5]/50 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1 w-full min-w-0 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                     <h3 className="text-xl font-bold text-[#2F3E46] truncate">{post.title}</h3>
                     <Badge className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase",
                        post.status === 'OPEN' ? "bg-teal/10 text-teal" : "bg-red-500/10 text-red-500"
                     )}>
                        {post.status}
                     </Badge>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[#84A98C] font-medium">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                     <span className="flex items-center gap-1.5 text-[#52796F] font-bold">
                        <Users className="w-3.5 h-3.5" /> 
                        {post.applicationCount} Applications
                     </span>
                  </div>
               </div>

               <div className="flex flex-wrap justify-center gap-2">
                  <Link href={`/jobs/${post.id}/applications`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-[#CAD2C5] text-[#2F3E46] h-10 px-4 font-bold hover:bg-[#52796F]/5">
                       <Users className="w-4 h-4 mr-2" /> Applicants
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => { setSelectedJob(post); setIsEditModalOpen(true); }}
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-[#CAD2C5] text-[#2F3E46] h-10 px-4 font-bold hover:bg-[#52796F]/5"
                  >
                     <Settings className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Link href={`/jobs/${post.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 hover:bg-[#f4f6f5]">
                       <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  {post.status === 'OPEN' ? (
                    <Button 
                      onClick={() => { if(confirm('Close this job?')) closeMutation.mutate(post.id); }}
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl h-10 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold px-4"
                    >
                       <XCircle className="w-4 h-4 mr-2" /> Close
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => { if(confirm('Permanently delete this post?')) deleteMutation.mutate(post.id); }}
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl h-10 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold px-4"
                    >
                       <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}

      <JobFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        job={selectedJob}
      />
    </div>
  );
}
