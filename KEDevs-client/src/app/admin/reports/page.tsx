'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Wallet,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const reportTabs = [
  { id: 'user', label: 'User Ecosystem', icon: Users },
  { id: 'revenue', label: 'Revenue Streams', icon: Wallet },
  { id: 'jobs', label: 'Marketplace Ops', icon: Briefcase },
  { id: 'verifications', label: 'Identity Trust', icon: ShieldCheck },
  { id: 'flags', label: 'Risk & Flags', icon: AlertOctagon },
  { id: 'audit', label: 'System Audit', icon: Zap },
];

export default function PlatformReports() {
  const [tab, setTab] = useState('user');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <BarChart3 className="h-8 w-8 text-primary" /> Intelligence Reports
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Platform analytics and ecosystem health</p>
         </div>
         
         <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-black gap-2 border-slate-100">
               <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" className="rounded-xl font-black gap-2 border-red-100 text-red-600 hover:bg-red-50">
               <Download className="h-4 w-4" /> Export PDF
            </Button>
         </div>
      </div>

      <Tabs defaultValue="user" onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 mb-8 flex overflow-x-auto no-scrollbar">
          {reportTabs.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.id} value={item.id} className="rounded-xl px-6 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 whitespace-nowrap">
                 <Icon className="h-4 w-4" /> {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
           <CardHeader className="p-10 pb-0">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div className="space-y-2">
                    <CardTitle className="text-2xl font-black">Data Parameters</CardTitle>
                    <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Configure report constraints</CardDescription>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-48">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Timeline</p>
                       <Select defaultValue="last30">
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100">
                             <SelectItem value="last7" className="font-bold">Last 7 Days</SelectItem>
                             <SelectItem value="last30" className="font-bold">Last 30 Days</SelectItem>
                             <SelectItem value="last90" className="font-bold">Last 90 Days</SelectItem>
                             <SelectItem value="custom" className="font-bold">Custom Range</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <Button className="h-12 rounded-xl font-black bg-slate-900 px-8">Generate Analysis</Button>
                 </div>
              </div>
           </CardHeader>

           <CardContent className="p-10 space-y-12">
              <Separator className="bg-slate-50" />

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                    { label: 'Active Volume', value: '1,284', trend: '+12%', color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'System Health', value: '99.9%', trend: 'Stable', color: 'bg-blue-50 text-blue-600' },
                    { label: 'Entity Growth', value: '+42', trend: 'High', color: 'bg-amber-50 text-amber-600' },
                    { label: 'Risk Factor', value: '0.02%', trend: '-4%', color: 'bg-indigo-50 text-indigo-600' },
                 ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                       <div className="flex items-end justify-between">
                          <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                          <Badge className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-none", stat.color)}>
                             {stat.trend}
                          </Badge>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Data Table */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                       <TrendingUp className="h-5 w-5 text-primary" /> Core Metrics Timeline
                    </h3>
                    <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary h-8">View Raw Data</Button>
                 </div>
                 
                 <div className="rounded-[2rem] border border-slate-100 overflow-hidden">
                    <Table>
                       <TableHeader className="bg-slate-50/50">
                          <TableRow className="border-slate-100">
                             <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-5 px-6">Timestamp</TableHead>
                             <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-5 px-6">Classification</TableHead>
                             <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-5 px-6">Aggregate Value</TableHead>
                             <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-5 px-6 text-right">Performance</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {[1, 2, 3, 4, 5].map(i => (
                             <TableRow key={i} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                                <TableCell className="py-4 px-6 font-bold text-slate-600">2024-05-0{i}</TableCell>
                                <TableCell className="py-4 px-6">
                                   <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest bg-slate-50 border-slate-200">ACTIVE_ENTITIES</Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6 font-black text-slate-900">{400 + (i * 12)}</TableCell>
                                <TableCell className="py-4 px-6 text-right font-black text-emerald-500">+{8 + i}%</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10 opacity-50" />
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                       <h4 className="text-xl font-black flex items-center justify-center md:justify-start gap-3">
                          <Sparkles className="h-5 w-5 text-amber-400" /> Automated Insight
                       </h4>
                       <p className="text-sm font-medium text-slate-400 max-w-md">
                          Platform activity has increased by <span className="text-white font-bold">14%</span> compared to the previous cycle. Identity trust score is currently at an all-time high.
                       </p>
                    </div>
                    <Button className="rounded-2xl h-14 px-8 font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10">
                       Deep Analytics Mode
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
