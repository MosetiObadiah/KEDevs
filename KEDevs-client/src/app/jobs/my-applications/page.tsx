'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowRight,
  Search,
  FilterX
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { cn, formatDateString } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  'PENDING': { label: 'Applied', color: 'bg-azure-50 text-azure-500', icon: Clock },
  'VIEWED': { label: 'Viewed', color: 'bg-azure-100 text-azure-600', icon: Loader2 },
  'SHORTLISTED': { label: 'Shortlisted', color: 'bg-cyan-50 text-cyan-600', icon: CheckCircle2 },
  'REJECTED': { label: 'Rejected', color: 'bg-danger-100 text-danger-700 border-danger-200', icon: XCircle },
};

function MyApplicationsContent() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchApplications = async (showLoading = true) => {
      if (showLoading) setLoading(true);
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
        if (showLoading) setLoading(false);
      }
    };

    // Initial fetch with full spinner
    fetchApplications(true);

    // Dynamic background polling every 4 seconds
    const interval = setInterval(() => {
      fetchApplications(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const filteredApps = applications.filter(app =>
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING' || a.status === 'VIEWED').length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Retrieving your history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row justify-end items-center mb-6 space-y-4 md:space-y-0 print:hidden">
          <Button variant="outline" className="font-medium border-primary/20 hover:bg-primary/5" asChild>
            <Link href="/jobs">
              <Briefcase className="mr-2 h-4 w-4 text-primary" /> Browse More Jobs
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8 print:hidden">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Application Tracker</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total</p>
                    <p className="text-xl font-medium">{stats.total}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-azure-50 border border-azure-100 text-center text-azure-500">
                    <p className="text-[10px] font-black uppercase mb-1">Pending</p>
                    <p className="text-xl font-medium">{stats.pending}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-50 border border-emerald-100 text-center text-cyan-600">
                    <p className="text-[10px] font-black uppercase mb-1">Shortlisted</p>
                    <p className="text-xl font-medium">{stats.shortlisted}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-danger-50 border border-danger-100 text-center text-danger-500">
                    <p className="text-[10px] font-black uppercase mb-1">Closed</p>
                    <p className="text-xl font-medium">{stats.rejected}</p>
                  </div>
                </div>

                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-medium text-muted-foreground"
                    onClick={() => router.push('/jobs/my-applications')}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Updated to List Layout */}
          <main className="lg:col-span-3 print:col-span-full">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-border/50 bg-muted/10 p-6">
                <CardTitle className="text-xl font-medium">Applications Log</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Comprehensive list of your active and past applications.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredApps.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {filteredApps.map((app) => {
                      const config = statusConfig[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-700', icon: Clock };
                      const StatusIcon = config.icon;

                      return (
                        <Link key={app.id} href={`/jobs/${app.jobId}`} className="block group">
                          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-6">
                              <div className="h-12 w-12 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground font-black group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
                                {app.companyName?.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-tight">{app.jobTitle}</h3>
                                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                  <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {app.companyName}</span>
                                  <span className="h-1 w-1 rounded-full bg-border" />
                                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDateString(app.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6">
                              <Badge className={cn("rounded-xl font-black text-[9px] uppercase tracking-widest px-3 py-1.5 border-none flex items-center gap-2", config.color)}>
                                <StatusIcon className={cn("h-3 w-3", app.status === 'REVIEWED' && "animate-spin")} />
                                {config.label}
                              </Badge>
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-24 flex flex-col items-center">
                    <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30 mb-6">
                      <Inbox className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">No Applications Found</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-8 max-w-sm mx-auto">
                      {searchTerm ? "No applications match your current search criteria." : "You haven't applied to any jobs yet. Start your journey today!"}
                    </p>
                    {!searchTerm && (
                      <Button size="lg" className="rounded-xl font-medium h-12 px-8 shadow-xl shadow-primary/10" asChild>
                        <Link href="/jobs">
                          Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}


              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function MyApplications() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <MyApplicationsContent />
    </Suspense>
  );
}
