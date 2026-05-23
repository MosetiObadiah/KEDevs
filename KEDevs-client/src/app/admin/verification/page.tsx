'use client';

import React, { useState, useEffect } from 'react';
import {
   ShieldCheck,
   Eye,
   Check,
   X,
   FileText,
   Calendar,
   Users,
   Building2,
   ExternalLink,
   ShieldAlert,
   Loader2,
   FileSearch,
   Search,
   FilterX,
   CalendarDays,
   ArrowRight,
   Download,
   History,
   FileBarChart2,
   Trash2,
   CheckCircle,
   XCircle,
   Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';

import { adminService } from '@/services/adminService';

export default function VerificationQueue() {
   const [tab, setTab] = useState('ALL');
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [selectedReq, setSelectedReq] = useState<any>(null);
   const [requests, setRequests] = useState<any[]>([]);
   const [history, setHistory] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isHistoryLoading, setIsHistoryLoading] = useState(true);
   const [processing, setProcessing] = useState(false);
   const [isExporting, setIsExporting] = useState<string | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [decisionFilter, setDecisionFilter] = useState('ALL');
   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
   const [rejectionReason, setRejectionReason] = useState('');

   const fetchRequests = async () => {
      setIsLoading(true);
      try {
         const apiRoleParam = tab === 'ALL' ? undefined : tab;
         const res = await adminService.getVerificationRequests(apiRoleParam);
         if (res.success) {
            setRequests(res.data.content || res.data);
         }
      } catch (err: any) {
         toast.error('Failed to load active queue');
      } finally {
         setIsLoading(false);
      }
   };

   const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
         const res = await adminService.getVerificationHistory(0, 10);
         if (res.success) {
            setHistory(res.data.content || res.data);
         }
      } catch (err: any) {
         console.error('History load failed', err);
      } finally {
         setIsHistoryLoading(false);
      }
   };

   useEffect(() => {
      fetchRequests();
   }, [tab]);

   useEffect(() => {
      fetchHistory();
   }, []);

   const handleApprove = async () => {
      if (!selectedReq) return;
      setProcessing(true);
      try {
         const res = await adminService.reviewVerificationRequest(selectedReq.requestId, { status: 'APPROVED' });
         if (res.success) {
            toast.success('Identity verified and badge granted successfully');
            setIsPreviewOpen(false);
            fetchRequests();
            fetchHistory();
         }
      } catch (err: any) {
         toast.error(err.message || 'Failed to approve verification');
      } finally {
         setProcessing(false);
      }
   };

   const handleReject = async () => {
      if (!selectedReq || !rejectionReason.trim()) return;
      setProcessing(true);
      try {
         const res = await adminService.reviewVerificationRequest(selectedReq.requestId, {
            status: 'REJECTED',
            reason: rejectionReason
         });
         if (res.success) {
            toast.error('Identity verification rejected');
            setIsRejectDialogOpen(false);
            setIsPreviewOpen(false);
            setRejectionReason('');
            fetchRequests();
            fetchHistory();
         }
      } catch (err: any) {
         toast.error(err.message || 'Failed to reject');
      } finally {
         setProcessing(false);
      }
   };

   const handleExport = async (formatType: 'csv' | 'pdf') => {
      setIsExporting(formatType);
      try {
         const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

         const response = await fetch(`${API_URL}/api/v1/admin/verification/export?format=${formatType}`, {
            credentials: 'include',
         });

         if (!response.ok) throw new Error('Export generation failed');

         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `verification_audit_log.${formatType}`;
         a.click();
         window.URL.revokeObjectURL(url);
         toast.success(`Exported ${formatType.toUpperCase()} successfully`);
      } catch (error) {
         toast.error('Unable to output system generation artifacts.');
      } finally {
         setIsExporting(null);
      }
   };

   const downloadFile = async (url: string, filename: string) => {
      try {
         toast.loading('Preparing document download...');
         const response = await fetch(url);
         if (!response.ok) throw new Error('Network response was not ok');
         const blob = await response.blob();
         const objectUrl = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = objectUrl;
         a.download = filename;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(objectUrl);
         toast.dismiss();
         toast.success('Document downloaded successfully');
      } catch (error) {
         console.error('Download failed', error);
         toast.dismiss();
         window.open(url, '_blank');
      }
   };

   const filteredRequests = requests.filter((req: any) => {
      const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDecision = decisionFilter === 'ALL' || req.status === decisionFilter;
      return matchesSearch && matchesDecision;
   });

   const filteredHistory = history.filter((req: any) => {
      const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDecision = decisionFilter === 'ALL' || req.status === decisionFilter;
      const matchesClass = tab === 'ALL' || req.role === tab;
      return matchesSearch && matchesDecision && matchesClass;
   });

   return (
      <div className="flex flex-col min-h-screen bg-muted/30 space-y-8 animate-in fade-in duration-700 pb-20">
         <div className="h-4" />

         <div className="max-w-7xl w-full mx-auto px-6 space-y-8">
            {/* Horizontal Filters Bar */}
            <Card className="border-border/50 shadow-sm rounded-xl-[2rem] overflow-hidden">
               <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                     <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                           placeholder="Search applicant name..." 
                           className="pl-10 text-sm border-border/50 focus-visible:ring-primary/20 h-11 rounded-xl"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>

                     <div>
                        <Select value={tab} onValueChange={setTab}>
                           <SelectTrigger className="border-border/50 focus:ring-primary/20 h-11 rounded-xl font-medium text-xs uppercase tracking-wider">
                              <SelectValue placeholder="Select Class" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-border/50">
                              <SelectItem value="ALL" className="font-medium text-xs uppercase tracking-wider cursor-pointer">All Affiliations</SelectItem>
                              <SelectItem value="DEVELOPER" className="font-medium text-xs uppercase tracking-wider cursor-pointer">Developers</SelectItem>
                              <SelectItem value="EMPLOYER" className="font-medium text-xs uppercase tracking-wider cursor-pointer">Employer</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div>
                        <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                           <SelectTrigger className="border-border/50 focus:ring-primary/20 h-11 rounded-xl font-medium text-xs uppercase tracking-wider">
                              <SelectValue placeholder="Decision" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-border/50">
                              <SelectItem value="ALL" className="font-medium text-xs uppercase tracking-wider cursor-pointer">All Decisions</SelectItem>
                              <SelectItem value="APPROVED" className="font-medium text-xs uppercase tracking-wider cursor-pointer">Approved Only</SelectItem>
                              <SelectItem value="REJECTED" className="font-medium text-xs uppercase tracking-wider cursor-pointer">Rejected Only</SelectItem>
                              <SelectItem value="UNDER_REVIEW" className="font-medium text-xs uppercase tracking-wider cursor-pointer">Pending Only</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between h-11">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Queue:</span>
                              <Badge className="bg-azure-50 text-azure-800 hover:bg-azure-50 font-black text-[10px] px-2 py-0.5 rounded-2xl border-none shadow-none">{filteredRequests.length}</Badge>
                           </div>
                           {(searchTerm || decisionFilter !== 'ALL' || tab !== 'ALL') && (
                              <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-6 px-1 text-[10px] font-black uppercase text-muted-foreground hover:text-slate-900 hover:bg-transparent"
                                 onClick={() => {
                                    setSearchTerm('');
                                    setDecisionFilter('ALL');
                                    setTab('ALL');
                                 }}
                              >
                                 Clear
                              </Button>
                           )}
                        </div>

                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="font-medium border-primary/20 hover:bg-primary/5 h-11 px-4 rounded-xl shrink-0" disabled={!!isExporting}>
                                 <Download className="mr-2 h-4 w-4 text-primary" />
                                 {isExporting ? 'Exporting...' : 'Export'}
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl border-border/50">
                              <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs uppercase tracking-wide py-2.5 px-4 rounded-xl focus:bg-muted/50">
                                 <Download className="mr-2 h-4 w-4 text-slate-500" /> Download as CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs uppercase tracking-wide py-2.5 px-4 rounded-xl focus:bg-muted/50">
                                 <FileText className="mr-2 h-4 w-4 text-slate-500" /> Download as PDF
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Main Content Area */}
            <main className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                     [1, 2, 3].map(i => (
                        <Card key={i} className="p-8 flex flex-col items-center border-border/50 h-80 rounded-3xl">
                           <Skeleton className="h-20 w-20 rounded-full mb-4" />
                           <Skeleton className="h-6 w-3/4 mb-2" />
                           <Skeleton className="h-4 w-1/2 mb-6" />
                           <Skeleton className="h-12 w-full rounded-xl mt-auto" />
                        </Card>
                     ))
                  ) : filteredRequests.length > 0 ? (
                     filteredRequests.map((req: any) => (
                        <Card key={req.requestId} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden rounded-3xl bg-card relative">
                           <CardContent className="p-8 text-center flex-1 flex flex-col items-center">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-500" />

                              <div className="relative mb-6 z-10">
                                 <Avatar className="h-20 w-20 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm ring-4 ring-background">
                                    <AvatarFallback className={cn(
                                       "text-white text-2xl font-black uppercase",
                                       req.role === 'EMPLOYER' ? "bg-azure-500" : "bg-slate-900"
                                    )}>
                                       {req.userName.charAt(0)}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div className="absolute -bottom-1 -right-1 bg-azure-500 rounded-full p-1.5 shadow-sm ring-2 ring-background">
                                    {req.role === 'EMPLOYER' ? <Building2 className="h-3 w-3 text-white" /> : <Users className="h-3 w-3 text-white" />}
                                 </div>
                              </div>

                              <div className="mb-4 z-10">
                                 <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors mb-1 tracking-tight leading-tight">
                                    {req.userName}
                                 </h3>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
                                    <CalendarDays className="h-3 w-3" /> {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                                 </p>
                              </div>

                              <Badge className={cn(
                                 "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full mb-6 shadow-none transition-all",
                                 req.status === 'APPROVED' ? "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-500 group-hover:text-white" :
                                 req.status === 'REJECTED' ? "bg-danger-50 text-danger-700 group-hover:bg-danger-500 group-hover:text-white" :
                                 "bg-azure-50 text-azure-700 group-hover:bg-azure-500 group-hover:text-white"
                               )}>
                                 {req.status?.replace('_', ' ')}
                              </Badge>

                              <div className="flex flex-wrap justify-center gap-1.5 mt-auto">
                                 {req.idDocumentUrl && (
                                    <Badge variant="outline" className="text-[9px] py-0.5 px-2 font-medium bg-muted/30 border-border rounded-2xl text-slate-700">
                                       PRIMARY DOC
                                    </Badge>
                                 )}
                                 {req.certificateUrls?.length > 0 && (
                                    <Badge variant="outline" className="text-[9px] py-0.5 px-2 font-medium bg-muted/30 border-border rounded-2xl text-slate-700">
                                       +{req.certificateUrls.length} CERTS
                                    </Badge>
                                 )}
                              </div>
                           </CardContent>

                           <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex flex-col gap-2 z-10">
                              <Button
                                 className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest group/btn shadow-none"
                                 onClick={() => {
                                    setSelectedReq(req);
                                    setPreviewUrl(req.idDocumentUrl || req.passportPhotoUrl);
                                    setIsPreviewOpen(true);
                                 }}
                              >
                                 Auditing Console <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                           </CardFooter>
                        </Card>
                     ))
                  ) : (
                     <div className="col-span-full py-12 text-center space-y-4 bg-card rounded-xl-[3rem] border border-border/50 border-dashed">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-2">
                           <FilterX className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight">No Pending Requests</h3>
                           <p className="text-sm text-muted-foreground font-medium">Zero unresolved verification artifacts remain in queue.</p>
                        </div>
                     </div>
                  )}
               </div>

               {/* HISTORY LOG SECTION */}
               <div className="space-y-6 pt-4">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-xl tracking-tight">
                           <History className="h-6 w-6 text-slate-500" />
                           <span>Verification Lifecycle History</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Complete historical register retrieved from system storage.</p>
                     </div>
                  </div>

                  <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
                     <Table>
                        <TableHeader className="bg-muted/40">
                           <TableRow className="border-border/50 hover:bg-transparent">
                              <TableHead className="font-medium text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Logged Timestamp</TableHead>
                              <TableHead className="font-medium text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Applicant Name</TableHead>
                              <TableHead className="font-medium text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Affiliation</TableHead>
                              <TableHead className="font-medium text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Decision</TableHead>
                              <TableHead className="font-medium text-[10px] uppercase tracking-wider py-4 px-6 text-slate-900 text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isHistoryLoading ? (
                              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm font-medium">Acquiring log feed...</TableCell></TableRow>
                           ) : filteredHistory.length === 0 ? (
                              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm font-medium">No past verification records found.</TableCell></TableRow>
                           ) : filteredHistory.map((req: any) => (
                              <TableRow key={req.requestId} className="border-border/50 group hover:bg-muted/30 transition-colors">
                                 <TableCell className="py-4 px-6 text-xs text-muted-foreground font-medium">
                                    {format(new Date(req.createdAt), 'MMM dd, yyyy | HH:mm')}
                                 </TableCell>
                                 <TableCell className="py-4 px-6 font-medium text-slate-900">{req.userName}</TableCell>
                                 <TableCell className="py-4 px-6">
                                    <Badge variant="outline" className="text-[9px] font-medium uppercase tracking-wider py-0 h-5 border-border/60 text-slate-500">
                                       {req.role}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="py-4 px-6">
                                    <Badge className={cn(
                                       "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-2xl shadow-none border-none",
                                       req.status === 'APPROVED' ? "bg-cyan-600/10 text-cyan-800" :
                                          req.status === 'REJECTED' ? "bg-danger-500/10 text-danger-700" :
                                             "bg-azure-500/10 text-azure-700"
                                    )}>
                                       {req.status?.replace('_', ' ')}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="py-4 px-6 text-right">
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 w-8 p-0 rounded-xl group-hover:bg-white transition-colors"
                                       onClick={() => {
                                          setSelectedReq(req);
                                          setPreviewUrl(req.idDocumentUrl || req.passportPhotoUrl);
                                          setIsPreviewOpen(true);
                                       }}
                                    >
                                       <Eye className="h-3.5 w-3.5 text-slate-500 group-hover:text-primary" />
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </Card>
               </div>
            </main>
         </div>

         {/* ENHANCED, IMMERSIVE DIALOG FOR REVIEW */}
         <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] rounded-xl-[3.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
               {/* Header Bar */}
               <div className="bg-slate-900 px-12 py-8 text-white flex items-center justify-between shrink-0">
                  <DialogHeader className="text-left space-y-1">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-primary fill-primary/20" />
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Review Hub</DialogTitle>
                     </div>
                     <DialogDescription className="sr-only">Detailed verification analysis workbench.</DialogDescription>
                     <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5">
                           <div className="h-2 w-2 rounded-full bg-primary" />
                           <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Subject: {selectedReq?.userName}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-slate-700" />
                        <span className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">{selectedReq?.role} RECORD</span>
                     </div>
                  </DialogHeader>

                  <Button variant="ghost" className="rounded-full h-12 w-12 p-0 text-slate-500 hover:text-white hover:bg-white/10" onClick={() => setIsPreviewOpen(false)}>
                     <X className="h-6 w-6" />
                  </Button>
               </div>

               {/* Body Split Layout */}
               <div className="flex-1 flex overflow-hidden bg-slate-50/50">
                  <div className="w-96 bg-white border-r border-slate-100 flex flex-col overflow-y-auto p-10 space-y-8 shrink-0">
                     <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Evidence Repository</h4>
                        <p className="text-xs font-medium text-slate-500">Click any artifact to project into High-Res viewport.</p>
                     </div>

                     <div className="space-y-3">
                        {selectedReq?.idDocumentUrl && (
                           <div
                              role="button"
                              tabIndex={0}
                              className={cn(
                                 "w-full text-left flex items-center justify-between p-5 rounded-xl-[1.5rem] transition-all border cursor-pointer",
                                 previewUrl === selectedReq.idDocumentUrl ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                              )}
                              onClick={() => setPreviewUrl(selectedReq.idDocumentUrl)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPreviewUrl(selectedReq.idDocumentUrl); }}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn("p-2.5 rounded-xl", previewUrl === selectedReq.idDocumentUrl ? "bg-white/20" : "bg-white shadow-sm")}>
                                    <FileText className="h-5 w-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-black text-xs uppercase tracking-tight">
                                       {selectedReq.role === 'EMPLOYER' ? 'Incorporation Cert' : 'Primary ID'}
                                    </span>
                                    <span className={cn("text-[9px] font-medium uppercase tracking-widest", previewUrl === selectedReq.idDocumentUrl ? "text-white/70" : "text-slate-500")}>Mandatory Artifact</span>
                                 </div>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className={cn("h-8 w-8 rounded-xl", previewUrl === selectedReq.idDocumentUrl ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100")}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(selectedReq.idDocumentUrl, `${selectedReq.userName.replace(/\s+/g, '_')}_${selectedReq.role === 'EMPLOYER' ? 'incorporation_cert' : 'primary_id'}`);
                                 }}
                              >
                                 <Download className="h-4 w-4" />
                              </Button>
                           </div>
                        )}

                        {selectedReq?.passportPhotoUrl && (
                           <div
                              role="button"
                              tabIndex={0}
                              className={cn(
                                 "w-full text-left flex items-center justify-between p-5 rounded-xl-[1.5rem] transition-all border cursor-pointer",
                                 previewUrl === selectedReq.passportPhotoUrl ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                              )}
                              onClick={() => setPreviewUrl(selectedReq.passportPhotoUrl)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPreviewUrl(selectedReq.passportPhotoUrl); }}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn("p-2.5 rounded-xl", previewUrl === selectedReq.passportPhotoUrl ? "bg-white/20" : "bg-white shadow-sm")}>
                                    <FileSearch className="h-5 w-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-black text-xs uppercase tracking-tight">
                                       {selectedReq.role === 'EMPLOYER' ? 'KRA PIN Certificate' : 'Biometric Photo'}
                                    </span>
                                    <span className={cn("text-[9px] font-medium uppercase tracking-widest", previewUrl === selectedReq.passportPhotoUrl ? "text-white/70" : "text-slate-500")}>Authenticity Key</span>
                                 </div>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className={cn("h-8 w-8 rounded-xl", previewUrl === selectedReq.passportPhotoUrl ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100")}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(selectedReq.passportPhotoUrl, `${selectedReq.userName.replace(/\s+/g, '_')}_${selectedReq.role === 'EMPLOYER' ? 'kra_pin_cert' : 'biometric_photo'}`);
                                 }}
                              >
                                 <Download className="h-4 w-4" />
                              </Button>
                           </div>
                        )}

                        {selectedReq?.certificateUrls?.map((cert: string, idx: number) => (
                           <div
                              key={idx}
                              role="button"
                              tabIndex={0}
                              className={cn(
                                 "w-full text-left flex items-center justify-between p-5 rounded-xl-[1.5rem] transition-all border cursor-pointer",
                                 previewUrl === cert ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                              )}
                              onClick={() => setPreviewUrl(cert)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPreviewUrl(cert); }}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn("p-2.5 rounded-xl", previewUrl === cert ? "bg-white/20" : "bg-white shadow-sm")}>
                                    <FileText className="h-5 w-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-black text-xs uppercase tracking-tight">
                                       {selectedReq.role === 'EMPLOYER' ? 'Single Business Permit' : `Compliance Cert #${idx + 1}`}
                                    </span>
                                    <span className={cn("text-[9px] font-medium uppercase tracking-widest", previewUrl === cert ? "text-white/70" : "text-slate-500")}>Supporting Clause</span>
                                 </div>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className={cn("h-8 w-8 rounded-xl", previewUrl === cert ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100")}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(cert, `${selectedReq.userName.replace(/\s+/g, '_')}_${selectedReq.role === 'EMPLOYER' ? 'single_business_permit' : 'compliance_cert_' + (idx + 1)}`);
                                 }}
                              >
                                 <Download className="h-4 w-4" />
                              </Button>
                           </div>
                        ))}
                     </div>

                  </div>

                  {/* Right Pane */}
                  <div className="flex-1 p-12 flex flex-col">
                     <div className="flex-1 bg-white rounded-xl-[2.5rem] border-2 border-slate-100 shadow-inner shadow-slate-100 overflow-hidden relative flex items-center justify-center">
                        {previewUrl ? (
                           !previewUrl.toLowerCase().includes('.pdf') ? (
                              <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center bg-slate-800/5 backdrop-blur-sm">
                                 <img
                                    src={previewUrl}
                                    alt="Verification Document"
                                    className="max-w-full max-h-full object-contain"
                                 />
                              </div>
                           ) : (
                              <iframe src={previewUrl} className="absolute inset-0 w-full h-full border-none bg-white" />
                           )
                        ) : (
                           <div className="flex flex-col items-center gap-4 text-slate-300 animate-pulse">
                              <FileSearch className="h-24 w-24 opacity-40" />
                              <span className="text-sm font-black uppercase tracking-widest">Awaiting Projection</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Action Footer - Handle decisions and reverts */}
               <div className="bg-white border-t border-slate-100 px-12 py-8 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                     <Badge className={cn(
                        "shadow-none font-black text-[10px] px-3 py-1.5 rounded-xl tracking-widest uppercase",
                        selectedReq?.status === 'APPROVED' ? "bg-cyan-50 text-cyan-800" :
                           selectedReq?.status === 'REJECTED' ? "bg-danger-50 text-danger-700" :
                              "bg-slate-100 text-slate-900"
                     )}>
                        AUDIT RECORD: {selectedReq?.status?.replace('_', ' ')}
                     </Badge>
                  </div>
                  <div className="flex gap-4">
                     {/* Revert or Initial Decision logic */}
                     {selectedReq?.status === 'APPROVED' ? (
                        <>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center mr-4">
                              Decision logged. Revert if necessary:
                           </p>
                           <Button
                              variant="ghost"
                              className="rounded-2xl font-black h-14 px-10 text-danger-500 hover:bg-danger-50 transition-all border border-transparent hover:border-danger-100 gap-2"
                              onClick={() => setIsRejectDialogOpen(true)}
                              disabled={processing}
                           >
                              {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <XCircle className="h-5 w-5" />} Revert & Deny
                           </Button>
                        </>
                     ) : selectedReq?.status === 'REJECTED' ? (
                        <>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center mr-4">
                              Decision logged. Revert if necessary:
                           </p>
                           <Button
                              className="rounded-2xl font-black h-14 px-12 shadow-2xl shadow-primary/30 gap-2 bg-slate-900 hover:bg-slate-800 transition-all"
                              onClick={handleApprove}
                              disabled={processing}
                           >
                              {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="h-5 w-5" />} Revert & Approve
                           </Button>
                        </>
                     ) : (
                        <>
                           <Button
                              variant="ghost"
                              className="rounded-2xl font-black h-14 px-10 text-danger-500 hover:bg-danger-50 transition-all border border-transparent hover:border-danger-100 gap-2"
                              onClick={() => setIsRejectDialogOpen(true)}
                              disabled={processing}
                           >
                              {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <X className="h-5 w-5" />} Deny Verification
                           </Button>
                           <Button
                              className="rounded-2xl font-black h-14 px-12 shadow-2xl shadow-primary/30 gap-2 bg-slate-900 hover:bg-slate-800 transition-all"
                              onClick={handleApprove}
                              disabled={processing}
                           >
                              {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="h-5 w-5" />} Validate & Grant Credentials
                           </Button>
                        </>
                     )}

                     <Separator orientation="vertical" className="h-10 mx-2 hidden md:block" />

                     <Button variant="outline" className="rounded-2xl font-black h-14 px-10 border-border text-slate-700" onClick={() => setIsPreviewOpen(false)}>
                        Close Archive
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>

         {/* REJECTION REASON DIALOG */}
         <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-xl-[2.5rem] p-8 border-none shadow-3xl">
               <DialogHeader className="text-center sm:text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mb-4">
                     <XCircle className="w-6 h-6" />
                  </div>
                  <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight uppercase">Deny Verification</DialogTitle>
                  <DialogDescription className="font-medium text-xs text-slate-500 uppercase tracking-widest mt-2">
                     Please provide a detailed administrative reason
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-6 py-4">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rejection Reason</label>
                     <Textarea
                        placeholder="e.g. Identity document watermarks are missing or inconsistent with registration data..."
                        className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-danger-500/10 focus:border-danger-500 resize-none font-medium text-sm p-5"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                     />
                     <div className="flex items-center gap-2 p-4 bg-azure-50 rounded-xl border border-azure-100/50">
                        <Info className="h-4 w-4 text-azure-500 shrink-0" />
                        <p className="text-[10px] font-medium text-azure-700 leading-relaxed uppercase tracking-tight">
                           This reason will be transmitted to {selectedReq?.userName} as an official platform notification.
                        </p>
                     </div>
                  </div>
               </div>

               <DialogFooter className="sm:justify-center gap-3 pt-4">
                  <Button variant="ghost" className="rounded-xl font-black h-12 px-6 text-slate-500 hover:text-slate-900" onClick={() => setIsRejectDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     className="rounded-xl font-black h-12 px-8 bg-danger-500 hover:bg-danger-600 text-white shadow-xl shadow-red-600/20"
                     onClick={handleReject}
                     disabled={processing || !rejectionReason.trim()}
                  >
                     {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Confirm Rejection'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
