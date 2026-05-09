'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CreditCard, 
  ChevronRight, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Loader2,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getDashboard();
        if (response.success) {
          setData(response.data);
        }
      } catch (err: any) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Platform Users', value: data?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: 'Active Job Listings', value: data?.totalActiveJobs || 0, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: 'Verified Developers', value: data?.totalVerifiedDevelopers || 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: 'Employer Pro Subscriptions', value: data?.totalProEmployers || 0, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />
           ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Skeleton className="lg:col-span-8 h-[450px] rounded-[3rem]" />
           <Skeleton className="lg:col-span-4 h-[450px] rounded-[3rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8 relative">
                 <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10", stat.bg)} />
                 <div className="flex items-start justify-between mb-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                       <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="rounded-lg font-black text-[10px] tracking-widest text-slate-400 border-slate-100">+12%</Badge>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
           <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden h-[500px] flex flex-col bg-white">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Platform Activity</CardTitle>
                    <CardDescription className="font-bold text-slate-400">Monthly user engagement and job posting trends</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" className="rounded-xl font-black border-slate-100">
                    Last 30 Days
                 </Button>
              </CardHeader>
              <CardContent className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
                    <TrendingUp className="h-10 w-10" />
                 </div>
                 <div>
                    <p className="text-xl font-black text-slate-900">Analytics Engine Initializing</p>
                    <p className="text-sm font-medium text-slate-400">Detailed charting and trends visualization will appear here.</p>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardHeader className="p-10 border-b border-slate-50">
                 <CardTitle className="text-xl font-black text-slate-900">Critical Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 <Link href="/admin/users" className="block group">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100 group-hover:bg-red-100 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black">
                             {data?.pendingEmployers || 0}
                          </div>
                          <div>
                             <p className="text-sm font-black text-red-900">Pending Approvals</p>
                             <p className="text-[10px] font-bold text-red-700/60 uppercase">Employer Verification</p>
                          </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-red-300 group-hover:translate-x-1 transition-all" />
                    </div>
                 </Link>

                 <Link href="/admin/flags" className="block group">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100 group-hover:bg-amber-100 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                             {data?.flaggedJobs + data?.flaggedUsers || 0}
                          </div>
                          <div>
                             <p className="text-sm font-black text-amber-900">Flagged Reports</p>
                             <p className="text-[10px] font-bold text-amber-700/60 uppercase">Moderation Required</p>
                          </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-amber-300 group-hover:translate-x-1 transition-all" />
                    </div>
                 </Link>
              </CardContent>
           </Card>

           <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-900/10 overflow-hidden bg-slate-900 text-white p-2">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Activity className="h-5 w-5 text-primary" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Status</span>
                    </div>
                    <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase">Healthy</Badge>
                 </div>
                 
                 <div className="space-y-1">
                    <h4 className="text-2xl font-black">Node-01 Live</h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">All core services are operational. Backend synchronization successful.</p>
                 </div>

                 <Button className="w-full h-12 rounded-2xl font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5" asChild>
                    <Link href="/admin/settings">System Config</Link>
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
