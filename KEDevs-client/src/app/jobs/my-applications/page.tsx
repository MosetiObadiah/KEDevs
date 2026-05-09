'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  'PENDING': { label: 'In Review', color: 'bg-amber-100 text-amber-600', icon: Clock },
  'REVIEWED': { label: 'Processing', color: 'bg-blue-100 text-blue-600', icon: Loader2 },
  'ACCEPTED': { label: 'Offered', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
  'REJECTED': { label: 'Closed', color: 'bg-red-100 text-red-600', icon: XCircle },
};

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await jobService.getMyApplications();
        if (response.success) {
          setApplications(response.data?.content || []);
        } else {
          setError('Failed to fetch applications.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving your history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl animate-in fade-in duration-700">
      <div className="mb-12">
         <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 mb-4 px-3 py-1">
            CAREER JOURNEY
         </Badge>
         <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">My Applications</h1>
         <p className="text-slate-500 font-semibold mt-2">Track your progress with top Kenyan tech employers</p>
      </div>

      {error && (
         <div className="p-6 rounded-[2rem] bg-red-50 border border-red-100 flex gap-4 mb-8">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 leading-relaxed">{error}</p>
         </div>
      )}

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const config = statusConfig[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600', icon: Clock };
            const StatusIcon = config.icon;
            
            return (
              <Link key={app.id} href={`/jobs/${app.jobId}`} className="block group">
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden group-hover:shadow-2xl group-hover:translate-x-2 transition-all duration-500 bg-white">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                         <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            {app.companyName?.charAt(0)}
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{app.jobTitle}</h3>
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                               <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {app.companyName}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-6">
                         <Badge className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-2 border-none flex items-center gap-2", config.color)}>
                            <StatusIcon className={cn("h-3 w-3", app.status === 'REVIEWED' && "animate-spin")} />
                            {config.label}
                         </Badge>
                         <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ChevronRight className="h-5 w-5" />
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center">
           <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6">
              <Inbox className="h-12 w-12" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">No Applications Yet</h3>
           <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
              Your dream job is waiting for you in our talent feed. Start applying to build your legacy.
           </p>
           <Button size="lg" className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20" asChild>
              <Link href="/jobs">
                 Browse Opportunities <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
           </Button>
        </div>
      )}
    </div>
  );
}
