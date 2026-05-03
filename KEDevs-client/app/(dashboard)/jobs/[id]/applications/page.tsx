'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getJob, getJobApplications, updateApplicationStatus } from '@/lib/api/jobs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  Mail, 
  ExternalLink, 
  Download, 
  User, 
  FileText,
  Loader2,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/lib/types/job';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'text-sage-foreground/60' },
  { value: 'REVIEWING', label: 'Reviewing', color: 'text-teal' },
  { value: 'SHORTLISTED', label: 'Shortlist', color: 'text-forest' },
  { value: 'OFFERED', label: 'Offer Sent', color: 'text-green-600' },
  { value: 'REJECTED', label: 'Reject', color: 'text-red-500' },
];

export default function ApplicationsInboxPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => getJob(id),
  });

  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['jobs', id, 'applications'],
    queryFn: () => getJobApplications(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) => 
      updateApplicationStatus(appId, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['jobs', id, 'applications'] });
    },
    onError: (error: any) => toast.error(error.message || 'Update failed'),
  });

  if (isLoadingJob || isLoadingApps) return (
    <div className="max-w-6xl mx-auto p-10 animate-pulse space-y-8">
      <div className="h-10 bg-[#f4f6f5] rounded-xl w-1/4" />
      <div className="h-64 bg-[#f4f6f5] rounded-[40px] w-full" />
    </div>
  );

  if (!job) return <div>Job not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/jobs/${id}`} className="inline-flex items-center text-sm font-bold text-[#52796F] hover:text-[#354F52] mb-8 group">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Job Details
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
           <h1 className="text-3xl font-extrabold text-[#2F3E46]">Applicants Inbox</h1>
           <Badge className="bg-[#52796F]/10 text-[#52796F] border-0 rounded-full font-bold">
             {applications?.length || 0} Total
           </Badge>
        </div>
        <p className="text-[#84A98C] font-medium">Reviewing candidates for <span className="text-[#2F3E46] font-bold">{job.title}</span></p>
      </div>

      <div className="bg-white rounded-[40px] border border-[#CAD2C5]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f4f6f5]/50 border-b border-[#CAD2C5]/30">
                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-[#84A98C]">Candidate</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-[#84A98C]">Applied Date</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-[#84A98C]">Status</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-[#84A98C]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CAD2C5]/30">
              {applications?.map((app) => (
                <tr key={app.id} className="hover:bg-[#f4f6f5]/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={app.developerProfileImageUrl} />
                        <AvatarFallback className="bg-[#52796F] text-white font-bold">
                          {app.developerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-[#2F3E46] text-base group-hover:text-[#52796F] transition-colors">
                          {app.developerName}
                        </p>
                        <p className="text-xs text-[#84A98C] flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.developerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-[#354F52] font-medium">
                    {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-6">
                    <Select
                      value={app.status}
                      onValueChange={(val) => statusMutation.mutate({ appId: app.id, status: val as ApplicationStatus })}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className={cn(
                        "w-40 h-10 rounded-xl font-bold text-xs border-0 bg-[#f4f6f5] focus:ring-1 focus:ring-[#52796F]",
                        STATUS_OPTIONS.find(o => o.value === app.status)?.color
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className={cn("font-bold text-xs", opt.color)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       <Link href={`/developers/${app.developerId}`}>
                         <Button variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-xs hover:bg-[#52796F]/5 text-[#52796F]">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                         </Button>
                       </Link>
                       {app.coverLetter && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl hover:bg-[#f4f6f5] text-[#84A98C]"
                            onClick={() => alert(`Cover Letter:\n\n${app.coverLetter}`)}
                          >
                             <FileText className="w-4 h-4" />
                          </Button>
                       )}
                       {app.resumeUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl hover:bg-[#f4f6f5] text-[#84A98C]"
                            onClick={() => window.open(app.resumeUrl, '_blank')}
                          >
                             <Download className="w-4 h-4" />
                          </Button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}

              {applications?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#f4f6f5] rounded-3xl flex items-center justify-center mb-4 text-[#CAD2C5]">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-[#2F3E46]">No applications yet</h3>
                      <p className="text-[#84A98C] text-sm max-w-xs mx-auto">
                        Once developers start applying for this role, they will appear here for your review.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
