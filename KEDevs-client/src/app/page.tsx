'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Building2, 
  Users,
  MapPin,
  Clock,
  Sparkles,
  Mail,
  Phone,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import SpotlightSection from '@/components/home/SpotlightSection';
import { jobService } from '@/services/jobService';
import { developerService } from '@/services/developerService';
import { JobSummary, DeveloperSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/lib/constants';

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<JobSummary[]>([]);
  const [spotlightDevs, setSpotlightDevs] = useState<DeveloperSummary[]>([]);
  const [randomJob, setRandomJob] = useState<JobSummary | null>(null);
  const [randomDev, setRandomDev] = useState<DeveloperSummary | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingDevs, setIsLoadingDevs] = useState(true);
  const [dayDev, setDayDev] = useState<any>(null);
  const [weekDev, setWeekDev] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch Jobs
        const jobsResponse = await jobService.getPublicJobs(0, 3);
        if (jobsResponse.success) {
          setFeaturedJobs(jobsResponse.data.content);
        }
        setIsLoadingJobs(false);

        // Fetch Developers
        let devs: DeveloperSummary[] = [];
        const spotlightResponse = await developerService.getCurrentSpotlight();
        
        if (spotlightResponse.success) {
          const { daySlot, weekSlot } = spotlightResponse.data;
          setDayDev(daySlot);
          setWeekDev(weekSlot);

          [daySlot, weekSlot].forEach(slot => {
            if (slot && !devs.some(d => d.id === slot.developerId)) {
              devs.push({
                id: slot.developerId,
                firstName: slot.developerName.split(' ')[0],
                lastName: slot.developerName.split(' ')[1] || '',
                profilePhoto: slot.profilePhoto,
                currentLastRole: slot.currentLastRole,
                skills: slot.featuredProjects && slot.featuredProjects.length > 0
                  ? (Array.isArray(slot.featuredProjects[0].techStack)
                      ? slot.featuredProjects[0].techStack
                      : typeof (slot.featuredProjects[0].techStack as any) === 'string'
                        ? (slot.featuredProjects[0].techStack as any).split(',')
                        : [])
                  : [],
                availabilityStatus: 'AVAILABLE',
                isVerified: slot.isVerified,
                locationCity: slot.locationCity || 'Nairobi',
                locationCountry: slot.locationCountry || 'Kenya'
              });
            }
          });
        }

        const publicResponse = await developerService.getPublicDevelopers(0, 20);
        if (publicResponse.success) {
          const publicDevs = publicResponse.data.content;
          const filteredPublic = publicDevs.filter((pd: any) => !devs.some(d => d.id === pd.id));
          const shuffled = [...filteredPublic].sort(() => 0.5 - Math.random());
          const combined = [...devs, ...shuffled];
          const uniqueDevs = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          setSpotlightDevs(uniqueDevs.slice(0, 5));
        }

        setIsLoadingDevs(false);
      } catch (err) {
        console.error('Failed to fetch landing page data:', err);
        setError('Failed to load content.');
        setIsLoadingJobs(false);
        setIsLoadingDevs(false);
      }
    };

    fetchLandingData();
  }, []);

  useEffect(() => {
    if (featuredJobs.length > 0) {
      const randomJobIdx = Math.floor(Math.random() * featuredJobs.length);
      setRandomJob(featuredJobs[randomJobIdx]);
    }
  }, [featuredJobs]);

  useEffect(() => {
    if (spotlightDevs.length > 0) {
      const randomDevIdx = Math.floor(Math.random() * spotlightDevs.length);
      setRandomDev(spotlightDevs[randomDevIdx]);
    }
  }, [spotlightDevs]);

  const formatJobType = (type: string) => {
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col">
      <Hero randomJob={randomJob} randomDev={randomDev} />

      {/* Featured Jobs Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className={cn(LAYOUT.maxWidth, "mx-auto", LAYOUT.padding)}>
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Opportunities</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Spotlight <span className="text-primary">Jobs</span>
              </h2>
              <p className="text-muted-foreground max-w-lg">
                The most upvoted and newest jobs currently available for developers in Kenya.
              </p>
            </div>
            <Button variant="ghost" className="font-bold group" asChild>
              <Link href="/jobs">
                View Jobs Board <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", SPACING.cards)}>
            {isLoadingJobs ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                  <CardHeader>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-3/4 mt-4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredJobs.map((job) => (
                <Card key={job.id} className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="font-bold border-muted-foreground/20 text-muted-foreground uppercase text-[10px]">
                        {formatJobType(job.jobType)}
                      </Badge>
                      {job.status === 'OPEN' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <Link href={`/jobs/${job.id}`} className="group-hover:text-primary transition-colors">
                      <h3 className="text-xl font-bold leading-tight mb-1">{job.title}</h3>
                    </Link>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {job.companyName} • {job.locationCity}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center bg-muted/10">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{job.workType}</span>
                    <Button variant="link" className="p-0 h-auto font-bold text-foreground group/btn" asChild>
                      <Link href={`/jobs/${job.id}`}>
                        Apply <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Spotlight Section */}
      <SpotlightSection dayDev={dayDev} weekDev={weekDev} loading={isLoadingDevs} />

      {/* Developer Directory Preview Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className={cn(LAYOUT.maxWidth, "mx-auto", LAYOUT.padding)}>
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Talent Directory</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Top <span className="text-primary">Developers</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Connect with Kenya's most skilled engineers and designers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingDevs ? (
              [1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="text-center p-8 border-border/50">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto mb-6" />
                  <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </Card>
              ))
            ) : (
              spotlightDevs.map((dev) => (
                <Card key={dev.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden">
                  <CardContent className="p-8 text-center flex-1">
                    <Link href={`/developers/${dev.id}`} className="inline-block relative mb-6">
                      <Avatar className="h-20 w-20 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm mx-auto">
                        <AvatarImage src={dev.profilePhoto} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                          {dev.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {dev.isVerified && (
                        <div className="absolute -bottom-1 right-[calc(50%-40px)] bg-background rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary fill-primary text-white" />
                        </div>
                      )}
                    </Link>
                    
                    <div className="mb-4">
                      <Link href={`/developers/${dev.id}`}>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                          {dev.firstName} {dev.lastName}
                        </h3>
                      </Link>
                      <p className="text-sm font-semibold text-muted-foreground">{dev.currentLastRole}</p>
                    </div>

                    <Badge 
                      variant={dev.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}
                      className={cn(
                        "mb-6 text-[10px] uppercase font-black px-2 shadow-sm",
                        dev.availabilityStatus === 'AVAILABLE' ? "bg-emerald-500 hover:bg-emerald-500" : ""
                      )}
                    >
                      {dev.availabilityStatus.replace('_', ' ')}
                    </Badge>
                    
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
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-left">
                      <MapPin className="h-3 w-3" />
                      {dev.locationCity}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary">
                        <Bookmark className="h-4 w-4" />
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
            )}
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" className="h-14 px-10 font-black rounded-2xl shadow-xl shadow-primary/20" asChild>
              <Link href="/developers">Browse Developer Directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 border-[40px] border-white rounded-full" />
          <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-64 h-64 border-[30px] border-white rounded-full" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black text-primary-foreground mb-6 tracking-tight">Ready to grow your team?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-12 leading-relaxed font-medium">
            Join hundreds of companies hiring top Kenyan developers every day. Post your first job for free.
          </p>
          <Button size="lg" variant="secondary" className="h-16 px-12 text-lg font-black rounded-2xl shadow-2xl shadow-black/20 group" asChild>
            <Link href="/register">
              Post a Job for Free <Sparkles className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

