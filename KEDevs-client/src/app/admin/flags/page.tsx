'use client';

import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Check, 
  Gavel, 
  Eye, 
  ShieldAlert, 
  Clock, 
  User, 
  Briefcase, 
  MessageSquare,
  Loader2,
  Trash2,
  AlertTriangle,
  History
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
import { Separator } from '@/components/ui/separator';

export default function FlaggedContent() {
  const [tab, setTab] = useState('jobs');
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async (currentTab: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = currentTab === 'jobs'
        ? await adminService.getFlaggedJobs()
        : currentTab === 'users'
          ? await adminService.getFlaggedUsers()
          : await adminService.getFlaggedComments();

      if (response.success) {
        setFlags(response.data.content || []);
      }
    } catch (err: any) {
      setError('Failed to load flagging repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags(tab);
  }, [tab]);

  const handleReview = async (flagId: string, outcome: string) => {
    try {
      if (tab === 'jobs') {
        await adminService.reviewJobFlag(flagId, { outcome });
      } else if (tab === 'users') {
        await adminService.reviewUserFlag(flagId, { outcome });
      } else {
        await adminService.reviewCommentFlag(flagId, { outcome });
      }
      toast.success(`Flag processed successfully`);
      setFlags((prev) => prev.filter((item) => item.flagId !== flagId));
    } catch (err: any) {
      toast.error('Moderation action failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="h-4" />

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
         <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
         <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Protocol Alert</p>
            <p className="text-xs font-medium text-amber-700 leading-relaxed">
               All moderation decisions are permanent and logged in the system audit trail.
            </p>
         </div>
      </div>

      <Tabs defaultValue="jobs" onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 mb-8 flex overflow-x-auto no-scrollbar">
          <TabsTrigger value="jobs" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <Briefcase className="h-4 w-4" /> Job Listings
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <User className="h-4 w-4" /> User Profiles
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <MessageSquare className="h-4 w-4" /> Community Talk
          </TabsTrigger>
        </TabsList>

        <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
           <CardContent className="p-0">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning content...</p>
                </div>
              ) : (
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Flagged Content</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Violation Class</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Initiated By</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Timestamp</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Moderation</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {flags.map((item) => (
                         <TableRow key={item.flagId} className="border-slate-50 hover:bg-red-50/10 transition-colors">
                            <TableCell className="py-5 px-8">
                               <div className="space-y-1 max-w-[300px]">
                                  <p className="font-black text-slate-900 text-sm truncate">{item.jobTitle || item.flaggedUserEmail || item.commentContent || 'System flag'}</p>
                                  {tab === 'comments' && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author: {item.authorId || 'Anonymous'}</p>}
                                  {tab === 'jobs' && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted by: {item.postedBy || 'Anonymous'}</p>}
                                  {tab === 'users' && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role: {item.flaggedUserRole || 'Unknown'}</p>}
                               </div>
                            </TableCell>
                            <TableCell className="py-5 px-8">
                               <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-red-100 bg-red-50 text-red-600 px-2 py-0.5">
                                  {item.reason || 'Review Needed'}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-5 px-8">
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                  <ShieldAlert className="h-3.5 w-3.5 text-primary" /> {item.flaggedBy || item.flaggedById || 'System Bot'}
                               </div>
                            </TableCell>
                            <TableCell className="py-5 px-8 text-xs font-bold text-slate-500">
                               {new Date(item.flagCreatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-5 px-8 text-right">
                               <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-100 hover:bg-slate-50">
                                     <Eye className="h-4 w-4 text-slate-400" />
                                  </Button>
                                  
                                  {tab === 'jobs' && (
                                    <>
                                      <Button size="sm" variant="outline" title="Keep Job" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-emerald-600 hover:bg-emerald-50" onClick={() => handleReview(item.flagId, 'LEGITIMATE')}>
                                         <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Warn User" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-amber-600 hover:bg-amber-50" onClick={() => handleReview(item.flagId, 'WARN')}>
                                         <AlertOctagon className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Remove Job" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-destructive hover:bg-destructive/10" onClick={() => handleReview(item.flagId, 'REMOVE')}>
                                         <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}

                                  {tab === 'users' && (
                                    <>
                                      <Button size="sm" variant="outline" title="Clear Flag" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-emerald-600 hover:bg-emerald-50" onClick={() => handleReview(item.flagId, 'CLEARED')}>
                                         <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Warn User" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-amber-600 hover:bg-amber-50" onClick={() => handleReview(item.flagId, 'WARNED')}>
                                         <AlertOctagon className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Suspend User" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-orange-600 hover:bg-orange-50" onClick={() => handleReview(item.flagId, 'SUSPENDED')}>
                                         <Clock className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Ban User" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-destructive hover:bg-destructive/10" onClick={() => handleReview(item.flagId, 'BANNED')}>
                                         <Gavel className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}

                                  {tab === 'comments' && (
                                    <>
                                      <Button size="sm" variant="outline" title="Keep Comment" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-emerald-600 hover:bg-emerald-50" onClick={() => handleReview(item.flagId, 'KEPT')}>
                                         <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" title="Remove Comment" className="h-9 w-9 p-0 rounded-xl border-slate-100 text-destructive hover:bg-destructive/10" onClick={() => handleReview(item.flagId, 'REMOVED')}>
                                         <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                      {flags.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center">
                               <div className="flex flex-col items-center gap-3">
                                  <History className="h-10 w-10 text-slate-200" />
                                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Clear for now. No pending flags found.</p>
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
