'use client';
import React from 'react';
import Link from 'next/link';
import { Briefcase, Users, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { JobSummary, DeveloperSummary, PublicStats } from '@/lib/types';

interface HeroProps {
  randomJob?: JobSummary | null;
  randomDev?: DeveloperSummary | null;
  stats?: PublicStats | null;
}

const formatCompact = (num: number): string => {
  if (num > 100) {
    return '100+';
  }
  return num.toString();
};

export const Hero = ({ randomJob, randomDev, stats }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-medium tracking-wider uppercase bg-secondary/50 text-secondary-foreground border-none">
              Kenya's Tech Talent Hub
            </Badge>
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-tight mb-6">
              Find Kenyan tech <span className="text-primary">talent</span> and <span className="text-primary">opportunity</span>.
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Browse jobs from top companies, showcase your skills to employers, and connect with
              Kenya's best developers. A clean, modern platform for the tech community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/jobs">Browse Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/register">Join the Community</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-10 border-t border-border">
              {[
                { label: 'Developers', value: stats ? formatCompact(stats.developerCount) : '...' },
                { label: 'Companies', value: stats ? formatCompact(stats.companyCount) : '...' },
                { label: 'Jobs Posted', value: stats ? formatCompact(stats.jobCount) : '...' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-medium text-foreground">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visuals */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Developer Card */}
            {randomDev && (
              <Card className="absolute top-0 right-0 w-[320px] shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm z-20 hover:translate-y-[-4px] transition-all duration-300 rounded-xl-[1.5rem]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={randomDev.profilePhoto} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-black">
                        {randomDev.firstName?.charAt(0)}{randomDev.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-medium text-foreground truncate text-sm">{randomDev.firstName} {randomDev.lastName}</h3>
                        {randomDev.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{randomDev.currentLastRole}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6 h-[22px] overflow-hidden">
                    {randomDev.skills?.slice(0, 3).map((skill, idx) => (
                      <Badge key={`${skill}-${idx}`} variant="secondary" className="text-[9px] py-0.5 px-2 font-medium uppercase tracking-wider">
                        {skill}
                      </Badge>
                    ))}
                    {(!randomDev.skills || randomDev.skills.length === 0) && (
                      <Badge variant="secondary" className="text-[9px] py-0.5 px-2 font-medium uppercase tracking-wider">
                        Developer
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full font-medium group rounded-xl h-10 border-border/50 hover:bg-primary hover:text-white transition-all" asChild>
                    <Link href={`/developers/${randomDev.id}`}>
                      View Profile <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Card */}
            {randomJob && (
              <Card className="absolute bottom-10 left-0 w-[320px] shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm z-10 hover:translate-y-[-4px] transition-all duration-300 rounded-xl-[1.5rem]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/5 text-primary font-black flex items-center justify-center">
                        <Briefcase className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-medium text-foreground truncate text-sm">{randomJob.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{randomJob.companyName} • {randomJob.locationCity}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6 h-[22px] overflow-hidden">
                    {randomJob.jobType && (
                      <Badge variant="secondary" className="text-[9px] py-0.5 px-2 font-medium uppercase tracking-wider">
                        {randomJob.jobType.replace('_', ' ')}
                      </Badge>
                    )}
                    {randomJob.workType && (
                      <Badge variant="secondary" className="text-[9px] py-0.5 px-2 font-medium uppercase tracking-wider">
                        {randomJob.workType}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full font-medium group rounded-xl h-10 border-border/50 hover:bg-primary hover:text-white transition-all" asChild>
                    <Link href={`/jobs/${randomJob.id}`}>
                      View Job <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Decorative circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-dashed border-border rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

