'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Users, 
  Mail, 
  Calendar, 
  Check, 
  X, 
  Eye, 
  Download, 
  Copy, 
  ExternalLink, 
  MessageSquare,
  Loader2,
  FileText,
  BadgeCheck,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { apiClient } from '@/lib/api-client';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<string, { label: string, color: string }> = {
  'PENDING': { label: 'Pending', color: 'bg-amber-100 text-amber-600' },
  'VIEWED': { label: 'Reviewed', color: 'bg-blue-100 text-blue-600' },
  'SHORTLISTED': { label: 'Accepted', color: 'bg-emerald-100 text-emerald-600' },
  'REJECTED': { label: 'Rejected', color: 'bg-red-100 text-red-600' },
};

export default function ApplicationsInbox() {
  const { id } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [employerMessage, setEmployerMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  const fetchJobAndApplications = async () => {
    if (!id) return;
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobService.getJobDetails(id as string),
        jobService.getJobApplications(id as string),
      ]);

      if (jobRes.success) {
        setJob(jobRes.data);
      }
      if (appsRes.success) {
        setApplicants(appsRes.data?.content || []);
      }
    } catch (err: any) {
      setError('An error occurred while loading applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

  const handleStatusChange = async (appId: string, newStatus: string, message?: string) => {
    setActionLoading(true);
    try {
      const res = await jobService.updateApplicationStatus(id as string, appId, newStatus, message);
      if (res.success) {
        toast.success(`Application status updated to ${newStatus.toLowerCase()}`);
        setApplicants((prev: any[]) => prev.map((app: any) => app.id === appId ? { ...app, status: newStatus } : app));
        if (selectedApplicant && selectedApplicant.id === appId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus }));
        }
        if (newStatus === 'SHORTLISTED' || newStatus === 'REJECTED') {
          setSelectedApplicant(null);
          setEmployerMessage('');
          setShowMessageBox(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const handleDownload = async (url: string, filename: string) => {
    if (!url) return;
    
    const downloadToast = toast.loading('Preparing download...');
    try {
      const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`;
      
      const response = await fetch(fullUrl, {
        headers: apiClient.getHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please log in again.');
        throw new Error(`Download failed (${response.status})`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Download started', { id: downloadToast });
    } catch (err: any) {
      toast.error(err.message || 'Failed to download file', { id: downloadToast });
    }
  };

  const openModal = (app: any) => {
    setSelectedApplicant(app);
    setEmployerMessage('');
    setShowMessageBox(false);
    if (app.status === 'PENDING') {
      handleStatusChange(app.id, 'VIEWED');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing talent inbox...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">{error || 'Job post not found'}</h2>
        <Button variant="outline" className="rounded-2xl h-12 font-black" asChild>
           <Link href="/jobs/my-posts">Back to My Posts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="space-y-4">
            <Link href="/jobs/my-posts" className="inline-flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all group">
               <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
               Back to Listings
            </Link>
            <div className="space-y-1">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Talent Inbox</h1>
               <p className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Applicants for</span> {job.title}
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pipeline</p>
               <p className="text-2xl font-black text-slate-900">{applicants.length}</p>
            </div>
            <Separator orientation="vertical" className="h-12 hidden sm:block" />
            <Button className="rounded-2xl h-14 px-8 font-black bg-slate-900" asChild>
               <Link href={`/jobs/${job.id}`}>View Job Post <ExternalLink className="ml-2 h-4 w-4" /></Link>
            </Button>
         </div>
      </div>

      <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
         <CardContent className="p-0">
            {applicants.length > 0 ? (
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-100">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Applicant</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Email & Connectivity</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Applied</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Pipeline Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Review</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {applicants.map((app) => (
                        <TableRow key={app.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => openModal(app)}>
                           <TableCell className="py-6 px-8">
                              <div className="flex items-center gap-4">
                                 <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm group-hover:border-primary/20 transition-all">
                                    <AvatarImage src={app.avatarUrl} />
                                    <AvatarFallback className="bg-primary text-white font-black text-sm uppercase">
                                       {app.applicantName?.charAt(0)}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div className="space-y-0.5">
                                    <p className="font-black text-slate-900 text-base">{app.applicantName}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Developer Class</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-8">
                              <div className="flex flex-col gap-1">
                                 <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {app.applicantEmail}</span>
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Profile Verified</span>
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-8">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                 <Calendar className="h-4 w-4" /> {new Date(app.createdAt).toLocaleDateString()}
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-8">
                              <Badge className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none", statusConfig[app.status]?.color)}>
                                 {statusConfig[app.status]?.label || app.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="py-6 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                 <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 group-hover:border-primary/20" onClick={() => openModal(app)}>
                                    <Eye className="h-4 w-4" />
                                 </Button>
                                 <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 hover:bg-emerald-50 hover:text-emerald-600" onClick={() => { openModal(app); setShowMessageBox(true); }}>
                                    <Check className="h-4 w-4" />
                                 </Button>
                                 <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-600" onClick={() => handleStatusChange(app.id, 'REJECTED')}>
                                    <X className="h-4 w-4" />
                                 </Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            ) : (
               <div className="p-24 text-center space-y-6">
                  <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto border-2 border-dashed border-slate-100">
                     <Users className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-900">Waiting for Talent</h3>
                     <p className="text-slate-500 font-medium">No applications have been received for this post yet.</p>
                  </div>
               </div>
            )}
         </CardContent>
      </Card>

      <Dialog open={Boolean(selectedApplicant)} onOpenChange={(v) => !v && setSelectedApplicant(null)}>
         <DialogContent className="sm:max-w-4xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="sr-only">
               <DialogTitle>Application Review</DialogTitle>
               <DialogDescription>Detailed view of applicant information and documents.</DialogDescription>
            </DialogHeader>
            {selectedApplicant && (
               <>
                  <div className="bg-slate-900 p-10 text-white relative">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24" />
                      <div className="relative z-10 flex flex-row items-center justify-between">
                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                              <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-white/10 shadow-2xl">
                                 <AvatarImage src={selectedApplicant.avatarUrl} />
                                 <AvatarFallback className="bg-primary text-white text-2xl font-black">{selectedApplicant.applicantName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                 <h3 className="text-3xl font-black text-white tracking-tight">{selectedApplicant.applicantName}</h3>
                                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> {selectedApplicant.applicantEmail}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <Badge className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-2 border-none self-start", statusConfig[selectedApplicant.status]?.color)}>
                           {statusConfig[selectedApplicant.status]?.label}
                        </Badge>
                     </div>
                  </div>

                  <div className="p-10 space-y-10 overflow-y-auto no-scrollbar max-h-[60vh]">
                     <div className="grid grid-cols-1 gap-10">
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Documents</h4>
                              <div className="space-y-3">
                                 {selectedApplicant.resumeUrl && (
                                    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                                       <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase">PDF</div>
                                          <div className="space-y-0.5">
                                             <p className="font-black text-slate-900 text-sm">Professional Resume</p>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded on {new Date(selectedApplicant.createdAt).toLocaleDateString()}</p>
                                          </div>
                                       </div>
                                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleDownload(selectedApplicant.resumeUrl, `${selectedApplicant.applicantName}_Resume.pdf`)}>
                                          <Download className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 )}
                                 {selectedApplicant.coverLetterUrl && (
                                    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-all">
                                       <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase">DOC</div>
                                          <div className="space-y-0.5">
                                             <p className="font-black text-slate-900 text-sm">Cover Letter</p>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase">Supporting Document</p>
                                          </div>
                                       </div>
                                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleDownload(selectedApplicant.coverLetterUrl, `${selectedApplicant.applicantName}_CoverLetter.pdf`)}>
                                          <Download className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <Button variant="outline" className="w-full h-14 rounded-2xl font-black gap-2 border-slate-100" asChild>
                              <Link href={`/developers/${selectedApplicant.applicantProfileId}`} target="_blank">
                                 <ExternalLink className="h-4 w-4 text-primary" /> View Talent Profile
                              </Link>
                           </Button>
                        </div>


                     </div>

                     {showMessageBox && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 p-8 rounded-[3rem] bg-emerald-50 border-2 border-emerald-100">
                           <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-emerald-600" />
                              <h4 className="text-lg font-black text-emerald-900">Decision Message</h4>
                           </div>
                           <p className="text-sm font-medium text-emerald-700/70 mb-4">Include a personalized note for the applicant. They will be notified immediately.</p>
                           <Textarea 
                              placeholder="e.g. We were impressed by your portfolio! We'd love to schedule an introductory call..."
                              className="min-h-[120px] rounded-[1.5rem] border-emerald-200 bg-white focus-visible:ring-emerald-500/20"
                              value={employerMessage}
                              onChange={(e) => setEmployerMessage(e.target.value)}
                           />
                        </div>
                     )}
                  </div>

                  <DialogFooter className="bg-slate-50 p-10 flex flex-row justify-end gap-4 border-t border-slate-100">
                     {!showMessageBox ? (
                        <>
                           <Button variant="ghost" className="rounded-2xl font-black h-14 px-10 text-red-500 hover:bg-red-50" onClick={() => handleStatusChange(selectedApplicant.id, 'REJECTED')} disabled={actionLoading}>
                              {actionLoading ? <Loader2 className="animate-spin" /> : <X className="mr-2 h-5 w-5" />} Reject
                           </Button>
                           <Button className="rounded-2xl font-black h-14 px-12 bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20" onClick={() => setShowMessageBox(true)} disabled={selectedApplicant.status === 'SHORTLISTED'}>
                              <Check className="mr-2 h-5 w-5" /> Shortlist Talent
                           </Button>
                        </>
                     ) : (
                        <>
                           <Button variant="ghost" className="rounded-2xl font-black h-14 px-8" onClick={() => setShowMessageBox(false)}>Cancel</Button>
                           <Button className="rounded-2xl font-black h-14 px-12 bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20" onClick={() => handleStatusChange(selectedApplicant.id, 'SHORTLISTED', employerMessage)} disabled={actionLoading}>
                              {actionLoading ? <Loader2 className="animate-spin" /> : <BadgeCheck className="mr-2 h-5 w-5" />} Confirm & Notify
                           </Button>
                        </>
                     )}
                  </DialogFooter>
               </>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}
