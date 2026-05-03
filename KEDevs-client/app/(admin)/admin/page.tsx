'use client';

import { useQuery } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Briefcase, Building2, CreditCard, AlertTriangle, FileText } from 'lucide-react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
  });

  const { data: signupTrend } = useQuery({
    queryKey: ['admin', 'dashboard', 'signups'],
    queryFn: adminApi.getSignupTrend,
  });

  const { data: revenueTrend } = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue'],
    queryFn: adminApi.getRevenueTrend,
  });

  const { data: subStats } = useQuery({
    queryKey: ['admin', 'dashboard', 'subscriptions'],
    queryFn: adminApi.getSubscriptionStats,
  });

  if (statsLoading || !stats) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const PIE_COLORS = ['#4ccb8c', '#ef4444', '#f59e0b']; // primary, red, amber
  const subPieData = subStats ? [
    { name: 'Active', value: subStats.active },
    { name: 'Expired', value: subStats.expired },
    { name: 'Cancelled', value: subStats.cancelled },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-medium">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Total Developers" value={stats.totalDevelopers} icon={<Briefcase className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Employers" value={stats.totalEmployers} icon={<Building2 className="w-6 h-6 text-purple-500" />} />
        <StatCard title="Total Jobs" value={stats.totalJobs} icon={<FileText className="w-6 h-6 text-amber-500" />} />
        
        <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue}`} icon={<CreditCard className="w-6 h-6 text-primary" />} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={<CreditCard className="w-6 h-6 text-indigo-500" />} />
        <StatCard title="Pending Flags" value={stats.pendingFlags} icon={<AlertTriangle className="w-6 h-6 text-red-500" />} />
        <StatCard title="Pending Employers" value={stats.pendingEmployerApprovals} icon={<AlertTriangle className="w-6 h-6 text-orange-500" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-secondary shadow-sm">
          <CardHeader>
            <CardTitle>Signup Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '350px', width: '100%' }}>
              {mounted && signupTrend && signupTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={signupTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="count" stroke="#4ccb8c" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  {!mounted ? <Loader2 className="w-5 h-5 animate-spin" /> : 'No signup data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-secondary shadow-sm">
          <CardHeader>
            <CardTitle>Revenue by Payment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '350px', width: '100%' }}>
              {mounted && revenueTrend && revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="paymentType" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="totalAmount" fill="#4ccb8c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  {!mounted ? <Loader2 className="w-5 h-5 animate-spin" /> : 'No revenue data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-secondary shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '350px', width: '100%' }} className="flex justify-center">
              {mounted && subStats && (subStats.active > 0 || subStats.expired > 0 || subStats.cancelled > 0) ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={subPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  {!mounted ? <Loader2 className="w-5 h-5 animate-spin" /> : 'No subscription data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border-secondary shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-black text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
