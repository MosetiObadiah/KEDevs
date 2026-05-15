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
        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${API_URL}/api/v1/admin/verification/export?format=${formatType}`, {
           headers: {
              'Authorization': `Bearer ${token}`
           }
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

  const filteredRequests = requests.filter((req: any) => 
     req.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Top Bar Header - Removed per user direction */}
      <div className="h-4" />

      <div className="container mx-auto px-0 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
         {/* Left Filters Sidebar */}
         <aside className="lg:col-span-1 space-y-8 sticky top-24">
            <Card className="border-border/50 shadow-sm overflow-hidden">
               <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-primary" /> Live Queue Filters
                  </h3>
               </CardHeader>
               <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground uppercase">Search Applicants</label>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                           placeholder="Filter name..." 
                           className="pl-10 text-sm border-border/50 focus-visible:ring-primary/20 h-11 rounded-xl"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground uppercase">Classification</label>
                     <Select value={tab} onValueChange={setTab}>
                        <SelectTrigger className="border-border/50 focus:ring-primary/20 h-11 rounded-xl font-medium">
                           <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ALL" className="font-medium cursor-pointer">All Entities</SelectItem>
                           <SelectItem value="DEVELOPER" className="font-medium cursor-pointer">Developers Pool</SelectItem>
                           <SelectItem value="EMPLOYER" className="font-medium cursor-pointer">Employer Ingest</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                     <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending Backlog</span>
                        <span className="text-xs font-black text-slate-900">{filteredRequests.length} Entries</span>
                     </div>
                     <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (filteredRequests.length / 20) * 100)}%` }} />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </aside>

         {/* Main Grid Layout */}
         <main className="lg:col-span-3 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                    req.role === 'EMPLOYER' ? "bg-blue-600" : "bg-slate-900"
                                 )}>
                                    {req.userName.charAt(0)}
                                 </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-sm ring-2 ring-background">
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

                           <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full mb-6 shadow-none group-hover:bg-amber-500 group-hover:text-white transition-all">
                              {req.status?.replace('_', ' ')}
                           </Badge>

                           <div className="flex flex-wrap justify-center gap-1.5 mt-auto">
                              {req.idDocumentUrl && (
                                 <Badge variant="outline" className="text-[9px] py-0.5 px-2 font-bold bg-muted/30 border-border rounded-md text-slate-600">
                                    PRIMARY DOC
                                 </Badge>
                              )}
                              {req.certificateUrls?.length > 0 && (
                                 <Badge variant="outline" className="text-[9px] py-0.5 px-2 font-bold bg-muted/30 border-border rounded-md text-slate-600">
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
                  <div className="col-span-full py-24 text-center space-y-4 bg-card rounded-[3rem] border border-border/50 border-dashed">
                     <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-2">
                        <FilterX className="h-10 w-10 text-muted-foreground/50" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Clear Horizon</h3>
                        <p className="text-sm text-muted-foreground font-medium">Zero unresolved verification artifacts remain in queue.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* HISTORY LOG AND EXPORT SECTION */}
            <div className="space-y-6 pt-4">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-slate-900 font-black text-xl tracking-tight">
                        <History className="h-6 w-6 text-slate-400" />
                        <span>Verification Lifecycle History</span>
                     </div>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Complete historical register retrieved from system storage.</p>
                  </div>
                  
                  <div className="flex gap-3">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 gap-2"
                        onClick={() => handleExport('csv')}
                        disabled={!!isExporting}
                     >
                        {isExporting === 'csv' ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                        Export CSV
                     </Button>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 gap-2"
                        onClick={() => handleExport('pdf')}
                        disabled={!!isExporting}
                     >
                        {isExporting === 'pdf' ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <FileBarChart2 className="h-3.5 w-3.5" />}
                        Save as PDF
                     </Button>
                  </div>
               </div>

               <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
                  <Table>
                     <TableHeader className="bg-muted/40">
                        <TableRow className="border-border/50 hover:bg-transparent">
                           <TableHead className="font-bold text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Logged Timestamp</TableHead>
                           <TableHead className="font-bold text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Applicant Name</TableHead>
                           <TableHead className="font-bold text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Affiliation</TableHead>
                           <TableHead className="font-bold text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Decision</TableHead>
                           <TableHead className="font-bold text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {isHistoryLoading ? (
                           <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm font-medium">Acquiring log feed...</TableCell></TableRow>
                        ) : history.length === 0 ? (
                           <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm font-medium">No past verification records found.</TableCell></TableRow>
                        ) : history.map((req: any) => (
                           <TableRow key={req.requestId} className="border-border/50 group hover:bg-muted/30 transition-colors">
                              <TableCell className="py-4 px-6 text-xs text-muted-foreground font-medium">
                                 {format(new Date(req.createdAt), 'MMM dd, yyyy | HH:mm')}
                              </TableCell>
                              <TableCell className="py-4 px-6 font-bold text-slate-900">{req.userName}</TableCell>
                              <TableCell className="py-4 px-6">
                                 <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider py-0 h-5 border-border/60 text-slate-500">
                                    {req.role}
                                 </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                 <Badge className={cn(
                                    "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md shadow-none border-none",
                                    req.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-700" : 
                                    req.status === 'REJECTED' ? "bg-red-500/10 text-red-700" : 
                                    "bg-amber-500/10 text-amber-700"
                                 )}>
                                    {req.status?.replace('_', ' ')}
                                 </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 rounded-lg group-hover:bg-white transition-colors"
                                    onClick={() => { 
                                       setSelectedReq(req); 
                                       setPreviewUrl(req.idDocumentUrl || req.passportPhotoUrl);
                                       setIsPreviewOpen(true); 
                                    }}
                                 >
                                    <Eye className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
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
         <DialogContent className="sm:max-w-[90vw] h-[90vh] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
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
                     <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedReq?.role} RECORD</span>
                  </div>
               </DialogHeader>
               
               <Button variant="ghost" className="rounded-full h-12 w-12 p-0 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setIsPreviewOpen(false)}>
                  <X className="h-6 w-6" />
               </Button>
            </div>

            {/* Body Split Layout */}
            <div className="flex-1 flex overflow-hidden bg-slate-50/50">
               <div className="w-96 bg-white border-r border-slate-100 flex flex-col overflow-y-auto p-10 space-y-8 shrink-0">
                  <div className="space-y-2">
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Evidence Repository</h4>
                     <p className="text-xs font-medium text-slate-500">Click any artifact to project into High-Res viewport.</p>
                  </div>

                  <div className="space-y-3">
                     {selectedReq?.idDocumentUrl && (
                        <button 
                           className={cn(
                              "w-full text-left flex items-center justify-between p-5 rounded-[1.5rem] transition-all border",
                              previewUrl === selectedReq.idDocumentUrl ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                           )}
                           onClick={() => setPreviewUrl(selectedReq.idDocumentUrl)}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn("p-2.5 rounded-xl", previewUrl === selectedReq.idDocumentUrl ? "bg-white/20" : "bg-white shadow-sm")}>
                                 <FileText className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-black text-xs uppercase tracking-tight">
                                    {selectedReq.role === 'EMPLOYER' ? 'Incorporation Cert' : 'Primary ID'}
                                 </span>
                                 <span className={cn("text-[9px] font-bold uppercase tracking-widest", previewUrl === selectedReq.idDocumentUrl ? "text-white/70" : "text-slate-400")}>Mandatory Artifact</span>
                              </div>
                           </div>
                           <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-8 w-8 rounded-lg", previewUrl === selectedReq.idDocumentUrl ? "text-white hover:bg-white/10" : "text-slate-400 hover:bg-slate-100")}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 window.open(selectedReq.idDocumentUrl, '_blank');
                              }}
                           >
                              <Download className="h-4 w-4" />
                           </Button>
                        </button>
                     )}

                     {selectedReq?.passportPhotoUrl && (
                        <button 
                           className={cn(
                              "w-full text-left flex items-center justify-between p-5 rounded-[1.5rem] transition-all border",
                              previewUrl === selectedReq.passportPhotoUrl ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                           )}
                           onClick={() => setPreviewUrl(selectedReq.passportPhotoUrl)}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn("p-2.5 rounded-xl", previewUrl === selectedReq.passportPhotoUrl ? "bg-white/20" : "bg-white shadow-sm")}>
                                 <FileSearch className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-black text-xs uppercase tracking-tight">
                                    {selectedReq.role === 'EMPLOYER' ? 'KRA PIN Certificate' : 'Biometric Photo'}
                                 </span>
                                 <span className={cn("text-[9px] font-bold uppercase tracking-widest", previewUrl === selectedReq.passportPhotoUrl ? "text-white/70" : "text-slate-400")}>Authenticity Key</span>
                              </div>
                           </div>
                           <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-8 w-8 rounded-lg", previewUrl === selectedReq.passportPhotoUrl ? "text-white hover:bg-white/10" : "text-slate-400 hover:bg-slate-100")}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 window.open(selectedReq.passportPhotoUrl, '_blank');
                              }}
                           >
                              <Download className="h-4 w-4" />
                           </Button>
                        </button>
                     )}

                     {selectedReq?.certificateUrls?.map((cert: string, idx: number) => (
                        <button 
                           key={idx}
                           className={cn(
                              "w-full text-left flex items-center justify-between p-5 rounded-[1.5rem] transition-all border",
                              previewUrl === cert ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-900 border-slate-100 hover:border-primary/30"
                           )}
                           onClick={() => setPreviewUrl(cert)}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn("p-2.5 rounded-xl", previewUrl === cert ? "bg-white/20" : "bg-white shadow-sm")}>
                                 <FileText className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-black text-xs uppercase tracking-tight">
                                    {selectedReq.role === 'EMPLOYER' ? 'Single Business Permit' : `Compliance Cert #${idx + 1}`}
                                 </span>
                                 <span className={cn("text-[9px] font-bold uppercase tracking-widest", previewUrl === cert ? "text-white/70" : "text-slate-400")}>Supporting Clause</span>
                              </div>
                           </div>
                           <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-8 w-8 rounded-lg", previewUrl === cert ? "text-white hover:bg-white/10" : "text-slate-400 hover:bg-slate-100")}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 window.open(cert, '_blank');
                              }}
                           >
                              <Download className="h-4 w-4" />
                           </Button>
                        </button>
                     ))}
                  </div>

               </div>

               {/* Right Pane */}
               <div className="flex-1 p-12 flex flex-col">
                  <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-inner shadow-slate-100 overflow-hidden relative flex items-center justify-center">
                     {previewUrl ? (
                        previewUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                           <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center bg-slate-800/5 backdrop-blur-sm">
                              <img 
                                 src={previewUrl} 
                                 alt="Immersive View" 
                                 className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" 
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

            {/* Action Footer - Only show Approve/Reject if Pending */}
            <div className="bg-white border-t border-slate-100 px-12 py-8 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-900 shadow-none font-black text-[10px] px-3 py-1.5 rounded-lg tracking-widest uppercase">
                     AUDIT RECORD: {selectedReq?.status}
                  </Badge>
               </div>
               <div className="flex gap-4">
                  {selectedReq?.status !== 'APPROVED' ? (
                     <>
                        <Button variant="ghost" className="rounded-2xl font-black h-14 px-10 text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 gap-2" onClick={() => setIsRejectDialogOpen(true)} disabled={processing}>
                           {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <X className="h-5 w-5" />} Deny Verification
                        </Button>
                        <Button className="rounded-2xl font-black h-14 px-12 shadow-2xl shadow-primary/30 gap-2 bg-slate-900 hover:bg-slate-800 transition-all" onClick={handleApprove} disabled={processing}>
                           {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="h-5 w-5" />} Validate & Grant Credentials
                        </Button>
                     </>
                  ) : (
                     <Button variant="outline" className="rounded-2xl font-black h-14 px-10 border-border text-slate-600" onClick={() => setIsPreviewOpen(false)}>
                        Close Archive
                     </Button>
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* REJECTION REASON DIALOG */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
         <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-none shadow-3xl">
            <DialogHeader className="text-center sm:text-center pb-4">
               <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6" />
               </div>
               <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight uppercase">Deny Verification</DialogTitle>
               <DialogDescription className="font-bold text-xs text-slate-500 uppercase tracking-widest mt-2">
                  Please provide a detailed administrative reason
               </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejection Reason</label>
                  <Textarea 
                     placeholder="e.g. Identity document watermarks are missing or inconsistent with registration data..."
                     className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-red-500/10 focus:border-red-500 resize-none font-medium text-sm p-5"
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                     <Info className="h-4 w-4 text-amber-600 shrink-0" />
                     <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                        This reason will be transmitted to {selectedReq?.userName} as an official platform notification.
                     </p>
                  </div>
               </div>
            </div>

            <DialogFooter className="sm:justify-center gap-3 pt-4">
               <Button variant="ghost" className="rounded-xl font-black h-12 px-6 text-slate-400 hover:text-slate-900" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
               </Button>
               <Button 
                  className="rounded-xl font-black h-12 px-8 bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20"
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
