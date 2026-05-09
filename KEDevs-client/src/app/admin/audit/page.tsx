'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  Printer, 
  Clock, 
  User, 
  Activity, 
  Target, 
  Network,
  Download,
  Filter,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

const mockLogs = [
  { id: 'l1', admin: 'Admin User', action: 'Approved Employer', target: 'TechFlow Solutions', date: '2024-05-06 14:20:12', ip: '192.168.1.1' },
  { id: 'l2', admin: 'Admin User', action: 'Update Setting', target: 'spotlight_day_fee: 100 -> 150', date: '2024-05-06 10:05:45', ip: '192.168.1.1' },
  { id: 'l3', admin: 'Admin User', action: 'Suspended User', target: 'Troll123', date: '2024-05-05 16:45:30', ip: '192.168.1.1' },
  { id: 'l4', admin: 'Admin User', action: 'Deleted Comment', target: 'Comment ID: 8942', date: '2024-05-05 09:12:11', ip: '192.168.1.1' },
];

export default function AuditLog() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <History className="h-8 w-8 text-primary" /> System Audit Log
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Trace administrative actions across the platform</p>
         </div>
         
         <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-black gap-2 border-slate-100">
               <Printer className="h-4 w-4" /> Print Log
            </Button>
            <Button className="rounded-xl font-black bg-slate-900 px-6">
               <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
         </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
         <CardContent className="p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                     placeholder="Filter by admin, specific action, or target entity..." 
                     className="pl-11 h-14 rounded-2xl bg-slate-50 border-none font-bold"
                  />
               </div>
               <Button variant="outline" className="h-14 rounded-2xl px-6 font-black gap-2 border-slate-100">
                  <Filter className="h-4 w-4" /> Advanced Filter
               </Button>
            </div>

            <div className="rounded-[2rem] border border-slate-100 overflow-hidden">
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-100">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Temporal Trace</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Administrative Actor</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Operation</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Entity / Modification</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Access ID</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {mockLogs.map((log) => (
                        <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <TableCell className="py-5 px-8">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                 <Clock className="h-3.5 w-3.5 text-primary" /> {log.date}
                              </div>
                           </TableCell>
                           <TableCell className="py-5 px-8">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                 </div>
                                 <span className="font-black text-slate-900 text-sm">{log.admin}</span>
                              </div>
                           </TableCell>
                           <TableCell className="py-5 px-8">
                              <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200 bg-white shadow-sm px-2 py-0.5">
                                 {log.action}
                              </Badge>
                           </TableCell>
                           <TableCell className="py-5 px-8">
                              <div className="flex items-center gap-2">
                                 <Target className="h-3.5 w-3.5 text-slate-300" />
                                 <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{log.target}</span>
                              </div>
                           </TableCell>
                           <TableCell className="py-5 px-8 text-right">
                              <code className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                 {log.ip}
                              </code>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
            
            <div className="flex items-center justify-between">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" /> Audit integrity verified by platform core
               </p>
               <div className="flex gap-2">
                  <Button variant="ghost" disabled className="h-10 rounded-xl font-black text-[10px] uppercase">Previous</Button>
                  <Button variant="ghost" className="h-10 rounded-xl font-black text-[10px] uppercase text-primary">Next Page</Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
