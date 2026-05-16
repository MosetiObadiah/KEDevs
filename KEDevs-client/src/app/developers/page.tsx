'use client';
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
  Flag
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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

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

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const payload = {
        availabilityStatus: selectedAvails.length > 0 ? selectedAvails[0] as any : undefined,
        preferredWorkType: selectedWorkTypes.length > 0 ? selectedWorkTypes[0] as any : undefined,
        yearsOfExperience: selectedExperiences.length > 0 ? selectedExperiences[0] as any : undefined,
        locationCity: location !== 'All' ? location : undefined,
        isVerified: isVerifiedOnly ? true : undefined,
        currentLastRole: searchTerm || undefined
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/v1/developers/public/export?format=${format}`, {
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
      a.download = `developers.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
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

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <PageLayoutContainer>
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
        </div>
        
        <div className="hidden print:block mb-8 border-b pb-4">
           <h1 className="text-2xl font-black text-black">KEDevs Talent Report</h1>
           <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className={cn("grid grid-cols-1 lg:grid-cols-4", SPACING_CONST.cards)}>
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 print:hidden">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Talent</h3>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Availability</label>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Experience Level</label>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Work Preference</label>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Location</SelectItem>
                      {uniqueLocations.map(loc => (
                         <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Skills</label>
                  <div className="flex flex-wrap gap-1 mb-2 max-h-32 overflow-y-auto p-1 bg-muted/5 rounded-lg border border-border/20">
                    {Array.from(new Set(devs.flatMap(d => d.skills))).sort().map(skill => (
                      <Badge 
                        key={skill} 
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className={cn(
                          "text-[9px] cursor-pointer transition-all",
                          selectedSkills.includes(skill) ? "bg-primary text-primary-foreground" : "hover:bg-primary/5"
                        )}
                        onClick={() => {
                          if (selectedSkills.includes(skill)) {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          } else {
                            setSelectedSkills([...selectedSkills, skill]);
                          }
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Languages</label>
                  <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto p-1 bg-muted/5 rounded-lg border border-border/20">
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
                    <Label htmlFor="verified" className="text-sm font-bold cursor-pointer">Verified Only</Label>
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
                    className="w-full text-xs font-bold text-muted-foreground mt-2"
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
          <main className="lg:col-span-3 print:col-span-full">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              ) : filteredDevs.length > 0 ? (
                filteredDevs.map((dev) => (
                  <Card key={dev.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden">
                    <CardContent className="p-8 text-center flex-1">
                      <Link href={`/developers/${dev.id}`} className="inline-block relative mb-6">
                        <Avatar className="h-20 w-20 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm">
                          <AvatarImage src={dev.profilePhoto} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                            {dev.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {dev.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                            <BadgeCheck className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </Link>

                      <div className="flex justify-center mb-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black px-3 py-1 rounded-full">
                          {dev.numberOfProjects || 0} {dev.numberOfProjects === 1 ? 'Project' : 'Projects'}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <Link href={`/developers/${dev.id}`}>
                          <h3 className="text-xl font-black group-hover:text-primary transition-colors mb-1 tracking-tight">
                            {toTitleCase(`${dev.firstName} ${dev.lastName}`)}
                          </h3>
                        </Link>
                        <p className="text-sm font-semibold text-muted-foreground">{dev.currentLastRole}</p>
                      </div>

                      <div className="flex flex-wrap justify-center items-center gap-1.5 mb-6">
                        <Badge 
                          variant={dev.availabilityStatus === 'OPEN_TO_OFFERS' ? 'default' : 'secondary'}
                          className={cn(
                            "text-[9px] uppercase font-black px-2 shadow-sm tracking-wider",
                            dev.availabilityStatus === 'OPEN_TO_OFFERS' ? "bg-emerald-500 hover:bg-emerald-500" : ""
                          )}
                        >
                          {formatAvailability(dev.availabilityStatus)}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-6 text-center">
                        {dev.yearsOfExperience && (
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                            Years of Experience: <span className="text-foreground font-bold">{formatExperience(dev.yearsOfExperience)}</span>
                          </p>
                        )}
                        {dev.preferredWorkType && (
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                            Work Preference: <span className="text-foreground font-bold">{formatWorkType(dev.preferredWorkType)}</span>
                          </p>
                        )}
                      </div>
                      
                      {dev.endorsementCount > 0 && (
                        <div className="mb-6">
                          <p className="text-[10px] font-black text-primary uppercase tracking-tighter">
                            {dev.endorsementCount} {dev.endorsementCount === 1 ? 'Endorsement' : 'Endorsements'}
                          </p>
                        </div>
                      )}
                      
                      {isLoggedIn && (user?.role === 'EMPLOYER' || user?.id === dev.id) && (
                        <div className="flex justify-center gap-2 mb-6">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <Mail className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Email</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>LinkedIn Profile</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <Phone className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Phone</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}

                      <div className="flex flex-wrap justify-center gap-1.5">
                        {dev.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-[10px] py-0 px-2 font-medium bg-muted/30 border-muted">
                            {skill}
                          </Badge>
                        ))}
                        {dev.skills.length > 3 && (
                          <Badge variant="ghost" className="text-[9px] font-bold text-muted-foreground p-0">
                            +{dev.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest print:hidden">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {formatLocation(dev.locationCity)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:text-destructive"
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
                        <Button size="sm" className="h-8 px-3 font-bold group/btn" asChild>
                          <Link href={`/developers/${dev.id}`}>
                            View <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FilterX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">No developers found</h3>
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
          <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
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
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => {
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

