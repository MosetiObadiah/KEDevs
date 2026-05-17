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
   History,
   X,
   Download,
   FileSpreadsheet,
   FileText
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
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FlaggedContent() {
   const [tab, setTab] = useState('jobs');
   const [flags, setFlags] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showProtocolAlert, setShowProtocolAlert] = useState(true);
   const [viewHistory, setViewHistory] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

   const handleExport = async (format: 'csv' | 'pdf') => {
      setIsExporting(true);
      try {
         let category: string | undefined = undefined;
         if (tab === 'jobs') category = 'JOB';
         else if (tab === 'users') category = 'USER';
         else if (tab === 'comments') category = 'COMMENT';

         const blob = await adminService.exportFlags(format, category, viewHistory);
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         
         const scopeText = viewHistory ? 'reviewed_history' : 'active_pending';
         const categoryText = category ? category.toLowerCase() : 'all';
         a.download = `flags_${categoryText}_${scopeText}_${new Date().toISOString().split('T')[0]}.${format}`;
         
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);
         toast.success(`${format.toUpperCase()} Exported successfully`);
      } catch (err: any) {
         console.error('Export failed', err);
         toast.error(`Export failed. Please try again.`);
      } finally {
         setIsExporting(false);
      }
   };

   const fetchFlags = async (currentTab: string, historyMode: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
         const response = currentTab === 'jobs'
            ? await adminService.getFlaggedJobs(0, 20, historyMode)
            : currentTab === 'users'
               ? await adminService.getFlaggedUsers(0, 20, historyMode)
               : await adminService.getFlaggedComments(0, 20, historyMode);

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
      fetchFlags(tab, viewHistory);
   }, [tab, viewHistory]);

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

   const renderStatusBadge = (status: string) => {
      const normalized = status?.toUpperCase() || '';

      let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
      if (normalized.includes('LEGITIMATE') || normalized.includes('KEPT') || normalized.includes('CLEARED')) {
         colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (normalized.includes('REMOVED') || normalized.includes('BANNED')) {
         colorClass = "bg-red-50 text-red-700 border-red-200";
      } else if (normalized.includes('WARNED') || normalized.includes('SUSPENDED')) {
         colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      }

      return (
         <Badge variant="outline" className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm", colorClass)}>
            {normalized.replace('REVIEWED_', '').replace('_', ' ')}
         </Badge>
      );
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="h-4" />

         {showProtocolAlert && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 relative group animate-in slide-in-from-top duration-300">
               <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
               <div className="space-y-1 pr-8">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Protocol Alert</p>
                  <p className="text-xs font-medium text-amber-700 leading-relaxed">
                     All moderation decisions are permanent and logged in the system audit trail.
                  </p>
               </div>
               <button
                  onClick={() => setShowProtocolAlert(false)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-amber-100 text-amber-700/70 hover:text-amber-900 transition-colors"
               >
                  <X className="h-4 w-4" />
               </button>
            </div>
         )}

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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
               <h2 className="font-black text-xl text-slate-800 capitalize tracking-tight flex items-center gap-2">
                  {tab} Queue
                  {viewHistory && <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase tracking-wider">Archive Mode</Badge>}
               </h2>
               <div className="flex items-center gap-3">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-9 px-4 gap-2" disabled={isExporting}>
                           <Download className="h-4 w-4 text-primary" />
                           {isExporting ? 'Exporting...' : 'Export'}
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium flex items-center gap-2">
                           <FileSpreadsheet className="h-4 w-4" /> Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium flex items-center gap-2">
                           <FileText className="h-4 w-4" /> Download as PDF
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center bg-slate-100/80 p-1 rounded-xl shadow-inner w-fit">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewHistory(false)}
                        className={cn(
                           "rounded-lg px-4 font-bold text-xs h-8 transition-all",
                           !viewHistory ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                     >
                        Active Pending
                     </Button>
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewHistory(true)}
                        className={cn(
                           "rounded-lg px-4 font-bold text-xs h-8 transition-all",
                           viewHistory ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                     >
                        Reviewed History
                     </Button>
                  </div>
               </div>
            </div>

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
                              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">{viewHistory ? 'Resolution' : 'Moderation'}</TableHead>
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
                                    {viewHistory ? (
                                       <div className="flex justify-end animate-in fade-in duration-300">
                                          {renderStatusBadge(item.status)}
                                       </div>
                                    ) : (
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
                                    )}
                                 </TableCell>
                              </TableRow>
                           ))}
                           {flags.length === 0 && (
                              <TableRow>
                                 <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                       <History className="h-10 w-10 text-slate-200" />
                                       <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                                          {viewHistory ? 'No audited flag records found.' : 'Clear for now. No pending flags found.'}
                                       </p>
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
