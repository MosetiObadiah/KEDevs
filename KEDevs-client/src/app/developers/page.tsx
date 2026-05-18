'use client';
import { formatDateString } from '@/lib/utils';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  MapPin,
  FilterX,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Briefcase,
  Loader2,
  BadgeCheck,
  ExternalLink,
  ArrowRight,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  Star,
  Flag,
  ChevronDown,
  Plus,
  X
} from 'lucide-react';
import { PageContainer as PageLayoutContainer } from '@/components/layout/PageContainer';
import { LAYOUT as LAYOUT_CONST, SPACING as SPACING_CONST, TYPOGRAPHY as TYPOGRAPHY_CONST } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { DeveloperSummary } from '@/lib/types';
import { cn, formatExperience, formatWorkType, formatAvailability, formatLocation, toTitleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AVAILABILITY_STATUSES = [
  { value: 'OPEN_TO_OFFERS', label: 'Open to Offers' },
  { value: 'NOT_AVAILABLE', label: 'Not Available' }
];

const WORK_TYPES = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' }
];

const EXPERIENCE_RANGES = [
  { value: 'ZERO_TO_ONE', label: '0 - 1 Years' },
  { value: 'ONE_TO_THREE', label: '1 - 3 Years' },
  { value: 'THREE_TO_FIVE', label: '3 - 5 Years' },
  { value: 'FIVE_TO_TEN', label: '5 - 10 Years' },
  { value: 'TEN_PLUS', label: '10+ Years' }
];

const KENYA_CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Naivasha', 'Nyeri', 'Machakos'
];

function DevelopersPageContent() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [devs, setDevs] = useState<DeveloperSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const searchTerm = searchParams.get('search') || '';
  const [selectedAvails, setSelectedAvails] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [location, setLocation] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recently-active');

  // Flagging state
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagContent, setFlagContent] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const [selectedDevId, setSelectedDevId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getPublicDevelopers(0, 50);
        if (response.success) {
          setDevs(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch developers. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevs();
  }, []);

  const uniqueLocations = Array.from(new Set([...KENYA_CITIES, ...devs.map(d => d.locationCity).filter(Boolean)])).sort();

  const filteredDevs = devs.filter(dev =>
    (
      `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.currentLastRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ) &&
    (selectedAvails.length === 0 || selectedAvails.includes(dev.availabilityStatus)) &&
    (location === 'All' || dev.locationCity === location) &&
    (selectedWorkTypes.length === 0 || (dev.preferredWorkType && selectedWorkTypes.includes(dev.preferredWorkType))) &&
    (selectedExperiences.length === 0 || (dev.yearsOfExperience && selectedExperiences.includes(dev.yearsOfExperience))) &&
    (selectedSkills.length === 0 || dev.skills.some(s => selectedSkills.includes(s))) &&
    (selectedLanguages.length === 0 || dev.languages.some(l => selectedLanguages.includes(l))) &&
    (!isVerifiedOnly || dev.isVerified)
  );

  const sortedDevs = [...filteredDevs].sort((a, b) => {
    if (sortBy === 'most-endorsed') {
      return (b.endorsementCount || 0) - (a.endorsementCount || 0);
    }
    if (sortBy === 'most-projects') {
      return (b.numberOfProjects || 0) - (a.numberOfProjects || 0);
    }
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        const payload = {
          availabilityStatus: selectedAvails.length > 0 ? selectedAvails[0] as any : undefined,
          preferredWorkType: selectedWorkTypes.length > 0 ? selectedWorkTypes[0] as any : undefined,
          yearsOfExperience: selectedExperiences.length > 0 ? selectedExperiences[0] as any : undefined,
          locationCity: location !== 'All' ? location : undefined,
          isVerified: isVerifiedOnly ? true : undefined,
          currentLastRole: searchTerm || undefined
        };

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${API_URL}/api/v1/developers/public/export?format=pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `developers_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF Report generated successfully');
      } else {
        const headers = ['FullName', 'CurrentRole', 'Availability', 'Location', 'Experience', 'Skills'];
        const rows = filteredDevs.map(d => [
          `"${d.firstName || ''} ${d.lastName || ''}"`,
          `"${d.currentLastRole || ''}"`,
          `"${d.availabilityStatus || ''}"`,
          `"${d.locationCity || ''}"`,
          `"${d.yearsOfExperience || 0} years"`,
          `"${(d.skills || []).join(' | ')}"`
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `developers_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV Exported successfully');
      }
    } catch (err) {
      console.error("Export failed", err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFlagDeveloper = async () => {
    if (!selectedDevId) return;
    if (!flagContent.trim()) {
      toast.error('Reason for reporting is required.');
      return;
    }
    setIsSubmittingFlag(true);
    try {
      const response = await developerService.flagDeveloper(selectedDevId, flagContent.trim());
      if (response.success) {
        toast.success('Profile reported to moderation team.');
        setIsFlagOpen(false);
        setFlagContent('');
        setSelectedDevId(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to report developer. You may have already flagged them.');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const availableSkills = Array.from(new Set(devs.flatMap(d => d.skills))).sort();
  const filteredSkillsList = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <PageLayoutContainer className="max-w-full px-8 xl:px-16">
        <div className="flex justify-end items-center gap-3 mb-8 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-medium border-primary/20 hover:bg-primary/5 h-12 px-6" disabled={isExporting}>
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
        </div>

        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-black">KEDevs Talent Report</h1>
          <p className="text-sm text-slate-500">Generated on {formatDateString(new Date())}</p>
        </div>

        <div className={cn("grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 items-start", SPACING_CONST.cards)}>
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 print:hidden sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Filter Developers</h3>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Availability</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {AVAILABILITY_STATUSES.map(avail => (
                      <div key={avail.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avail-${avail.value}`}
                          checked={selectedAvails.includes(avail.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAvails([...selectedAvails, avail.value]);
                            } else {
                              setSelectedAvails(selectedAvails.filter(a => a !== avail.value));
                            }
                          }}
                        />
                        <Label htmlFor={`avail-${avail.value}`} className="text-xs font-medium cursor-pointer">{avail.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Experience Level</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {EXPERIENCE_RANGES.map(exp => (
                      <div key={exp.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exp-${exp.value}`}
                          checked={selectedExperiences.includes(exp.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExperiences([...selectedExperiences, exp.value]);
                            } else {
                              setSelectedExperiences(selectedExperiences.filter(e => e !== exp.value));
                            }
                          }}
                        />
                        <Label htmlFor={`exp-${exp.value}`} className="text-xs font-medium cursor-pointer">{exp.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Work Preference</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {WORK_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wt-${type.value}`}
                          checked={selectedWorkTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedWorkTypes([...selectedWorkTypes, type.value]);
                            } else {
                              setSelectedWorkTypes(selectedWorkTypes.filter(t => t !== type.value));
                            }
                          }}
                        />
                        <Label htmlFor={`wt-${type.value}`} className="text-xs font-medium cursor-pointer">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-xl">
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="All">Any Location</SelectItem>
                      {uniqueLocations.map(loc => (
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
                      className="w-full flex items-center justify-between border border-border/50 bg-background text-xs h-10 px-3 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700"
                      onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
                    >
                      <span className="truncate">
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
                              className="pl-8 text-xs h-8.5 rounded-xl border-border/50 focus-visible:ring-primary/20"
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
                                <span className="truncate">Add custom skill: "{skillSearch.trim()}"</span>
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
                                      id={`skill-filter-${skill}`}
                                      checked={isChecked}
                                      onCheckedChange={() => { }} // handled by div click
                                    />
                                    <label htmlFor={`skill-filter-${skill}`} className="text-xs font-medium text-slate-700 cursor-pointer truncate flex-1 select-none">
                                      {skill}
                                    </label>
                                  </div>
                                );
                              })
                            ) : (
                              !skillSearch.trim() && (
                                <p className="text-[10px] text-center text-muted-foreground py-2 font-medium">No skills found.</p>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase">Languages</label>
                  <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto p-1 bg-muted/5 rounded-xl border border-border/20">
                    {Array.from(new Set(devs.flatMap(d => d.languages || []))).sort().map(lang => (
                      <Badge
                        key={lang}
                        variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                        className={cn(
                          "text-[9px] cursor-pointer transition-all",
                          selectedLanguages.includes(lang) ? "bg-primary text-primary-foreground" : "hover:bg-primary/5"
                        )}
                        onClick={() => {
                          if (selectedLanguages.includes(lang)) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang]);
                          }
                        }}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card shadow-inner">
                  <div className="space-y-0.5">
                    <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">Verified Only</Label>
                    <p className="text-[10px] text-muted-foreground">Show only verified profiles</p>
                  </div>
                  <Checkbox
                    id="verified"
                    checked={isVerifiedOnly}
                    onCheckedChange={(checked) => setIsVerifiedOnly(checked as boolean)}
                  />
                </div>

                {(searchTerm || selectedAvails.length > 0 || selectedWorkTypes.length > 0 || selectedExperiences.length > 0 || location !== 'All' || selectedSkills.length > 0 || isVerifiedOnly) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-medium text-muted-foreground mt-2"
                    onClick={() => {
                      router.push(pathname);
                      setSelectedAvails([]);
                      setSelectedWorkTypes([]);
                      setSelectedExperiences([]);
                      setSelectedSkills([]);
                      setLocation('All');
                      setIsVerifiedOnly(false);
                    }}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Results Area */}
          <main className="lg:col-span-3 xl:col-span-4 print:col-span-full">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Results Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden bg-white p-4 rounded-2xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="text-navy-900 font-medium">{filteredDevs.length}</span> developer{filteredDevs.length !== 1 && 's'}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 border-slate-200 focus:ring-azure-200 text-xs h-9 rounded-xl">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recently-active">Recently Active</SelectItem>
                    <SelectItem value="most-endorsed">Most Endorsed</SelectItem>
                    <SelectItem value="most-projects">Most Projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="p-8 flex flex-col items-center border-border/50">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </Card>
                ))
              ) : sortedDevs.length > 0 ? (
                sortedDevs.map((dev) => (
                  <Card key={dev.id} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors p-5 flex flex-col items-center text-center cursor-pointer group shadow-none" onClick={() => router.push(`/developers/${dev.id}`)}>
                    {/* Avatar */}
                    <div className="relative mb-2 shrink-0">
                      <Avatar className="w-14 h-14 border border-slate-100 mx-auto">
                        <AvatarImage src={dev.profilePhoto} />
                        <AvatarFallback className="bg-navy-700 text-white text-xl font-medium uppercase">
                          {dev.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Verified badge — only show if is_verified = true */}
                      {dev.isVerified && (
                        <div className="absolute bottom-0 right-[calc(50%-1.75rem)] w-5 h-5 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center shadow-sm z-10">
                          <BadgeCheck className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Projects — only show if > 0 */}
                    {dev.numberOfProjects > 0 ? (
                      <p className="text-xs text-azure-500 font-medium mb-1">{dev.numberOfProjects} {dev.numberOfProjects === 1 ? 'Project' : 'Projects'}</p>
                    ) : (
                      <div className="h-4 mb-1" />
                    )}

                    <h3 className="text-sm font-medium text-navy-900 mb-0.5 truncate max-w-full capitalize">
                      {toTitleCase(`${dev.firstName} ${dev.lastName}`)}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 truncate max-w-full">{dev.currentLastRole}</p>

                    {/* Status badge */}
                    <div className="mb-3 shrink-0">
                      {dev.availabilityStatus === 'OPEN_TO_OFFERS' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-50 text-success-600">Open to Offers</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Not Available</span>
                      )}
                    </div>

                    {/* Meta */}
                    <p className="text-xs text-slate-500 mb-1">
                      {formatExperience(dev.yearsOfExperience)} · <span className="text-slate-700 font-medium">{formatWorkType(dev.preferredWorkType)}</span>
                    </p>

                    {/* Endorsements — only if > 0 */}
                    {dev.endorsementCount > 0 ? (
                      <p className="text-xs text-azure-500 font-medium my-1">{dev.endorsementCount} {dev.endorsementCount === 1 ? 'Endorsement' : 'Endorsements'}</p>
                    ) : (
                      <div className="h-4 my-1" />
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 justify-center my-2 shrink-0">
                      {dev.skills.slice(0, 3).map((skill, idx) => (
                        <span key={`${skill}-${idx}`} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs truncate max-w-[80px]">
                          {skill}
                        </span>
                      ))}
                      {dev.skills.length > 3 && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                          +{dev.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="w-full mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2 uppercase tracking-widest text-[10px] font-medium text-slate-400 print:hidden" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-[60%]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="capitalize truncate">{formatLocation(dev.locationCity)}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:text-danger-600 hover:bg-danger-50 transition-colors"
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error("Please sign in to report profiles");
                              router.push('/login');
                              return;
                            }
                            setSelectedDevId(dev.id);
                            setIsFlagOpen(true);
                          }}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-azure-500 hover:bg-azure-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors h-8 border-none" asChild>
                          <Link href={`/developers/${dev.id}`}>
                            View <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FilterX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">No developers found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                  </div>
                  {(searchTerm || selectedAvails.length > 0 || selectedWorkTypes.length > 0 || selectedExperiences.length > 0 || location !== 'All' || isVerifiedOnly) && (
                    <Button variant="outline" onClick={() => {
                      router.push(pathname);
                      setSelectedAvails([]);
                      setSelectedWorkTypes([]);
                      setSelectedExperiences([]);
                      setLocation('All');
                      setIsVerifiedOnly(false);
                    }}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Flag Modal */}
        <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-xl-[2rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <Flag className="h-6 w-6" />
                </div>
                Report Profile
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Please describe why you are reporting this profile. Our moderation team will review this report.
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
                  placeholder="e.g. Inappropriate content, spam, or fake profile..."
                  className="min-h-[120px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-destructive/20"
                  value={flagContent}
                  onChange={(e) => setFlagContent(e.target.value.slice(0, 500))}
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end gap-3">
              <Button variant="ghost" className="rounded-xl font-medium" onClick={() => {
                setIsFlagOpen(false);
                setSelectedDevId(null);
              }}>
                Cancel
              </Button>
              <Button
                className="rounded-xl font-black px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleFlagDeveloper}
                disabled={isSubmittingFlag || !flagContent.trim()}
              >
                {isSubmittingFlag ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : 'Submit Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayoutContainer>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DevelopersPageContent />
    </Suspense>
  );
}

