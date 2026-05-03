'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyApplications, withdrawApplication } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  ExternalLink,
  Trash2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/lib/types/job';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; icon: any }> = {
  PENDING: { label: 'Pending', className: 'bg-fern/10 text-fern border-fern/20', icon: Clock },
  REVIEWING: { label: 'In Review', className: 'bg-teal/10 text-teal border-teal/20', icon: Send },
  SHORTLISTED: { label: 'Shortlisted', className: 'bg-forest/10 text-forest border-forest/20', icon: CheckCircle2 },
  REJECTED: { label: 'Not Selected', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  OFFERED: { label: 'Hired', className: 'bg-forest/20 text-forest border-forest/30', icon: CheckCircle2 },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-sage/10 text-sage-foreground/40 border-sage/20', icon: XCircle },
};

export default function MyApplicationsPage() {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['jobs', 'my-applications'],
    queryFn: getMyApplications,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: () => {
      toast.success('Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my-applications'] });
    },
  });

  if (isLoading) return (
    <div className="max-w-5xl mx-auto p-10 space-y-4 animate-pulse">
      <div className="h-10 bg-[#f4f6f5] rounded-xl w-1/3" />
      <div className="h-32 bg-[#f4f6f5] rounded-3xl w-full" />
      <div className="h-32 bg-[#f4f6f5] rounded-3xl w-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#2F3E46]">My Applications</h1>
        <p className="text-[#84A98C] font-medium">Track your job applications and interviews</p>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="py-24 text-center bg-[#f4f6f5] rounded-[40px] border-2 border-dashed border-[#CAD2C5]">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-[#84A98C]">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#2F3E46] mb-2">No applications yet</h3>
          <p className="text-[#84A98C] max-w-sm mx-auto mb-8">
            Start applying for jobs in the feed to see them tracked here.
          </p>
          <Link href="/dashboard">
            <Button className="bg-[#52796F] text-white rounded-xl">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;

            return (
              <div key={app.id} className="bg-white rounded-[32px] p-6 md:p-8 border border-[#CAD2C5]/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#f4f6f5] rounded-2xl flex items-center justify-center text-[#52796F] shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2F3E46] mb-1 leading-none">{app.jobTitle}</h3>
                      <p className="text-[#84A98C] font-semibold text-sm mb-3">{app.companyName}</p>
                      <div className="flex items-center gap-3">
                         <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider", config.className)}>
                            <StatusIcon className="w-3 h-3 mr-1.5" />
                            {config.label}
                         </Badge>
                         <span className="text-[10px] text-[#CAD2C5] font-bold uppercase">Applied {format(new Date(app.createdAt), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Link href={`/jobs/${app.jobId}`}>
                      <Button variant="ghost" className="rounded-xl h-10 px-4 text-[#52796F] font-bold hover:bg-[#52796F]/5">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                    </Link>
                    
                    {['PENDING', 'REVIEWING'].includes(app.status) && (
                      <Button 
                        onClick={() => { if(confirm('Withdraw this application?')) withdrawMutation.mutate(app.id); }}
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl h-10 text-red-500 hover:bg-red-50 font-bold px-4"
                      >
                         <Trash2 className="w-4 h-4 mr-2" />
                         Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
