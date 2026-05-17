'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
  Briefcase,
  FilterX,
  Plus,
  Building2,
  Loader2,
  Download,
  FileSpreadsheet,
  FileText,
  Pin,
  TrendingUp,
  Clock,
  DollarSign,
  PinOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { JobSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/lib/constants';

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' }
];

const WORK_TYPES = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' }
];

const KENYA_CITIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Naivasha',
  'Nyeri',
  'Machakos'
];

const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid-Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead / Principal' }
];

function JobsPageContent() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [pinnedJobs, setPinnedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinnedLoading, setIsPinnedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchTerm = searchParams.get('search') || '';
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedExpLevels, setSelectedExpLevels] = useState<string[]>([]);
  const [city, setCity] = useState('All');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [minQualification, setMinQualification] = useState('');
  const [minExperienceYears, setMinExperienceYears] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');
  const [isPeerSourced, setIsPeerSourced] = useState<boolean | null>(null);
  const [minUpvotes, setMinUpvotes] = useState('');
  const [status, setStatus] = useState<string>('OPEN');
  const [metadata, setMetadata] = useState<{ qualifications: string[], experienceYears: number[] }>({ qualifications: [], experienceYears: [] });

  const uniqueCities = Array.from(new Set([...KENYA_CITIES, ...jobs.map(j => j.locationCity).filter(Boolean)])).sort();

  const [sortBy, setSortBy] = useState('newest');
  const [upvotedJobs, setUpvotedJobs] = useState<Set<string>>(new Set());
  const [downvotedJobs, setDownvotedJobs] = useState<Set<string>>(new Set());

  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [flagContent, setFlagContent] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  useEffect(() => {
    const fetchPinnedJobs = async () => {
      try {
        const response = await jobService.getPinnedJobs();
        if (response.success) {
          setPinnedJobs(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch pinned jobs', err);
      } finally {
        setIsPinnedLoading(false);
      }
    };

    const fetchMetadata = async () => {
      try {
        const response = await jobService.getFilterMetadata();
        if (response.success) {
          setMetadata(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch filter metadata', err);
      }
    };

    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobs({
          page: 0,
          size: 50, // get a bigger slice to support fluid frontend sorting/pagination
          keyword: searchTerm || undefined,
          locationCity: city === 'All' ? undefined : city,
          jobTypes: selectedJobTypes.length > 0 ? selectedJobTypes : undefined,
          workTypes: selectedWorkTypes.length > 0 ? selectedWorkTypes : undefined,
          experienceLevels: selectedExpLevels.length > 0 ? selectedExpLevels : undefined,
          minSalary: minSalary ? parseFloat(minSalary) : undefined,
          maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
          minQualification: minQualification || undefined,
          minExperienceYears: minExperienceYears ? parseInt(minExperienceYears) : undefined,
          deadlineFrom: deadlineFrom || undefined,
          deadlineTo: deadlineTo || undefined,
          isPeerSourced: isPeerSourced !== null ? isPeerSourced : undefined,
          minUpvotes: minUpvotes ? parseInt(minUpvotes) : undefined,
          status: status as any,
        });
        if (response.success) {
          let content = response.data.content;
          if (sortBy === 'newest') {
            content = [...content].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          } else if (sortBy === 'upvotes') {
            content = [...content].sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
          }
          setJobs(content);
        }
      } catch (err: any) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPinnedJobs();
    fetchMetadata();
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, city, selectedJobTypes, selectedWorkTypes, selectedExpLevels, minSalary, maxSalary, minQualification, minExperienceYears, deadlineFrom, deadlineTo, isPeerSourced, minUpvotes, status, sortBy]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        const blob = await jobService.exportJobsPdf({
          keyword: searchTerm || undefined,
          locationCity: city === 'All' ? undefined : city,
          jobTypes: selectedJobTypes.length > 0 ? selectedJobTypes : undefined,
          workTypes: selectedWorkTypes.length > 0 ? selectedWorkTypes : undefined,
          experienceLevels: selectedExpLevels.length > 0 ? selectedExpLevels : undefined,
          minSalary: minSalary ? parseFloat(minSalary) : undefined,
          maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
          minQualification: minQualification || undefined,
          minExperienceYears: minExperienceYears ? parseInt(minExperienceYears) : undefined,
          deadlineFrom: deadlineFrom || undefined,
          deadlineTo: deadlineTo || undefined,
          isPeerSourced: isPeerSourced !== null ? isPeerSourced : undefined,
          minUpvotes: minUpvotes ? parseInt(minUpvotes) : undefined,
          status: status as any,
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job_listings_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF Report generated successfully');
        return;
      }

      const headers = ['JobTitle', 'Company', 'WorkArrangement', 'Location', 'Status', 'Upvotes'];
      const rows = jobs.map(j => [
        `"${j.title || ''}"`,
        `"${j.isPeerSourced || j.postedByRole !== 'EMPLOYER' ? (j.postedByName || 'Community Member') : j.companyName}"`,
        `"${j.workType || ''}"`,
        `"${j.locationCity || ''}"`,
        `"${j.status || ''}"`,
        `"${j.upvoteCount || 0}"`
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobs_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleVote = async (id: string, vote: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;

    const wasUpvoted = upvotedJobs.has(id);
    const wasDownvoted = downvotedJobs.has(id);
    const prevUpvoted = new Set(upvotedJobs);
    const prevDownvoted = new Set(downvotedJobs);

    if (vote === 'UP') {
      if (wasUpvoted) {
        prevUpvoted.delete(id);
      } else {
        prevUpvoted.add(id);
        prevDownvoted.delete(id);
      }
    } else {
      if (wasDownvoted) {
        prevDownvoted.delete(id);
      } else {
        prevDownvoted.add(id);
        prevUpvoted.delete(id);
      }
    }

    setUpvotedJobs(prevUpvoted);
    setDownvotedJobs(prevDownvoted);

    const calculateVoteChange = () => {
      if (vote === 'UP') {
        if (wasUpvoted) return -1;
        if (wasDownvoted) return 2;
        return 1;
      } else {
        if (wasDownvoted) return 1;
        if (wasUpvoted) return -2;
        return -1;
      }
    };

    const voteChange = calculateVoteChange();
    setJobs(prevJobs => prevJobs.map(j => j.id === id ? { ...j, upvoteCount: j.upvoteCount + voteChange } : j));

    try {
      const response = await jobService.voteJob(id, vote === 'UP' ? 'UPVOTE' : 'DOWNVOTE');
      if (!response.success) {
        throw new Error(response.message || 'Failed to register vote');
      }
    } catch (err: any) {
      setUpvotedJobs(upvotedJobs);
      setDownvotedJobs(downvotedJobs);
      setJobs(jobs); // Revert to original jobs state
      toast.error(err.message || 'Failed to register vote');
      console.error(err);
    }
  };

  const handleFlagJob = async () => {
    if (!selectedJobId) return;
    if (!flagContent.trim()) {
      toast.error('Reason for reporting is required.');
      return;
    }
    setIsSubmittingFlag(true);
    try {
      const response = await jobService.flagJob(selectedJobId, flagContent.trim());
      if (response.success) {
        toast.success('Job reported to moderation team.');
        setIsFlagOpen(false);
        setFlagContent('');
        setSelectedJobId(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to report job. You may not be able to flag this listing.');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const formatExperienceLevel = (level: string) => {
    switch (level) {
      case 'ENTRY': return 'Entry-level';
      case 'MID': return 'Mid-level';
      case 'SENIOR': return 'Senior-level';
      case 'LEAD': return 'Lead-level';
      default: return level;
    }
  };

  const formatWorkType = (type: string) => {
    if (type === 'ONSITE') return 'On-site';
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <PageContainer className="max-w-full px-8 xl:px-16">
        <div className="flex justify-end items-center gap-3 mb-8 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-12 px-6" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4 text-primary" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium">
                <FileText className="mr-2 h-4 w-4" /> Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn && (
            <Button className="h-12 px-6 font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/jobs/post">
                <Plus className="mr-2 h-5 w-5" /> Post a Job
              </Link>
            </Button>
          )}
        </div>

        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-black">KEDevs Job Market Report</h1>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className={cn("grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 items-start", SPACING.cards)}>
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 print:hidden sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Jobs</h3>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Work Arrangements</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {WORK_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wt-${type.value}`}
                          checked={selectedWorkTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedWorkTypes([...selectedWorkTypes, type.value]);
                            else setSelectedWorkTypes(selectedWorkTypes.filter(t => t !== type.value));
                          }}
                        />
                        <Label htmlFor={`wt-${type.value}`} className="text-xs font-medium cursor-pointer">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Job Types</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {JOB_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`jt-${type.value}`}
                          checked={selectedJobTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedJobTypes([...selectedJobTypes, type.value]);
                            else setSelectedJobTypes(selectedJobTypes.filter(t => t !== type.value));
                          }}
                        />
                        <Label htmlFor={`jt-${type.value}`} className="text-xs font-medium cursor-pointer">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Experience Levels</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {EXPERIENCE_LEVELS.map(level => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`el-${level.value}`}
                          checked={selectedExpLevels.includes(level.value)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedExpLevels([...selectedExpLevels, level.value]);
                            else setSelectedExpLevels(selectedExpLevels.filter(t => t !== level.value));
                          }}
                        />
                        <Label htmlFor={`el-${level.value}`} className="text-xs font-medium cursor-pointer">{level.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Location</label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Location</SelectItem>
                      {uniqueCities.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Qualification & Exp</label>
                  <div className="space-y-2">
                    <Select value={minQualification || 'All'} onValueChange={(val) => setMinQualification(val === 'All' ? '' : val)}>
                      <SelectTrigger className="text-xs h-9 rounded-lg">
                        <SelectValue placeholder="Any Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">Any Qualification</SelectItem>
                        {metadata.qualifications.map(q => (
                          <SelectItem key={q} value={q}>{q}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={minExperienceYears || 'All'} onValueChange={(val) => setMinExperienceYears(val === 'All' ? '' : val)}>
                      <SelectTrigger className="text-xs h-9 rounded-lg">
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">Any Experience</SelectItem>
                        {metadata.experienceYears.map(exp => (
                          <SelectItem key={exp.toString()} value={exp.toString()}>{exp} Years</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Application Deadline</label>
                  <div className="flex flex-col gap-3 bg-muted/10 p-3 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From Date</Label>
                      <Input
                        type="date"
                        className="text-xs border-border/50 h-9 rounded-lg focus-visible:ring-primary/20"
                        value={deadlineFrom}
                        onChange={(e) => setDeadlineFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To Date</Label>
                      <Input
                        type="date"
                        className="text-xs border-border/50 h-9 rounded-lg focus-visible:ring-primary/20"
                        value={deadlineTo}
                        onChange={(e) => setDeadlineTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Advanced</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="peer-sourced"
                        checked={isPeerSourced === true}
                        onCheckedChange={(checked) => setIsPeerSourced(checked ? true : null)}
                      />
                      <Label htmlFor="peer-sourced" className="text-xs font-medium cursor-pointer">Peer Sourced Only</Label>
                    </div>
                    <div className="pt-2">
                      <Label className="text-[10px] text-muted-foreground">Min Upvotes</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        className="text-xs border-border/50 h-8 mt-1"
                        value={minUpvotes}
                        onChange={(e) => setMinUpvotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Job Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="text-xs h-9 rounded-lg w-full">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open Only</SelectItem>
                      <SelectItem value="CLOSED">Closed Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Order Results By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                      <SelectValue placeholder="Newest First" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="upvotes">Most Upvoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || selectedWorkTypes.length > 0 || selectedJobTypes.length > 0 || selectedExpLevels.length > 0 || city !== 'All' || minSalary || maxSalary || minQualification || minExperienceYears || deadlineFrom || deadlineTo || isPeerSourced !== null || minUpvotes || status !== 'OPEN') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-muted-foreground mt-2"
                    onClick={() => {
                      router.push(pathname);
                      setSelectedWorkTypes([]);
                      setSelectedJobTypes([]);
                      setSelectedExpLevels([]);
                      setCity('All');
                      setMinSalary('');
                      setMaxSalary('');
                      setMinQualification('');
                      setMinExperienceYears('');
                      setDeadlineFrom('');
                      setDeadlineTo('');
                      setIsPeerSourced(null);
                      setMinUpvotes('');
                      setStatus('OPEN');
                    }}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Job List area */}
          <main className="lg:col-span-3 xl:col-span-4 print:col-span-full space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Pinned Jobs Row */}
            {!searchTerm && pinnedJobs.length > 0 && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 px-1">
                  <div className="bg-primary/10 p-2 rounded-lg">
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Featured Listings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedJobs.map((pJob) => (
                    <Card key={pJob.id} className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent hover:shadow-xl hover:shadow-primary/10 transition-all group">
                      <CardHeader className="pb-2">
                        <Link href={`/jobs/${pJob.id}`}>
                          <h3 className="font-black text-lg group-hover:text-primary transition-colors line-clamp-1">{pJob.title}</h3>
                        </Link>
                        <p className="text-xs font-bold text-muted-foreground line-clamp-1">{pJob.companyName}</p>
                      </CardHeader>
                      <CardContent className="pb-3 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5" /> {pJob.locationCity}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-black py-0.5">{pJob.workType}</Badge>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-black py-0.5 border-primary/20 text-primary">{pJob.jobType}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between items-center border-t border-primary/10 mt-2 bg-primary/[0.02]">
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3" /> Expires soon
                        </span>
                        <Link href={`/jobs/${pJob.id}`} className="mt-2">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                            View <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <Card key={i} className="p-6 border-border/50">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <Skeleton className="h-7 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/3 mb-6" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-32 rounded-xl" />
                    </div>
                  </Card>
                ))
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl border border-dashed border-border">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className={cn(TYPOGRAPHY.sectionHeading, "mb-2")}>No jobs found</h3>
                  <p className={cn(TYPOGRAPHY.body, "mb-4")}>Try adjusting your filters or search term.</p>
                  {(searchTerm || selectedWorkTypes.length > 0 || selectedJobTypes.length > 0 || selectedExpLevels.length > 0 || city !== 'All' || minSalary || maxSalary || minQualification || minExperienceYears || deadlineFrom || deadlineTo || isPeerSourced !== null || minUpvotes || status !== 'OPEN') && (
                    <Button variant="outline" size="sm" onClick={() => {
                      router.push(pathname);
                      setSelectedWorkTypes([]);
                      setSelectedJobTypes([]);
                      setSelectedExpLevels([]);
                      setCity('All');
                      setMinSalary('');
                      setMaxSalary('');
                      setMinQualification('');
                      setMinExperienceYears('');
                      setDeadlineFrom('');
                      setDeadlineTo('');
                      setIsPeerSourced(null);
                      setMinUpvotes('');
                      setStatus('OPEN');
                    }}>
                      Reset Filters
                    </Button>
                  )}
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Job Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Link href={`/jobs/${job.id}`} className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                                {job.title}
                              </h3>
                            </Link>
                            {(() => {
                              const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                              if (isExpired) return <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest py-0.5">Expired</Badge>;
                              if (job.status === 'OPEN') return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest py-0.5">Open</Badge>;
                              return <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest py-0.5">Closed</Badge>;
                            })()}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium mb-6">
                            <span className="font-bold text-foreground/80">
                              {job.isPeerSourced || job.postedByRole !== 'EMPLOYER' ? (job.postedByName || 'Community Member') : job.companyName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" /> {job.locationCity}, {job.locationCountry}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4" /> {formatExperienceLevel(job.experienceLevel)}
                            </span>
                            {(job.salaryRangeMin || job.salaryRangeMax) && (
                              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                {job.salaryRangeMin && `KES ${job.salaryRangeMin.toLocaleString()}`}
                                {job.salaryRangeMin && job.salaryRangeMax && ' – '}
                                {job.salaryRangeMax && `KES ${job.salaryRangeMax.toLocaleString()}`}
                              </span>
                            )}
                            {job.applicationDeadline && (
                              <span className={cn(
                                "flex items-center gap-1.5 font-bold",
                                new Date(job.applicationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? "text-rose-500" : "text-muted-foreground"
                              )}>
                                <Calendar className="h-4 w-4" />
                                {new Date(job.applicationDeadline) < new Date() ? 'Expired: ' : 'Deadline: '}
                                {format(new Date(job.applicationDeadline), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200">
                              {formatJobType(job.jobType)}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                              {formatWorkType(job.workType)}
                            </Badge>
                            {job.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] font-medium bg-muted/30 border-muted text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                            {job.tags.length > 3 && (
                              <Badge variant="outline" className="text-[10px] font-medium bg-muted/30 border-muted text-muted-foreground">
                                +{job.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Voting & CTA */}
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between md:w-40 shrink-0 gap-4 print:hidden">
                          <div className="flex items-center gap-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                      "h-9 w-9 rounded-full border border-border/50",
                                      upvotedJobs.has(job.id) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary"
                                    )}
                                    onClick={(e) => handleVote(job.id, 'UP', e)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isLoggedIn ? "Upvote" : "Login to upvote"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                      "h-9 w-9 rounded-full border border-border/50",
                                      downvotedJobs.has(job.id) ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "hover:bg-destructive/10 hover:text-destructive"
                                    )}
                                    onClick={(e) => handleVote(job.id, 'DOWN', e)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isLoggedIn ? "Downvote" : "Login to downvote"}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-9 w-9 rounded-full",
                                      job.isFlagged
                                        ? "text-destructive bg-destructive/10"
                                        : "text-slate-400 hover:text-destructive hover:bg-destructive/10"
                                    )}
                                    disabled={!isLoggedIn}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (!isLoggedIn) {
                                        toast.error("Please login to report jobs");
                                        return;
                                      }
                                      setSelectedJobId(job.id);
                                      setIsFlagOpen(true);
                                    }}
                                  >
                                    <Flag className={cn("h-4 w-4", job.isFlagged && "fill-current")} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Report Job</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="text-right flex-1 md:flex-none">
                            <div className="hidden md:block mb-3">
                              <span className="text-sm font-black text-primary uppercase tracking-widest">{job.upvoteCount} {Math.abs(job.upvoteCount) === 1 ? 'Vote' : 'Votes'}</span>
                            </div>
                            <Button
                              variant={user?.role === 'DEVELOPER' ? 'default' : 'outline'}
                              className="w-full font-bold group/btn"
                              asChild
                            >
                              <Link href={isLoggedIn ? `/jobs/${job.id}` : '/register'}>
                                {isLoggedIn ? (user?.role === 'DEVELOPER' ? 'Apply Now' : 'Details') : 'Register'}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </PageContainer>

      {/* Flag Modal */}
      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Flag className="h-6 w-6" />
              </div>
              Report Job Listing
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Please describe why you are reporting this job. Our moderation team will review this report.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Reason for Reporting</span>
                <span className={cn(flagContent.length > 500 ? "text-destructive" : "")}>
                  {flagContent.length}/500
                </span>
              </Label>
              <Textarea
                placeholder="e.g. Spam, fake job, offensive content..."
                className="min-h-[120px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-destructive/20"
                value={flagContent}
                onChange={(e) => setFlagContent(e.target.value.slice(0, 500))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsFlagOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl font-black px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleFlagJob}
              disabled={isSubmittingFlag || !flagContent.trim()}
            >
              {isSubmittingFlag ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}

