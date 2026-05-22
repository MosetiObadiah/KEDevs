'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Building2,
  MoreVertical,
  Lock,
  Eye,
  ArrowRight,
  ExternalLink,
  Pin,
  TrendingUp,
  Search,
  FilterX,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { cn, formatDateString } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PinJobDialog from '@/components/jobs/PinJobDialog';

export default function MyJobPosts() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchTerm = searchParams?.get('search') || '';

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pinning state
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{id: string, title: string} | null>(null);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  const filteredPosts = posts.filter(post => {
    // Search Term Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const titleMatch = post.title?.toLowerCase().includes(term);
      const companyMatch = post.companyName?.toLowerCase().includes(term);
      if (!titleMatch && !companyMatch) return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      const isExpired = post.applicationDeadline && new Date(post.applicationDeadline) < new Date();
      if (statusFilter === 'ACTIVE' && (post.status !== 'OPEN' || isExpired)) return false;
      if (statusFilter === 'CLOSED' && (post.status !== 'CLOSED' || isExpired)) return false;
      if (statusFilter === 'EXPIRED' && !isExpired) return false;
      if (statusFilter === 'REMOVED' && post.status !== 'REMOVED') return false;
    }

    // Job Type Filter
    if (typeFilter !== 'ALL') {
      if (post.jobType !== typeFilter) return false;
    }

    // Date Filter
    if (dateFilter !== 'ALL') {
      const postDate = new Date(post.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - postDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'TODAY' && diffDays > 1) return false;
      if (dateFilter === 'WEEK' && diffDays > 7) return false;
      if (dateFilter === 'MONTH' && diffDays > 30) return false;
    }

    return true;
  });

  const [isExporting, setIsExporting] = useState(false);

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

        // Header Strip
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129); // emerald-500 KEDevs Brand
        doc.text('KEDevs', 15, 18);

        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text('MY JOB POSTINGS REPORT', 105, 18, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-505
        const exportDate = formatDateString(new Date());
        doc.text(`EXPORTED: ${exportDate}`, 195, 18, { align: 'right' });

        // Divider line
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.5);
        doc.line(15, 24, 195, 24);

        // Active Filters Metadata block
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.roundedRect(15, 28, 180, 18, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("FILTERS CONTEXT", 20, 33);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`Search: ${searchTerm || 'None'}  |  Status: ${statusFilter}  |  Type: ${typeFilter}  |  Date range: ${dateFilter}`, 20, 39);

        // Table Header
        let y = 56;
        doc.setFillColor(241, 245, 249);
        doc.rect(15, y, 180, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('JOB TITLE', 18, y + 5.5);
        doc.text('COMPANY / POSTER', 70, y + 5.5);
        doc.text('JOB TYPE / WORK TYPE', 120, y + 5.5);
        doc.text('STATUS', 170, y + 5.5);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(15, y + 8, 195, y + 8);
        
        y += 14;

        filteredPosts.forEach((post) => {
          if (y > 270) {
            doc.addPage();
            y = 25;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const title = post.title || '';
          doc.text(title.length > 25 ? title.substring(0, 23) + '..' : title, 18, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const company = post.isPeerSourced || post.postedByRole !== 'EMPLOYER' ? (post.postedByName || 'Community') : post.companyName;
          doc.text(company.length > 25 ? company.substring(0, 23) + '..' : company, 70, y);

          const typeText = `${formatJobType(post.jobType)} (${post.workType})`;
          doc.text(typeText, 120, y);

          const isExpired = post.applicationDeadline && new Date(post.applicationDeadline) < new Date();
          const statusText = post.status === 'REMOVED' ? 'REMOVED' : isExpired ? 'EXPIRED' : post.status === 'OPEN' ? 'ACTIVE' : 'CLOSED';
          doc.text(statusText, 170, y);

          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(15, y + 4, 195, y + 4);

          y += 10;
        });

        doc.save(`my_job_posts_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF Report generated successfully');
        return;
      }

      // CSV Export
      const headers = ['JobTitle', 'CompanyOrPoster', 'JobType', 'WorkType', 'Location', 'Status', 'Applicants', 'PostedAt'];
      const rows = filteredPosts.map(post => {
        const isExpired = post.applicationDeadline && new Date(post.applicationDeadline) < new Date();
        const statusText = post.status === 'REMOVED' ? 'REMOVED' : isExpired ? 'EXPIRED' : post.status === 'OPEN' ? 'ACTIVE' : 'CLOSED';
        return [
          `"${post.title || ''}"`,
          `"${post.isPeerSourced || post.postedByRole !== 'EMPLOYER' ? (post.postedByName || 'Community Member') : post.companyName}"`,
          `"${formatJobType(post.jobType)}"`,
          `"${post.workType || ''}"`,
          `"${post.locationCity || ''}, ${post.locationCountry || ''}"`,
          `"${statusText}"`,
          `"${post.applicationCount || 0}"`,
          `"${formatDateString(post.createdAt)}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_job_posts_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await jobService.getMyPosts();
      if (response.success) {
        setPosts(response.data?.content || []);
      } else {
        setError('Failed to fetch job posts.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading job posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleClosePost = async (id: string) => {
    try {
      const res = await jobService.updateJobStatus(id, 'CLOSED');
      if (res.success) {
        toast.success('Job listing closed');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error('Failed to close listing');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await jobService.deleteJob(id);
      if (res.success) {
        toast.success('Job listing deleted');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error('Failed to delete listing');
    }
  };

  const formatJobType = (type: string) => {
    if (!type) return '';
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-end mb-8">
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 border-border/50">
              <Skeleton className="h-32 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        {/* Actions & Filters Header Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          {/* Left: Filters Selects */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Filters:</span>
            
            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-10 border-slate-200/80 rounded-xl text-xs bg-slate-50/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="REMOVED">Removed</SelectItem>
              </SelectContent>
            </Select>

            {/* Job Type Select */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 h-10 border-slate-200/80 rounded-xl text-xs bg-slate-50/50">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="INTERNSHIP">Internship</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter Select */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40 h-10 border-slate-200/80 rounded-xl text-xs bg-slate-50/50">
                <SelectValue placeholder="Date Posted" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="TODAY">Past 24 Hours</SelectItem>
                <SelectItem value="WEEK">Past 7 Days</SelectItem>
                <SelectItem value="MONTH">Past 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'ACTIVE' || typeFilter !== 'ALL' || dateFilter !== 'ALL') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  const params = new URLSearchParams(window.location.search);
                  params.delete('search');
                  router.replace(`${window.location.pathname}?${params.toString()}`);
                  setStatusFilter('ACTIVE');
                  setTypeFilter('ALL');
                  setDateFilter('ALL');
                }}
                className="h-10 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-slate-100 rounded-xl ml-auto"
              >
                <FilterX className="mr-1.5 h-3.5 w-3.5" /> Reset Filters
              </Button>
            )}
          </div>

          {/* Right: Export & Actions */}
          <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
            {/* Export Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-semibold border-slate-200 hover:bg-slate-50 h-11 px-4 rounded-xl text-xs" disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4 text-primary" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-slate-200 bg-white shadow-xl min-w-[160px] p-1">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs rounded-lg gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-cyan-600" /> Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs rounded-lg gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Download as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="h-11 px-6 font-semibold text-xs rounded-xl shadow-none" asChild>
              <Link href="/jobs/post">
                <Plus className="mr-1.5 h-4 w-4" /> Post New Job
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-4">
          {posts.length > 0 ? (
            filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden bg-background">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Job Content - Matching /jobs style */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/jobs/${post.id}`}>
                            <h3 className="text-xl font-medium group-hover:text-primary transition-colors truncate">
                              {post.title}
                            </h3>
                          </Link>
                          {(() => {
                            if (post.status === 'REMOVED') return <Badge variant="destructive" className="text-[10px] uppercase">Removed</Badge>;
                            const isExpired = post.applicationDeadline && new Date(post.applicationDeadline) < new Date();
                            if (isExpired) return <Badge variant="destructive" className="text-[10px] uppercase">Expired</Badge>;
                            if (post.status === 'OPEN') return <Badge className="bg-cyan-600 hover:bg-cyan-600 text-[10px] uppercase">Active</Badge>;
                            return <Badge variant="secondary" className="text-[10px] uppercase">Closed</Badge>;
                          })()}
                          {post.isPinned && post.pinnedUntil && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest gap-1">
                              <Pin className="h-3 w-3 fill-current" />
                              Pinned until {formatDateString(post.pinnedUntil)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium mb-6">
                          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                            <Building2 className="h-4 w-4" /> {post.isPeerSourced || post.postedByRole !== 'EMPLOYER' ? (post.postedByName || 'Community Member') : post.companyName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {post.locationCity}, {post.locationCountry}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> {formatDateString(post.createdAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 text-muted-foreground">
                            {formatJobType(post.jobType)}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                            {post.workType}
                          </Badge>
                          {!post.isPeerSourced && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-900 ml-2">
                               <Users className="h-3.5 w-3.5" /> {post.applicationCount || 0} Applicants
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center md:w-48 shrink-0 gap-4">
                        {post.status === 'REMOVED' ? (
                          <div className="w-full py-3 px-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-destructive text-center">
                            <AlertCircle className="h-4 w-4 mb-1" />
                            Post Unavailable
                          </div>
                        ) : (
                          <>
                            {!post.isPeerSourced ? (
                              <Button variant="outline" className="w-full font-medium group/btn h-11" asChild>
                                <Link href={`/jobs/${post.id}/applications`}>
                                  Manage Talent
                                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            ) : (
                              <div className="w-full py-2 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <ExternalLink className="h-3 w-3" /> External Source
                              </div>
                            )}

                            {!post.isPeerSourced && post.status === 'OPEN' && (
                              post.isPinned ? (
                                <Button 
                                  variant="outline" 
                                  className="w-full font-medium h-11 border-slate-200 text-slate-400 bg-slate-50/50 cursor-not-allowed"
                                  disabled
                                >
                                  Job pinned
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="w-full font-medium h-11 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                                  onClick={() => {
                                    setSelectedJob({ id: post.id, title: post.title });
                                    setIsPinDialogOpen(true);
                                  }}
                                >
                                  Pin Listing
                                </Button>
                              )
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-100 shadow-xl min-w-[180px]">
                                  <DropdownMenuItem className="rounded-xl font-medium gap-3" asChild>
                                    <Link href={`/jobs/${post.id}`}>
                                      <Eye className="h-4 w-4" /> Preview Live
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {post.status !== 'CLOSED' && (
                                    <DropdownMenuItem className="rounded-xl font-medium gap-3 text-azure-500" onClick={() => handleClosePost(post.id)}>
                                      <Lock className="h-4 w-4" /> Close Listing
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="rounded-xl font-medium gap-3 text-destructive" onClick={() => handleDeletePost(post.id)}>
                                    <Trash2 className="h-4 w-4" /> Delete Post
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 bg-background rounded-3xl border border-dashed border-muted">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FilterX className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">No postings match your filters</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setTypeFilter('ALL');
                    setDateFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )
          ) : (
            <div className="py-20 text-center space-y-4 bg-background rounded-3xl border border-dashed border-muted">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-medium">No jobs posted yet</h3>
                <p className="text-muted-foreground text-sm">Create your first listing to start connecting with talent.</p>
              </div>
              <Button asChild>
                <Link href="/jobs/post">Post Your First Job</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <PinJobDialog
          open={isPinDialogOpen}
          onClose={() => {
            setIsPinDialogOpen(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          onSuccess={() => {
            // Update local state to show pinned status
            setPosts(prev => prev.map(p => 
              p.id === selectedJob.id 
                ? { ...p, isPinned: true, pinnedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } // Placeholder until refresh
                : p
            ));
            toast.success('Job pinned successfully!');
            fetchMyPosts(); // Refresh for real data
          }}
        />
      )}
    </div>
  );
}
