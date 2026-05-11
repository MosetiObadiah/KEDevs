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

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const [dashRes, signupsRes, revenueRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getDashboardSignups(),
          adminService.getDashboardRevenueTrends()
        ]);

        if (dashRes.success) setData(dashRes.data);
        if (signupsRes.success) setSignups(signupsRes.data);
        if (revenueRes.success) setRevenueTrends(revenueRes.data);
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
    { label: 'Active Job Listings', value: data?.topUpvotedJobs?.length || 0, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: 'Pending Review', value: data?.pendingEmployerApprovals || 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: 'Total Subscriptions', value: data?.subscriptions?.totalActive || 0, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
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
            <Card key={stat.label} className="border-border/50 hover:shadow-md hover:shadow-primary/5 transition-all">
              <CardContent className="p-8 relative">
                 <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10", stat.bg)} />
                 <div className="flex items-start justify-between mb-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                       <Icon className="h-6 w-6" />
                    </div>
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
           <Card className="border-border/50 shadow-sm overflow-hidden h-[500px] flex flex-col bg-card">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">User Growth Ecosystem</CardTitle>
                    <CardDescription className="font-bold text-slate-400">Developer vs Employer signup frequency</CardDescription>
                 </div>
                 <Badge className="rounded-xl bg-slate-100 text-slate-600 border-none">Last 30 Days</Badge>
              </CardHeader>
              <CardContent className="p-6 flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={signups} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorDevs" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEmps" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                          dy={10}
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                       />
                       <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 900, color: '#64748b', fontSize: '12px' }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="developerSignups" 
                          name="Developers"
                          stroke="#2563eb" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorDevs)" 
                       />
                       <Area 
                          type="monotone" 
                          dataKey="employerSignups" 
                          name="Employers"
                          stroke="#10b981" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorEmps)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="border-border/50 shadow-sm overflow-hidden h-[350px] bg-card">
                <CardHeader className="p-8 pb-2">
                   <CardTitle className="text-lg font-black tracking-tight">Revenue Flow</CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[260px] min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrends}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="date" hide />
                         <Tooltip cursor={{fill: '#f8fafc'}} />
                         <Bar dataKey="revenue" fill="#a855f7" radius={[10, 10, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </CardContent>
             </Card>
             <Card className="border-border/50 shadow-sm overflow-hidden bg-primary text-primary-foreground p-8 flex flex-col justify-between">
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Gross Liquidity</p>
                   <h3 className="text-4xl font-black">KES {data?.revenue?.totalRevenue?.toLocaleString() || 0}</h3>
                </div>
                <div className="space-y-4">

                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-sm font-bold text-slate-400">Transactions</span>
                      <span className="text-sm font-black">{data?.revenue?.completedPayments || 0}</span>
                   </div>
                </div>
             </Card>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-10 border-b border-slate-50">
                 <CardTitle className="text-xl font-black text-slate-900">Critical Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 <Link href="/admin/verification" className="block group">
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

           {/* System Status Card Removed per user request */}
        </div>
      </div>
    </div>
  );
}
