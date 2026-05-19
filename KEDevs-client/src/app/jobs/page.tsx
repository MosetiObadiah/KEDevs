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
  PinOff,
  ChevronDown,
  X,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { cn, formatDateString } from '@/lib/utils';
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

  const now = React.useMemo(() => new Date(), []);
  const sevenDaysFromNow = React.useMemo(() => new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), [now]);

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [pinnedJobs, setPinnedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
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

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleToggleFilters = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowDesktopFilters(!showDesktopFilters);
    } else {
      setIsMobileFiltersOpen(!isMobileFiltersOpen);
    }
  };

  const uniqueCities = Array.from(new Set([...KENYA_CITIES, ...jobs.map(j => j.locationCity).filter(Boolean)])).sort();
  const availableSkills = Array.from(new Set(jobs.flatMap(j => j.tags || []))).sort();
  const filteredSkillsList = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    selectedSkills.length === 0 ||
    (job.tags && job.tags.some(t => selectedSkills.includes(t)))
  );

  const [sortBy, setSortBy] = useState('newest');
  const [upvotedJobs, setUpvotedJobs] = useState<Set<string>>(new Set());
  const [downvotedJobs, setDownvotedJobs] = useState<Set<string>>(new Set());
  const [flaggedJobs, setFlaggedJobs] = useState<Set<string>>(new Set());

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
          setUpvotedJobs(prev => {
            const next = new Set(prev);
            response.data.forEach((job: any) => {
              if (job.currentUserVote === 'UPVOTE' || job.currentUserVote === 'UP') {
                next.add(job.id);
              }
            });
            return next;
          });
          setDownvotedJobs(prev => {
            const next = new Set(prev);
            response.data.forEach((job: any) => {
              if (job.currentUserVote === 'DOWNVOTE' || job.currentUserVote === 'DOWN') {
                next.add(job.id);
              }
            });
            return next;
          });
          setFlaggedJobs(prev => {
            const next = new Set(prev);
            response.data.forEach((job: any) => {
              if (job.isCurrentUserFlagged) {
                next.add(job.id);
              }
            });
            return next;
          });
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
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
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

          setUpvotedJobs(prev => {
            const next = new Set(prev);
            content.forEach((job: any) => {
              if (job.currentUserVote === 'UPVOTE' || job.currentUserVote === 'UP') {
                next.add(job.id);
              }
            });
            return next;
          });
          setDownvotedJobs(prev => {
            const next = new Set(prev);
            content.forEach((job: any) => {
              if (job.currentUserVote === 'DOWNVOTE' || job.currentUserVote === 'DOWN') {
                next.add(job.id);
              }
            });
            return next;
          });
          setFlaggedJobs(prev => {
            const next = new Set(prev);
            content.forEach((job: any) => {
              if (job.isCurrentUserFlagged) {
                next.add(job.id);
              }
            });
            return next;
          });
        }
      } catch (err: any) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
        setIsFiltering(false);
      }
    };

    fetchPinnedJobs();
    fetchMetadata();
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, city, selectedJobTypes, selectedWorkTypes, selectedExpLevels, minSalary, maxSalary, minQualification, minExperienceYears, deadlineFrom, deadlineTo, isPeerSourced, minUpvotes, status, sortBy, isInitialLoad]);

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
      const rows = filteredJobs.map(j => [
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
    setPinnedJobs(prevPinned => prevPinned.map(j => j.id === id ? { ...j, upvoteCount: (j.upvoteCount || 0) + voteChange } : j));

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
        setFlaggedJobs(prev => {
          const next = new Set(prev);
          next.add(selectedJobId);
          return next;
        });
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

  const renderFilters = () => (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Work Arrangements</label>
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
        <label className="text-xs font-medium text-muted-foreground uppercase">Job Types</label>
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
        <label className="text-xs font-medium text-muted-foreground uppercase">Experience Levels</label>
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
        <label className="text-xs font-medium text-muted-foreground uppercase">Location</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-xl">
            <SelectValue placeholder="Any Location" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="All">Any Location</SelectItem>
            {uniqueCities.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 relative">
        <label className="text-xs font-medium text-muted-foreground uppercase">Skills</label>

        {/* Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            className="w-full flex items-center justify-between border border-border/50 bg-background text-xs h-9 px-3 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700"
            onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
          >
            <span className="truncate text-left flex-1">
              {selectedSkills.length === 0
                ? "Select skills..."
                : `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-2" />
          </button>

          {/* Dropdown Menu Overlay */}
          {isSkillsDropdownOpen && (
            <>
              {/* Invisible backdrop to close the dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSkillsDropdownOpen(false)}
              />
              <div className="absolute left-0 right-0 mt-1.5 p-3 bg-background border border-border/70 rounded-xl shadow-xl z-20 space-y-3 max-h-[300px] flex flex-col">
                {/* Search Input */}
                <div className="relative shrink-0">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search or enter custom skill..."
                    className="pl-8 text-xs h-8 rounded-xl border-border/50 focus-visible:ring-primary/20"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && skillSearch.trim()) {
                        e.preventDefault();
                        const customSkill = skillSearch.trim();
                        if (!selectedSkills.includes(customSkill)) {
                          setSelectedSkills([...selectedSkills, customSkill]);
                        }
                        setSkillSearch('');
                      }
                    }}
                  />
                </div>

                {/* Skills List */}
                <div className="overflow-y-auto flex-1 space-y-1.5 scrollbar-thin pr-1">
                  {/* Option to add custom skill if search term doesn't match exactly */}
                  {skillSearch.trim() && !availableSkills.some(s => s.toLowerCase() === skillSearch.trim().toLowerCase()) && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 text-xs font-medium text-left transition-colors border border-primary/10"
                      onClick={() => {
                        const customSkill = skillSearch.trim();
                        if (!selectedSkills.includes(customSkill)) {
                          setSelectedSkills([...selectedSkills, customSkill]);
                        }
                        setSkillSearch('');
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Add custom skill: &quot;{skillSearch.trim()}&quot;</span>
                    </button>
                  )}

                  {filteredSkillsList.length > 0 ? (
                    filteredSkillsList.map(skill => {
                      const isChecked = selectedSkills.includes(skill);
                      return (
                        <div
                          key={skill}
                          className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            } else {
                              setSelectedSkills([...selectedSkills, skill]);
                            }
                          }}
                        >
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={isChecked}
                            onCheckedChange={() => { }} // handled by parent click
                          />
                          <Label htmlFor={`skill-${skill}`} className="text-xs font-medium cursor-pointer flex-1 py-0.5 truncate">{skill}</Label>
                        </div>
                      );
                    })
                  ) : (
                    !skillSearch.trim() && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">No skills available. Type to add custom.</p>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Render Selected Skills badges below trigger */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedSkills.map(skill => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 text-[10px] font-medium px-2 py-0.5 rounded-2xl flex items-center gap-1.5"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                  className="text-primary/70 hover:text-primary transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Qualification & Exp</label>
        <div className="space-y-2">
          <Select value={minQualification || 'All'} onValueChange={(val) => setMinQualification(val === 'All' ? '' : val)}>
            <SelectTrigger className="text-xs h-9 rounded-xl">
              <SelectValue placeholder="Any Qualification" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="All">Any Qualification</SelectItem>
              {metadata.qualifications.map(q => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minExperienceYears || 'All'} onValueChange={(val) => setMinExperienceYears(val === 'All' ? '' : val)}>
            <SelectTrigger className="text-xs h-9 rounded-xl">
              <SelectValue placeholder="Any Experience" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="All">Any Experience</SelectItem>
              {metadata.experienceYears.map(exp => (
                <SelectItem key={exp.toString()} value={exp.toString()}>{exp} Years</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Application Deadline</label>
        <div className="flex flex-col gap-3 bg-muted/10 p-3 rounded-xl">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From Date</Label>
            <Input
              type="date"
              className="text-xs border-border/50 h-9 rounded-xl focus-visible:ring-primary/20"
              value={deadlineFrom}
              onChange={(e) => setDeadlineFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To Date</Label>
            <Input
              type="date"
              className="text-xs border-border/50 h-9 rounded-xl focus-visible:ring-primary/20"
              value={deadlineTo}
              onChange={(e) => setDeadlineTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Advanced</label>
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
        <label className="text-xs font-medium text-muted-foreground uppercase">Job Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="text-xs h-9 rounded-xl w-full">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="OPEN">Open Only</SelectItem>
            <SelectItem value="CLOSED">Closed Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 border-t pt-4">
        <label className="text-xs font-medium text-muted-foreground uppercase">Order Results By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-xl">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="upvotes">Most Upvoted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(searchTerm || selectedWorkTypes.length > 0 || selectedJobTypes.length > 0 || selectedExpLevels.length > 0 || city !== 'All' || minSalary || maxSalary || minQualification || minExperienceYears || deadlineFrom || deadlineTo || isPeerSourced !== null || minUpvotes || status !== 'OPEN' || selectedSkills.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-medium text-muted-foreground mt-2"
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
            setSelectedSkills([]);
          }}
        >
          <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
        </Button>
      )}
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <PageContainer className="max-w-none w-full px-4 md:px-8 xl:px-12">
        {/* Compact Top Toolbar Row */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 print:hidden bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-300">
          {/* Left: Filters Trigger & Results Count */}
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="font-semibold border-slate-200 hover:bg-slate-50 h-10 px-4 rounded-xl text-xs">
                    <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                  <SheetHeader className="p-6 pb-2 text-left">
                    <SheetTitle>Filter Jobs</SheetTitle>
                    <SheetDescription className="sr-only">Choose options to narrow down job postings.</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 pt-0 space-y-6">
                    {renderFilters()}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Toggle Button */}
            <div className="hidden lg:block">
              <Button
                variant="outline"
                className="font-semibold border-slate-200 hover:bg-slate-50 h-10 px-4 rounded-xl text-xs"
                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                {showDesktopFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results Count */}
            <p className="text-xs font-semibold text-slate-500 border-l border-slate-200 pl-4">
              Showing <span className="text-navy-900 font-bold">{filteredJobs.length}</span> job{filteredJobs.length !== 1 && 's'}
            </p>
          </div>

          {/* Right: Export & Actions */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-semibold border-slate-200 hover:bg-slate-50 h-10 px-4 rounded-xl text-xs" disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4 text-primary" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs">
                  <FileText className="mr-2 h-4 w-4" /> Download as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoggedIn && (
              <Button className="h-10 px-4 font-semibold text-xs rounded-xl shadow-none" asChild>
                <Link href="/jobs/post">
                  <Plus className="mr-1.5 h-4 w-4" /> Post a Job
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-black">KEDevs Job Market Report</h1>
          <p className="text-sm text-slate-500">Generated on {formatDateString(new Date())}</p>
        </div>

        <div className="flex gap-8 items-start w-full">
          {/* Filters Sidebar (Desktop) */}
          {showDesktopFilters && (
            <aside className="hidden lg:block w-72 shrink-0 space-y-6 print:hidden sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
              <Card className="border-border/50 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Filter Jobs</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderFilters()}
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Job List area */}
          <main className="flex-1 w-full space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Pinned Jobs Row */}
            {!searchTerm && pinnedJobs.length > 0 && (
              <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl mb-8 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Featured</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pinnedJobs.map((pJob) => {
                    const daysLeft = pJob.applicationDeadline 
                      ? Math.ceil((new Date(pJob.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 3;
                    const isNew = pJob.createdAt 
                      ? Math.ceil((new Date().getTime() - new Date(pJob.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 3
                      : false;

                    const initials = pJob.companyName 
                      ? pJob.companyName.split(' ').map((w: string) => w.charAt(0)).join('').substring(0, 2).toUpperCase()
                      : 'CO';

                    return (
                      <Card 
                        key={pJob.id} 
                        className={cn(
                          "relative overflow-hidden bg-white border transition-all duration-300 group flex flex-col justify-between p-5 rounded-xl min-h-[220px] shadow-sm",
                          isUrgent ? "border-amber-400/60 bg-amber-50/10 shadow-[0_0_15px_rgba(245,158,11,0.03)]" : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="space-y-3">
                          {/* Company Name & Logo initials */}
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 tracking-tight uppercase shrink-0">
                              {initials}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[150px]">
                              {pJob.companyName || 'Tech Ecosystem'}
                            </span>
                          </div>

                          {/* Job Title */}
                          <Link href={`/jobs/${pJob.id}`}>
                            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                              {pJob.title}
                            </h3>
                          </Link>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Badge className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full hover:bg-blue-50">
                              {pJob.workType}
                            </Badge>
                            <Badge className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full hover:bg-slate-50">
                              {pJob.jobType?.replace('_', ' ')}
                            </Badge>
                            {isUrgent && (
                              <Badge className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full hover:bg-amber-50">
                                Expires soon
                              </Badge>
                            )}
                          </div>

                          {/* Location & Salary */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {pJob.locationCity}
                            </span>
                            {pJob.minSalary && (
                              <span className="text-slate-700 font-semibold">
                                Salary: {pJob.salaryCurrency || 'KES'} {Math.round(pJob.minSalary / 1000)}k
                              </span>
                            )}
                          </div>

                          {/* Voting Row */}
                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-dashed border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8 rounded-full border border-slate-100 shadow-sm transition-all",
                                        upvotedJobs.has(pJob.id) ? "bg-azure-500 text-white hover:bg-azure-600" : "hover:bg-azure-50 hover:text-azure-500 bg-white"
                                      )}
                                      onClick={(e) => handleVote(pJob.id, 'UP', e)}
                                      disabled={!isLoggedIn}
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
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
                                        "h-8 w-8 rounded-full border border-slate-100 shadow-sm transition-all",
                                        downvotedJobs.has(pJob.id) ? "bg-danger-600 text-white hover:bg-danger-700" : "hover:bg-danger-50 hover:text-danger-600 bg-white"
                                      )}
                                      onClick={(e) => handleVote(pJob.id, 'DOWN', e)}
                                      disabled={!isLoggedIn}
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5" />
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
                                        "h-8 w-8 rounded-full",
                                        flaggedJobs.has(pJob.id)
                                          ? "text-danger-600 bg-danger-50"
                                          : "text-slate-400 hover:text-danger-600 hover:bg-danger-50"
                                      )}
                                      disabled={!isLoggedIn}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!isLoggedIn) {
                                          toast.error("Please login to report jobs");
                                          return;
                                        }
                                        setSelectedJobId(pJob.id);
                                        setIsFlagOpen(true);
                                      }}
                                    >
                                      <Flag className={cn("h-3.5 w-3.5", flaggedJobs.has(pJob.id) && "fill-current")} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Report Job</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="text-xs font-semibold text-azure-600">
                              {pJob.upvoteCount >= 0 ? `${pJob.upvoteCount} upvotes` : `${Math.abs(pJob.upvoteCount)} downvotes`}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer Divider and Action */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className={cn(
                            "text-[10px] font-semibold flex items-center gap-1.5",
                            isUrgent ? "text-amber-600 font-bold" : "text-slate-400"
                          )}>
                            <Clock className="h-3.5 w-3.5" />
                            {daysLeft !== null ? (daysLeft === 0 ? "Expires today" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`) : "No deadline"}
                          </span>
                          <Link href={`/jobs/${pJob.id}`}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border border-slate-200 hover:border-slate-300 bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-[10px] font-black uppercase tracking-wider px-3.5 rounded-lg flex items-center gap-1 transition-all"
                            >
                              View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={cn("space-y-4 transition-opacity duration-200", isFiltering && "opacity-60 pointer-events-none")}>
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
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl border border-dashed border-border">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className={cn(TYPOGRAPHY.sectionHeading, "mb-2")}>No jobs found</h3>
                  <p className={cn(TYPOGRAPHY.body, "mb-4")}>Try adjusting your filters or search term.</p>
                  {(searchTerm || selectedWorkTypes.length > 0 || selectedJobTypes.length > 0 || selectedExpLevels.length > 0 || city !== 'All' || minSalary || maxSalary || minQualification || minExperienceYears || deadlineFrom || deadlineTo || isPeerSourced !== null || minUpvotes || status !== 'OPEN' || selectedSkills.length > 0) && (
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
                      setSelectedSkills([]);
                    }}>
                      Reset Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const userSkills = user?.skills || [];
                  const isSkillsMatch = isLoggedIn && user?.role === 'DEVELOPER' && job.tags && job.tags.some(tag => userSkills.map(s => s.toLowerCase()).includes(tag.toLowerCase()));
                  const daysLeft = job.applicationDeadline 
                    ? Math.ceil((new Date(job.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 3;

                  return (
                    <Card key={job.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden bg-background">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Job Content - Matching /my-posts layout */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
                                <h3 className="text-xl font-medium group-hover:text-primary transition-colors truncate">
                                  {job.title}
                                </h3>
                              </Link>

                              {/* Skills Match Badge */}
                              {isSkillsMatch && (
                                <Badge className="bg-success-50 text-success-600 border-none font-black text-[10px] uppercase tracking-widest shrink-0">
                                  Skills Match
                                </Badge>
                              )}

                              {(() => {
                                const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                                if (isExpired) return <Badge variant="destructive" className="text-[10px] uppercase py-0.5 shrink-0 font-black tracking-widest">Expired</Badge>;
                                if (job.status === 'OPEN') return <Badge className="bg-cyan-600 hover:bg-cyan-600 text-[10px] uppercase py-0.5 shrink-0 font-black tracking-widest">Active</Badge>;
                                return <Badge variant="secondary" className="text-[10px] uppercase py-0.5 shrink-0 font-black tracking-widest">Closed</Badge>;
                              })()}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium mb-6">
                              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                                <Building2 className="h-4 w-4" /> {job.isPeerSourced || job.postedByRole !== 'EMPLOYER' ? (job.postedByName || 'Community Member') : job.companyName}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" /> {job.locationCity}, {job.locationCountry}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" /> {formatExperienceLevel(job.experienceLevel)}
                              </span>
                              {(job.salaryRangeMin || job.salaryRangeMax) && (
                                <span className="text-azure-500 font-bold">
                                  Salary: {job.salaryRangeMin && `KES ${job.salaryRangeMin.toLocaleString()}`}
                                  {job.salaryRangeMin && job.salaryRangeMax && ' – '}
                                  {job.salaryRangeMax && `KES ${job.salaryRangeMax.toLocaleString()}`}
                                </span>
                              )}
                              {job.applicationDeadline && (
                                <span className={cn(
                                  "flex items-center gap-1.5 font-medium",
                                  isUrgent || new Date(job.applicationDeadline) < now ? "text-danger-600 font-bold" : "text-muted-foreground"
                                )}>
                                  <Clock className="h-4 w-4" />
                                  {new Date(job.applicationDeadline) < now ? (
                                    'Expired'
                                  ) : daysLeft !== null ? (
                                    daysLeft === 0 ? "Expires today" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                                  ) : (
                                    "No deadline"
                                  )}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 text-muted-foreground">
                                {formatJobType(job.jobType)}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                                {formatWorkType(job.workType)}
                              </Badge>
                              {job.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
                                  {tag}
                                </Badge>
                              ))}
                              {job.tags.length > 3 && (
                                <Badge className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
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
                                        "h-9 w-9 rounded-full border border-slate-100 shadow-sm",
                                        upvotedJobs.has(job.id) ? "bg-azure-500 text-white hover:bg-azure-600" : "hover:bg-azure-50 hover:text-azure-500 bg-white"
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
                                        "h-9 w-9 rounded-full border border-slate-100 shadow-sm",
                                        downvotedJobs.has(job.id) ? "bg-danger-600 text-white hover:bg-danger-700" : "hover:bg-danger-50 hover:text-danger-600 bg-white"
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
                                        flaggedJobs.has(job.id)
                                          ? "text-danger-600 bg-danger-50"
                                          : "text-slate-400 hover:text-danger-600 hover:bg-danger-50"
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
                                      <Flag className={cn("h-4 w-4", flaggedJobs.has(job.id) && "fill-current")} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Report Job</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            <div className="text-right flex-1 md:flex-none">
                              <div className="hidden md:block mb-3">
                                <span className="text-sm font-medium text-azure-500">
                                  {job.upvoteCount >= 0 ? `${job.upvoteCount} upvotes` : `${Math.abs(job.upvoteCount)} downvotes`}
                                </span>
                              </div>
                              <Button
                                variant={user?.role === 'DEVELOPER' ? 'default' : 'outline'}
                                className="w-full font-medium group/btn h-10 rounded-xl bg-azure-500 hover:bg-azure-600 text-white border-none transition-colors"
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
                  );
                })
              )}
            </div>
          </main>
        </div>
      </PageContainer>

      {/* Flag Modal */}
      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl-[2rem] p-8">
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
            <Button variant="ghost" className="rounded-xl font-medium" onClick={() => setIsFlagOpen(false)}>
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

