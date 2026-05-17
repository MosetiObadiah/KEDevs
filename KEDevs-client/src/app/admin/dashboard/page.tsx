'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Activity,
  Download
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [appsTrend, setAppsTrend] = useState<any[]>([]);
  const [topSkills, setTopSkills] = useState<any[]>([]);
  const [revenueByType, setRevenueByType] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const [dashRes, signupsRes, revenueRes, appsRes, skillsRes, revTypeRes, locsRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getDashboardSignups(),
          adminService.getDashboardRevenueTrends(),
          adminService.getApplicationsOverTime(),
          adminService.getTopSkills(),
          adminService.getRevenueByType(),
          adminService.getDeveloperLocations()
        ]);

        if (dashRes.success) setData(dashRes.data);
        if (signupsRes.success) setSignups(signupsRes.data);
        if (revenueRes.success) setRevenueTrends(revenueRes.data);
        if (appsRes.success) setAppsTrend(appsRes.data);
        if (skillsRes.success) setTopSkills(skillsRes.data);
        if (revTypeRes.success) setRevenueByType(revTypeRes.data);
        if (locsRes.success) setLocations(locsRes.data);
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
    { label: 'Total Applications', value: data?.totalApplications || 0, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: 'Pending Review', value: data?.pendingEmployerApprovals || 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: 'Gross Liquidity', value: `KES ${data?.revenue?.totalRevenue?.toLocaleString() || 0}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleExport = async (chartsToExport: string[]) => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportReport({
        charts: chartsToExport,
        dateRange: 'Last 30 Days',
        generatedBy: 'System Executive'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `executive-analytics-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelectChart = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) ? prev.filter(id => id !== chartId) : [...prev, chartId]
    );
  };

  // Safe mappings for Pie charts
  const jobTypeData = Object.entries(data?.jobTypeBreakdown || {}).map(([key, val]) => ({
    name: key.replace('_', ' '),
    value: Number(val)
  }));
  const DONUT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  const availabilityData = [
    { name: 'Open to Offers', value: data?.availabilityBreakdown?.openToOffers || 0 },
    { name: 'Not Available', value: data?.availabilityBreakdown?.notAvailable || 0 }
  ];
  const AVAILABILITY_COLORS = ['#10b981', '#ef4444'];

  const verificationChartData = (data?.verificationStats || []).map((item: any) => ({
    month: item.month,
    'Under Review': item.pending,
    'Approved': item.approved,
    'Rejected': item.rejected
  }));

  const flatRevenueByType = (revenueByType || []).map((item: any) => {
    const row: any = { month: item.month };
    Object.entries(item.byType || {}).forEach(([k, v]) => {
      row[k] = v;
    });
    return row;
  });

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
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      {/* Sticky Floating Export Control Bar */}
      {selectedCharts.length > 0 && (
        <div className="sticky top-4 z-30 flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/90 backdrop-blur border border-border/80 p-5 px-8 rounded-3xl shadow-xl shadow-slate-200/50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary animate-bounce" />
            <span className="text-sm font-black text-slate-800">
              {selectedCharts.length} {selectedCharts.length === 1 ? 'chart' : 'charts'} selected for customized PDF export
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setSelectedCharts([])} className="font-bold rounded-2xl text-xs w-full sm:w-auto">
              Clear Selection
            </Button>
            <Button size="sm" onClick={() => handleExport(selectedCharts)} disabled={isExporting} className="font-bold rounded-2xl text-xs gap-2 w-full sm:w-auto">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Selected PDF
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
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

      {/* Primary Graphs & Sidebar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
           {/* Chart 1: User Growth Area Chart */}
           <div className="relative group/chart">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
                <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedCharts.includes('signups')}
                    onChange={() => toggleSelectChart('signups')}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
                </label>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleExport(['signups'])} 
                  disabled={isExporting}
                  className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
              <Card className="border-border/50 shadow-sm overflow-hidden h-[450px] flex flex-col bg-card">
                 <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                       <CardTitle className="text-xl font-black text-slate-900 tracking-tight">User Growth Ecosystem</CardTitle>
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
           </div>

           {/* Chart 2: Job Applications Over Time Line Chart */}
           <div className="relative group/chart">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
                <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedCharts.includes('applications-over-time')}
                    onChange={() => toggleSelectChart('applications-over-time')}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
                </label>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleExport(['applications-over-time'])} 
                  disabled={isExporting}
                  className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
              <Card className="border-border/50 shadow-sm overflow-hidden h-[400px] flex flex-col bg-card">
                 <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Job Applications Trend</CardTitle>
                    <CardDescription className="font-bold text-slate-400">Daily candidates applying for roles</CardDescription>
                 </CardHeader>
                 <CardContent className="p-6 flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={appsTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                          <Line type="monotone" dataKey="count" name="Applications" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                       </LineChart>
                    </ResponsiveContainer>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Sidebar Controls & KPI metrics */}
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
                             {(data?.flaggedJobs || 0) + (data?.flaggedUsers || 0)}
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

           {/* Quick Summary of Financial Health */}
           <Card className="border-border/50 shadow-sm overflow-hidden bg-primary text-primary-foreground p-8 flex flex-col justify-between h-[250px]">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Total Financial Pool</p>
                 <h3 className="text-4xl font-black">KES {data?.revenue?.totalRevenue?.toLocaleString() || 0}</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-slate-300">Total Payments Completed</span>
                    <span className="text-sm font-black">{data?.revenue?.completedPayments || 0}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Grid of Double-column Interactive Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Chart 3: Job Types Donut Chart */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('job-types')}
                onChange={() => toggleSelectChart('job-types')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['job-types'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Job Types &amp; Work Types</CardTitle>
              <CardDescription className="font-bold text-slate-400">Environment and structural classifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0 flex items-center justify-center">
              {jobTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={jobTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {jobTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-600 capitalize">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs">No job postings recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart 4: Developer Availability Donut Chart */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('availability-status')}
                onChange={() => toggleSelectChart('availability-status')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['availability-status'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Developer Availability Pool</CardTitle>
              <CardDescription className="font-bold text-slate-400">Talent pool search and hire aggregates</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0 flex items-center justify-center">
              {availabilityData[0].value > 0 || availabilityData[1].value > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={availabilityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {availabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={AVAILABILITY_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs">No developers registered.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart 5: Top 10 Developer Skills Popularity (Horizontal Bar Chart) */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('top-skills')}
                onChange={() => toggleSelectChart('top-skills')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['top-skills'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Top Skills Popularity</CardTitle>
              <CardDescription className="font-bold text-slate-400">Total frequency listed in developer profiles</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0">
              {topSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSkills} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="skill" type="category" tick={{fontSize: 9, fontWeight: 900, fill: '#475569'}} axisLine={false} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 8, 8, 0]} name="Developers" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs flex items-center justify-center h-full">No skill registry data found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart 6: Geographic Distribution (Horizontal Bar Chart) */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('geographic-distribution')}
                onChange={() => toggleSelectChart('geographic-distribution')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['geographic-distribution'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Geographic Distribution</CardTitle>
              <CardDescription className="font-bold text-slate-400">Developer concentration by metropolitan area</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0">
              {locations.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locations} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="city" type="category" tick={{fontSize: 9, fontWeight: 900, fill: '#475569'}} axisLine={false} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Developers" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs flex items-center justify-center h-full">No location parameters loaded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart 7: Stacked Revenue by Payment Type (Bar Chart) */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('revenue-by-type')}
                onChange={() => toggleSelectChart('revenue-by-type')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['revenue-by-type'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Revenue Streams Breakdown</CardTitle>
              <CardDescription className="font-bold text-slate-400">Monthly allocations by spotlight, pin, and badges</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0">
              {flatRevenueByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flatRevenueByType} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>} />
                    <Bar dataKey="SPOTLIGHT" name="Spotlight Postings" stackId="revenue" fill="#3b82f6" />
                    <Bar dataKey="PINNED" name="Pinned Listings" stackId="revenue" fill="#f59e0b" />
                    <Bar dataKey="VERIFIED" name="Verification Badges" stackId="revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs flex items-center justify-center h-full">No active revenue logs.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart 8: Verification Requests & Processing Rates (Grouped Bar Chart) */}
        <div className="relative group/chart">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
            <label className="flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur border border-border p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCharts.includes('verification-outcomes')}
                onChange={() => toggleSelectChart('verification-outcomes')}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[10px] font-bold text-slate-600 select-none">Select to Export</span>
            </label>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleExport(['verification-outcomes'])} 
              disabled={isExporting}
              className="bg-white/95 backdrop-blur border border-border rounded-xl shadow-sm h-8 w-8 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <Card className="border-border/50 shadow-sm h-[400px] flex flex-col bg-card">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Verification Outcomes</CardTitle>
              <CardDescription className="font-bold text-slate-400">Monthly breakdown of processing status results</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-0">
              {verificationChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verificationChartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>} />
                    <Bar dataKey="Under Review" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Rejected" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 font-bold text-xs flex items-center justify-center h-full">No verification requests found.</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
