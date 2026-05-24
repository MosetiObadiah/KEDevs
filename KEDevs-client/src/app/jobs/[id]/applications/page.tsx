'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
   ArrowRight,
   FileSpreadsheet
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { apiClient } from '@/lib/api-client';
import { cn, formatDateString, formatTimeString } from '@/lib/utils';
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
import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetDescription,
   SheetFooter,
} from "@/components/ui/sheet";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<string, { label: string, color: string }> = {
   'PENDING': { label: 'Pending', color: 'bg-warning-50 text-warning-600' },
   'VIEWED': { label: 'Under Review', color: 'bg-warning-50 text-warning-600' },
   'SHORTLISTED': { label: 'Shortlisted', color: 'bg-success-50 text-success-600' },
   'REJECTED': { label: 'Rejected', color: 'bg-danger-50 text-danger-600' },
};

export default function ApplicationsInbox() {
   const { id } = useParams();
   const router = useRouter();
   const searchParams = useSearchParams();
   const searchTerm = searchParams.get('search') || '';

   const [job, setJob] = useState<any>(null);
   const [applicants, setApplicants] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
   const [actionLoading, setActionLoading] = useState(false);
   const [employerMessage, setEmployerMessage] = useState('');
   const [decisionType, setDecisionType] = useState<'SHORTLISTED' | 'REJECTED' | null>(null);

   const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   const [isExporting, setIsExporting] = useState(false);

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
            toast.success(`Application status updated to ${newStatus === 'SHORTLISTED' ? 'shortlisted' : newStatus.toLowerCase()}`);
            setApplicants((prev: any[]) => prev.map((app: any) => app.id === appId ? { ...app, status: newStatus, employerMessage: message } : app));
            if (selectedApplicant && selectedApplicant.id === appId) {
               setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus, employerMessage: message }));
            }
            setSelectedApplicant(null);
            setEmployerMessage('');
            setDecisionType(null);
         }
      } catch (err: any) {
         toast.error(err.message || 'Failed to update status.');
      } finally {
         setActionLoading(false);
      }
   };

   const handleDownload = async (url: string, filename: string) => {
      if (!url) return;

      const downloadToast = toast.loading('Preparing download...');
      try {
         const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`;

         const response = await fetch(fullUrl, {
            headers: apiClient.getHeaders(),
            credentials: 'include',
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

   const openModal = (app: any, initialDecision: 'SHORTLISTED' | 'REJECTED' | null = null) => {
      setSelectedApplicant(app);
      setEmployerMessage('');
      setDecisionType(initialDecision);
      if (app.status === 'PENDING') {
         handleStatusChange(app.id, 'VIEWED');
      }
   };

   const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return formatDateString(date);
   };

    const handleExport = async (format: 'csv' | 'pdf') => {
       setIsExporting(true);
       try {
          if (format === 'pdf') {
             const { jsPDF } = await import('jspdf');
             const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
             });

             const drawHeader = (pageNum: number) => {
                // Header Strip
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(16, 185, 129); // emerald-500 KEDevs Brand
                doc.text('KEDevs', 15, 18);

                doc.setFontSize(13);
                doc.setTextColor(15, 23, 42); // slate-900
                doc.text('APPLICATIONS INBOX REPORT', 105, 18, { align: 'center' });

                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139); // slate-500
                const exportDate = formatDateString(new Date()) + ' ' + formatTimeString(new Date());
                doc.text(`EXPORTED: ${exportDate}`, 195, 15, { align: 'right' });
                doc.text(`PAGE: ${pageNum}`, 195, 20, { align: 'right' });

                // Border bottom of header
                doc.setDrawColor(15, 23, 42); // slate-900
                doc.setLineWidth(0.5);
                doc.line(15, 24, 195, 24);
             };

             const drawFooter = (pageNum: number) => {
                const footerY = 278;
                // Divider
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.setLineWidth(0.3);
                doc.line(15, footerY - 4, 195, footerY - 4);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(37, 99, 235); // blue-600
                doc.text("KEDevs - Kenya's Premier Tech Talent Network", 105, footerY, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139); // slate-500
                doc.text("© 2026 KEDevs. This report is system generated and contains up-to-date market data.", 105, footerY + 4, { align: 'center' });

                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text("VERIFIED TECH ECOSYSTEM REPORT", 105, footerY + 8, { align: 'center' });
             };

             let pageNum = 1;
             drawHeader(pageNum);

             // Active Filters Metadata (Meta Bar)
             doc.setFillColor(248, 250, 252); // slate-50
             doc.setDrawColor(226, 232, 240); // slate-200
             doc.setLineWidth(0.3);
             doc.roundedRect(15, 28, 180, 22, 3, 3, 'FD');

             doc.setFont('helvetica', 'bold');
             doc.setFontSize(8);
             doc.setTextColor(71, 85, 105); // slate-600
             doc.text("SEARCH CONTEXT & FILTERS", 20, 34);

             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);
             doc.setTextColor(15, 23, 42); // slate-900
             const filterName = activeFilter === 'ALL' ? 'All Candidates' :
                                activeFilter === 'PENDING' ? 'Pending' :
                                activeFilter === 'ACCEPTED' ? 'Shortlisted' : 'Rejected';
             const periodText = `${startDate ? formatDate(startDate) : 'Beginning'} to ${endDate ? formatDate(endDate) : 'Present'}`;
             doc.text(`Pipeline Status: ${filterName}  |  Period: ${periodText}  |  Position: ${job.title || ''}`, 20, 39);

             doc.setFontSize(8);
             doc.setTextColor(100, 116, 139); // slate-500
             doc.text(`Found `, 20, 44);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(15, 23, 42);
             doc.text(`${filteredApplicants.length}`, 30, 44);
             doc.setFont('helvetica', 'normal');
             doc.setTextColor(100, 116, 139);
             doc.text(` applicants matching these criteria.`, 34, 44);

             // Table Header
             const drawTableHeader = (startY: number) => {
                doc.setFillColor(241, 245, 249); // slate-100
                doc.rect(15, startY, 180, 8, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(71, 85, 105); // slate-600
                doc.text('APPLICANT', 18, startY + 5.5);
                doc.text('EMAIL & DOCUMENTS', 60, startY + 5.5);
                doc.text('APPLIED', 110, startY + 5.5);
                doc.text('STATUS', 138, startY + 5.5);
                doc.text('FEEDBACK', 160, startY + 5.5);

                doc.setDrawColor(226, 232, 240); // slate-200
                doc.setLineWidth(0.3);
                doc.line(15, startY + 8, 195, startY + 8);
             };

             let y = 56;
             drawTableHeader(y);
             y += 14;

             // Rows
             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);

             filteredApplicants.forEach((app) => {
                if (y > 265) {
                   drawFooter(pageNum);
                   doc.addPage();
                   pageNum++;
                   y = 28;
                   drawHeader(pageNum);
                   drawTableHeader(y);
                   y += 14;
                }

                // Applicant details
                const name = app.applicantName || 'Unknown';
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42); // slate-900
                doc.text(name.length > 20 ? name.substring(0, 18) + '..' : name, 18, y);

                // Email & docs details
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105); // slate-600
                const email = app.applicantEmail || '';
                doc.text(email.length > 24 ? email.substring(0, 22) + '..' : email, 60, y);

                // Check docs status
                let docsText = '';
                if (app.resumeUrl) docsText += 'Resume';
                if (app.coverLetterUrl) docsText += (docsText ? ' + Cover Letter' : 'Cover Letter');
                if (docsText) {
                   doc.setFontSize(7);
                   doc.setTextColor(100, 116, 139);
                   doc.text(`(${docsText})`, 60, y + 4);
                   doc.setFontSize(9);
                }

                // Date
                doc.setTextColor(71, 85, 105);
                doc.text(formatDate(app.createdAt), 110, y);

                // Status
                const statusLabel = statusConfig[app.status]?.label || app.status;
                doc.setFont('helvetica', 'bold');
                if (app.status === 'SHORTLISTED') {
                   doc.setTextColor(16, 124, 65); // emerald-600
                } else if (app.status === 'REJECTED') {
                   doc.setTextColor(220, 38, 38); // red-600
                } else {
                   doc.setTextColor(217, 119, 6); // amber-600
                }
                doc.text(statusLabel, 138, y);

                // Feedback
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                const feedback = app.employerMessage || '-';
                doc.text(feedback.length > 18 ? feedback.substring(0, 16) + '..' : feedback, 160, y);

                // Divider line
                doc.setDrawColor(241, 245, 249); // slate-50
                doc.setLineWidth(0.2);
                doc.line(15, y + 6, 195, y + 6);

                y += 10;
             });

             drawFooter(pageNum);

             doc.save(`applicants_report_${new Date().toISOString().split('T')[0]}.pdf`);
             toast.success('PDF Report generated successfully');
             return;
          }

          const headers = ['ApplicantName', 'Email', 'AppliedDate', 'Status', 'EmployerFeedback'];
          const rows = filteredApplicants.map(app => [
             `"${app.applicantName || ''}"`,
             `"${app.applicantEmail || ''}"`,
             `"${formatDate(app.createdAt)}"`,
             `"${statusConfig[app.status]?.label || app.status}"`,
             `"${(app.employerMessage || '').replace(/"/g, '""')}"`
          ].join(','));

          const csvContent = [headers.join(','), ...rows].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `applicants_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          toast.success('CSV Exported successfully');
       } catch (err) {
          console.error('Export failed', err);
          toast.error('Export failed. Please try again.');
       } finally {
          setIsExporting(false);
       }
    };

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Accessing applications inbox...</p>
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

   // Filter and Sort Pipeline Applicants (Status + Creation Date Range)
   const filteredApplicants = applicants.filter(app => {
      // Filter by status tab
      if (activeFilter === 'PENDING') {
         if (app.status !== 'PENDING' && app.status !== 'VIEWED') return false;
      } else if (activeFilter === 'ACCEPTED') {
         if (app.status !== 'SHORTLISTED') return false;
      } else if (activeFilter === 'REJECTED') {
         if (app.status !== 'REJECTED') return false;
      }

      // Filter by date range (createdAt)
      if (app.createdAt) {
         const appDate = new Date(app.createdAt);
         appDate.setHours(0, 0, 0, 0); // Ignore exact hours for precise date comparison

         if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (appDate < start) return false;
         }
         if (endDate) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            if (appDate > end) return false;
         }
      }

      // Filter by search term (applicantName, applicantEmail)
      if (searchTerm.trim()) {
         const term = searchTerm.toLowerCase();
         const nameMatches = app.applicantName?.toLowerCase().includes(term);
         const emailMatches = app.applicantEmail?.toLowerCase().includes(term);
         if (!nameMatches && !emailMatches) return false;
      }

      return true;
   }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

   const allCount = applicants.length;
   const pendingCount = applicants.filter(a => a.status === 'PENDING' || a.status === 'VIEWED').length;
   const acceptedCount = applicants.filter(a => a.status === 'SHORTLISTED').length;
   const rejectedCount = applicants.filter(a => a.status === 'REJECTED').length;

   const isMessageValid = employerMessage.trim().length >= 20;

   return (
      <div className="container mx-auto px-4 py-20 max-w-6xl animate-in fade-in duration-700">
         <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 print:hidden">
            <div className="space-y-4">
               <Link href="/jobs/my-posts" className="inline-flex items-center text-slate-500 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all group">
                  <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Listings
               </Link>
               <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Applications Inbox</h1>
                  <p className="text-lg font-medium text-primary flex items-center gap-2">
                     <span className="text-slate-500 font-medium">Applicants for</span> {job.title}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Pipeline</p>
                  <p className="text-2xl font-black text-slate-900">{applicants.length}</p>
               </div>
               <Separator orientation="vertical" className="h-12 hidden sm:block" />

               {/* Export Dropdown Menu (Style matches /jobs) */}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="rounded-2xl h-14 px-6 font-black border-slate-200/60 hover:bg-slate-50 transition-all" disabled={isExporting}>
                        <Download className="mr-2 h-4 w-4 text-primary" />
                        {isExporting ? 'Exporting...' : 'Export'}
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-xl bg-white">
                     <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs uppercase tracking-widest text-slate-700 hover:text-slate-900 gap-2 p-3">
                        <FileSpreadsheet className="h-4 w-4 text-cyan-600" /> Download as CSV
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs uppercase tracking-widest text-slate-700 hover:text-slate-900 gap-2 p-3">
                        <FileText className="h-4 w-4 text-primary" /> Print / Save as PDF
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button className="rounded-2xl h-14 px-8 font-black bg-slate-900" asChild>
                  <Link href={`/jobs/${job.id}`}>View Job Post <ExternalLink className="ml-2 h-4 w-4" /></Link>
               </Button>
            </div>
         </div>

         {/* Print Header (Only visible during PDF Print) */}
         <div className="hidden print:block mb-8 border-b-2 pb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Applications Inbox Report</h1>
            <p className="text-md font-medium text-slate-700 mt-1">Applicants for: {job.title} at {job.companyName}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-widest">
               Generated on: {formatDateString(new Date())} {startDate && ` | From: ${formatDate(startDate)}`} {endDate && ` | To: ${formatDate(endDate)}`}
            </p>
         </div>

         {/* Filter and Sort Bar */}
         <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
            <div className="flex flex-wrap gap-2">
               {[
                  { id: 'ALL', label: 'All', count: allCount },
                  { id: 'PENDING', label: 'Pending', count: pendingCount },
                  { id: 'ACCEPTED', label: 'Shortlisted', count: acceptedCount },
                  { id: 'REJECTED', label: 'Rejected', count: rejectedCount }
               ].map(tab => (
                  <Button
                     key={tab.id}
                     variant={activeFilter === tab.id ? 'default' : 'outline'}
                     className={cn(
                        "h-10 px-4 rounded-xl font-medium text-xs gap-2 transition-all",
                        activeFilter === tab.id
                           ? "bg-primary text-white shadow-lg shadow-primary/20"
                           : "border-slate-100 hover:bg-slate-50 text-slate-700"
                     )}
                     onClick={() => setActiveFilter(tab.id as any)}
                  >
                     {tab.label}
                     <Badge className={cn(
                        "h-5 min-w-5 px-1 flex items-center justify-center rounded-2xl font-black text-[9px]",
                        activeFilter === tab.id ? "bg-white text-primary" : "bg-slate-100 text-slate-700"
                     )}>
                        {tab.count}
                     </Badge>
                  </Button>
               ))}
            </div>

            {/* Date Range Period Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-2">
                  <Calendar className="h-4 w-4 text-primary" /> Period:
               </span>
               <div className="flex flex-wrap items-center gap-2">
                  <input 
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="h-10 px-3 rounded-xl border border-slate-200/60 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">to</span>
                  <input 
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="h-10 px-3 rounded-xl border border-slate-200/60 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  {(startDate || endDate) && (
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-[10px] font-black uppercase text-danger-500 hover:bg-danger-50 rounded-xl transition-all"
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                     >
                        Clear Period
                     </Button>
                  )}
               </div>
            </div>
         </div>

         <Card className="rounded-xl-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white print:shadow-none print:border-none">
            <CardContent className="p-0">
               {filteredApplicants.length > 0 ? (
                  <Table>
                     <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Applicant</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Email & Documents</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Applied</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Pipeline Status</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8 text-right print:hidden">Review</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filteredApplicants.map((app) => {
                           return (
                              <TableRow key={app.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => openModal(app)}>
                                 <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                       <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm group-hover:border-primary/20 transition-all print:border-slate-200">
                                          <AvatarImage src={app.avatarUrl} />
                                          <AvatarFallback className="bg-primary text-white font-black text-sm uppercase">
                                             {app.applicantName?.charAt(0)}
                                          </AvatarFallback>
                                       </Avatar>
                                       <div className="space-y-0.5">
                                          <Link
                                             href={`/developers/${app.applicantProfileId}`}
                                             target="_blank"
                                             className="font-black text-slate-900 text-base hover:text-primary transition-colors capitalize"
                                             onClick={(e) => e.stopPropagation()}
                                          >
                                             {app.applicantName}
                                          </Link>
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-6 px-8">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {app.applicantEmail}</span>

                                       {/* Direct Download Badges */}
                                       <div className="flex gap-2 mt-1 print:hidden">
                                          {app.resumeUrl && (
                                             <Button
                                                size="sm"
                                                variant="ghost"
                                                title="Download Resume"
                                                className="h-6 px-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-primary bg-slate-50 hover:bg-slate-100 rounded-xl gap-1 shadow-sm"
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleDownload(app.resumeUrl, `${app.applicantName}_Resume.pdf`);
                                                }}
                                             >
                                                <FileText className="h-3 w-3 text-primary" /> Resume
                                             </Button>
                                          )}
                                          {app.coverLetterUrl && (
                                             <Button
                                                size="sm"
                                                variant="ghost"
                                                title="Download Cover Letter"
                                                className="h-6 px-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-cyan-600 bg-slate-50 hover:bg-slate-100 rounded-xl gap-1 shadow-sm"
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleDownload(app.coverLetterUrl, `${app.applicantName}_CoverLetter.pdf`);
                                                }}
                                             >
                                                <FileText className="h-3 w-3 text-cyan-600" /> Cover Letter
                                             </Button>
                                          )}
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                       <Calendar className="h-4 w-4" /> {formatDate(app.createdAt)}
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-6 px-8">
                                    <Badge className={cn("rounded-xl font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none", statusConfig[app.status]?.color)}>
                                       {statusConfig[app.status]?.label || app.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="py-6 px-8 text-right print:hidden" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          title="View Details"
                                          className="h-10 w-10 p-0 rounded-xl border-slate-100 group-hover:border-primary/20"
                                          onClick={() => openModal(app)}
                                       >
                                          <Eye className="h-4 w-4" />
                                       </Button>
                                       
                                       {/* Shortlist/Accept Button - Enabled unless already Shortlisted */}
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          title={app.status === 'SHORTLISTED' ? "Already Shortlisted" : "Shortlist Candidate"}
                                          disabled={app.status === 'SHORTLISTED'}
                                          className={cn(
                                             "h-10 w-10 p-0 rounded-xl border-slate-100 transition-all",
                                             app.status === 'SHORTLISTED' ? "opacity-30 cursor-not-allowed bg-slate-50 text-slate-500" : "hover:bg-cyan-50 hover:text-cyan-600"
                                          )}
                                          onClick={() => openModal(app, 'SHORTLISTED')}
                                       >
                                          <Check className="h-4 w-4" />
                                       </Button>

                                       {/* Reject Button - Enabled unless already Rejected */}
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          title={app.status === 'REJECTED' ? "Already Rejected" : "Reject Candidate"}
                                          disabled={app.status === 'REJECTED'}
                                          className={cn(
                                             "h-10 w-10 p-0 rounded-xl border-slate-100 transition-all",
                                             app.status === 'REJECTED' ? "opacity-30 cursor-not-allowed bg-slate-50 text-slate-500" : "hover:bg-danger-50 hover:text-danger-500"
                                          )}
                                          onClick={() => openModal(app, 'REJECTED')}
                                       >
                                          <X className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               ) : (
                  <div className="p-24 text-center space-y-6">
                     <div className="h-20 w-20 bg-slate-50 rounded-xl-[2rem] flex items-center justify-center text-slate-200 mx-auto border-2 border-dashed border-slate-100">
                        <Users className="h-10 w-10" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900">No Applicants Found</h3>
                        <p className="text-slate-500 font-medium">There are no candidates in this stage of the pipeline.</p>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

          {/* Side Detail Sheet */}
          <Sheet open={Boolean(selectedApplicant)} onOpenChange={(v) => !v && setSelectedApplicant(null)}>
             <SheetContent className="sm:max-w-lg border-none p-0 overflow-hidden flex flex-col h-full bg-white">
                <SheetHeader className="sr-only">
                   <SheetTitle>Application Review</SheetTitle>
                   <SheetDescription>Detailed view of applicant information and documents.</SheetDescription>
                </SheetHeader>
                {selectedApplicant && (
                   <>
                      <div className="bg-navy-900 p-8 text-white relative shrink-0">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-azure-500/10 rounded-full blur-2xl" />
                         <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <Avatar className="h-14 w-14 rounded-xl border border-white/10 shadow-lg">
                                  <AvatarImage src={selectedApplicant.avatarUrl} />
                                  <AvatarFallback className="bg-azure-500 text-white font-medium text-lg uppercase flex items-center justify-center">
                                     {selectedApplicant.applicantName?.charAt(0)}
                                  </AvatarFallback>
                               </Avatar>
                               <div className="space-y-0.5">
                                  <h3 className="text-xl font-medium text-white tracking-tight capitalize">{selectedApplicant.applicantName}</h3>
                                  <p className="text-slate-400 font-medium text-xs flex items-center gap-1">
                                     <Mail className="h-3 w-3 text-azure-400" /> {selectedApplicant.applicantEmail}
                                  </p>
                               </div>
                            </div>
                            <Badge className={cn("rounded-lg font-medium text-[10px] uppercase tracking-wider px-2.5 py-1 border-none shrink-0", statusConfig[selectedApplicant.status]?.color)}>
                               {statusConfig[selectedApplicant.status]?.label}
                            </Badge>
                         </div>
                      </div>

                      <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Application Documents</h4>
                            <div className="space-y-3">
                               {selectedApplicant.resumeUrl && (
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 group hover:border-azure-200 transition-all shadow-sm">
                                     <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-azure-500/10 rounded-lg flex items-center justify-center text-azure-500 font-medium text-xs">PDF</div>
                                        <div className="space-y-0.5">
                                           <p className="font-medium text-slate-800 text-sm">Professional Resume</p>
                                           <p className="text-[10px] font-medium text-slate-400">Uploaded {formatDate(selectedApplicant.createdAt)}</p>
                                        </div>
                                     </div>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => handleDownload(selectedApplicant.resumeUrl, `${selectedApplicant.applicantName}_Resume.pdf`)}>
                                        <Download className="h-4 w-4 text-slate-500" />
                                     </Button>
                                  </div>
                               )}
                               {selectedApplicant.coverLetterUrl && (
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 group hover:border-azure-200 transition-all shadow-sm">
                                     <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500 font-medium text-xs">DOC</div>
                                        <div className="space-y-0.5">
                                           <p className="font-medium text-slate-800 text-sm">Cover Letter</p>
                                           <p className="text-[10px] font-medium text-slate-400">Supporting Document</p>
                                        </div>
                                     </div>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => handleDownload(selectedApplicant.coverLetterUrl, `${selectedApplicant.applicantName}_CoverLetter.pdf`)}>
                                        <Download className="h-4 w-4 text-slate-500" />
                                     </Button>
                                  </div>
                               )}
                            </div>
                         </div>

                         {selectedApplicant.employerMessage && (
                            <div className="p-5 rounded-xl bg-white border border-slate-100 space-y-2.5 shadow-sm">
                               <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Feedback Message Sent</h4>
                               <p className="text-xs font-medium text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-100 italic">
                                  "{selectedApplicant.employerMessage}"
                               </p>
                            </div>
                         )}

                         <Button variant="outline" className="w-full h-12 rounded-xl font-medium gap-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" asChild>
                            <Link href={`/developers/${selectedApplicant.applicantProfileId}`} target="_blank">
                               <ExternalLink className="h-4 w-4 text-azure-500" /> View Talent Profile
                            </Link>
                         </Button>
                      </div>

                      <SheetFooter className="bg-slate-50 p-6 flex flex-row items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                         {(selectedApplicant.status === 'PENDING' || selectedApplicant.status === 'VIEWED' || selectedApplicant.status === 'SHORTLISTED') && (
                            <Button variant="ghost" className="rounded-xl font-medium h-11 px-6 text-danger-600 hover:bg-danger-50 flex-1 sm:flex-initial" onClick={() => setDecisionType('REJECTED')} disabled={actionLoading}>
                               <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                         )}
                         {(selectedApplicant.status === 'PENDING' || selectedApplicant.status === 'VIEWED' || selectedApplicant.status === 'REJECTED') && (
                            <Button className="rounded-xl font-medium h-11 px-8 bg-azure-500 hover:bg-azure-600 text-white border-none flex-1 sm:flex-initial" onClick={() => setDecisionType('SHORTLISTED')}>
                               <Check className="mr-2 h-4 w-4" /> Shortlist
                            </Button>
                         )}
                         {(selectedApplicant.status === 'SHORTLISTED' || selectedApplicant.status === 'REJECTED') && (
                            <Button variant="ghost" className="rounded-xl font-medium h-11 px-6 flex-1 sm:flex-initial" onClick={() => setSelectedApplicant(null)}>Close Review</Button>
                         )}
                      </SheetFooter>
                   </>
                )}
             </SheetContent>
          </Sheet>

          {/* Feedback Modal Dialog */}
          <Dialog open={decisionType !== null} onOpenChange={(v) => { if (!v) { setDecisionType(null); setEmployerMessage(''); } }}>
             <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 bg-white border border-slate-100 shadow-2xl">
                <DialogHeader>
                   <DialogTitle className="text-xl font-medium flex items-center gap-2.5 text-navy-900">
                      <div className={cn(
                         "h-9 w-9 rounded-lg flex items-center justify-center",
                         decisionType === 'SHORTLISTED' ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
                      )}>
                         {decisionType === 'SHORTLISTED' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </div>
                      {decisionType === 'SHORTLISTED' ? "Shortlist Candidate" : "Reject Candidate"}
                   </DialogTitle>
                   <DialogDescription className="font-medium text-slate-500 text-xs">
                      {decisionType === 'SHORTLISTED' 
                         ? "Provide instructions or next steps for the applicant. This message is mandatory."
                         : "Provide constructive feedback on why the application was rejected. This message is mandatory."}
                   </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3">
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wider text-slate-400">
                         <span>Feedback Message</span>
                         <span className={cn(isMessageValid ? "text-success-600 font-bold" : "text-danger-600")}>
                            {employerMessage.trim().length} chars (min 20)
                         </span>
                      </div>
                      <Textarea
                         placeholder={decisionType === 'SHORTLISTED'
                            ? "We were impressed by your profile! We'd love to schedule a technical chat..."
                            : "Thank you for your time. Unfortunately, we went with a candidate whose experience more closely aligns..."
                         }
                         className={cn(
                            "min-h-[120px] rounded-xl border border-slate-200 resize-none font-medium text-sm p-3 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-50/50",
                            decisionType === 'SHORTLISTED' ? "focus-visible:ring-success-500" : "focus-visible:ring-danger-500"
                         )}
                         value={employerMessage}
                         onChange={(e) => setEmployerMessage(e.target.value)}
                      />
                   </div>
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                   <Button variant="ghost" className="rounded-xl font-medium h-10 px-4" onClick={() => { setDecisionType(null); setEmployerMessage(''); }}>
                      Cancel
                   </Button>
                   <Button
                      className={cn(
                         "rounded-xl font-medium px-6 text-white border-none h-10",
                         decisionType === 'SHORTLISTED'
                            ? "bg-success-600 hover:bg-success-700"
                            : "bg-danger-600 hover:bg-danger-700"
                      )}
                      onClick={() => handleStatusChange(selectedApplicant.id, decisionType!, employerMessage)}
                      disabled={actionLoading || !isMessageValid}
                   >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-1.5 h-4 w-4" />} Confirm & Notify
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
      </div>
   );
}
