'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Send, 
  Trash2, 
  Mail, 
  Clock, 
  BadgeCheck, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowRight,
  Loader2,
  Bookmark,
  MessageSquare,
  History,
  CheckCircle2,
  XCircle,
  Layout
} from 'lucide-react';
import { employerService } from '@/services/employerService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';

export default function HiringPipeline() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const requestsRes = await employerService.getContactRequests();
      if (requestsRes.success) setRequests(requestsRes.data.content || requestsRes.data || []);
    } catch (err: any) {
      toast.error('Failed to synchronize pipeline data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleRespondRequest = async (requestId: string, status: string) => {
    try {
      await employerService.respondContactRequest(requestId, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      loadData();
    } catch (err: any) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
         <div className="space-y-4">
            <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-3 py-1">
               RECRUITMENT PIPELINE
            </Badge>
            <div className="space-y-1">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Hiring Pipeline</h1>
               <p className="text-slate-500 font-semibold italic">Track your curated talent and active outreach operations</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-12 rounded-2xl px-6 font-black gap-2 border-slate-100">
               <Link href="/hiring-assist">
                  <Search className="h-4 w-4" /> Discover More
               </Link>
            </Button>
         </div>
      </div>

      <Tabs defaultValue="requests" onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 mb-8 flex overflow-x-auto no-scrollbar">
          <TabsTrigger value="requests" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <MessageSquare className="h-4 w-4" /> Active Outreach
          </TabsTrigger>
        </TabsList>

        <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
           <CardContent className="p-0">
              {isLoading ? (
                 <div className="py-24 flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing records...</p>
                 </div>
               ) : (
                 <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-slate-100">
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Transmission Target</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Position Node</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Protocol Status</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10 text-right">Direct Channel</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {requests.map((req) => (
                          <TableRow key={req.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                             <TableCell className="py-6 px-10">
                                <div className="space-y-1">
                                   <p className="font-black text-slate-900 text-lg tracking-tight">{req.developerName || req.fullName || 'Developer'}</p>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" /> {new Date(req.createdAt || req.date || '').toLocaleDateString()}
                                   </p>
                                </div>
                             </TableCell>
                             <TableCell className="py-6 px-10">
                                <span className="font-bold text-slate-600 text-sm">{req.jobTitle || req.position || 'Outreach Query'}</span>
                             </TableCell>
                             <TableCell className="py-6 px-10">
                                <Badge className={cn(
                                   "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5 shadow-sm",
                                   req.status === 'Accepted' ? "bg-emerald-500" : req.status === 'Declined' ? "bg-red-500" : "bg-amber-500"
                                )}>
                                   {req.status || 'PENDING_ACK'}
                                </Badge>
                             </TableCell>
                             <TableCell className="py-6 px-10 text-right">
                                {req.status === 'Accepted' ? (
                                   <Button asChild variant="outline" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border-emerald-100 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50">
                                      <a href={`mailto:${req.email || ''}`}>
                                         <Mail className="h-3.5 w-3.5 mr-2" /> Sync via Email
                                      </a>
                                   </Button>
                                ) : (
                                   <div className="flex justify-end gap-2">
                                      <Button size="sm" className="h-10 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700" onClick={() => handleRespondRequest(req.id, 'Accepted')}>
                                         Acknowledge
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-10 rounded-xl font-black border-slate-100 text-slate-400" onClick={() => handleRespondRequest(req.id, 'Declined')}>
                                         Terminate
                                      </Button>
                                   </div>
                                )}
                             </TableCell>
                          </TableRow>
                       ))}
                       {requests.length === 0 && (
                          <TableRow>
                             <TableCell colSpan={4} className="py-24 text-center">
                                <div className="space-y-4">
                                   <History className="h-12 w-12 text-slate-100 mx-auto" />
                                   <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No active outreach protocols detected</p>
                                </div>
                             </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                 </Table>
              )}
           </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
