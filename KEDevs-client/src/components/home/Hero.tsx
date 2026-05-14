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
  if (num >= 1000) {
    return (Math.floor(num / 100) / 10).toFixed(1).replace('.0', '') + 'k+';
  }
  if (num >= 100) {
    return (Math.floor(num / 50) * 50) + '+';
  }
  if (num >= 10) {
    return (Math.floor(num / 10) * 10) + '+';
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
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-secondary/50 text-secondary-foreground border-none">
              Kenya's Tech Talent Hub
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Find Kenyan tech <span className="text-primary">talent</span> and <span className="text-primary">opportunity</span>.
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Browse jobs from top companies, showcase your skills to employers, and connect with
              Kenya's best developers. A clean, modern platform for the tech community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="h-12 px-8 font-semibold" asChild>
                <Link href="/jobs">Browse Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-semibold" asChild>
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visuals */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Developer Card Card */}
            {randomDev && (
              <Card className="absolute top-0 right-0 w-[320px] shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm z-20 hover:translate-y-[-4px] transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={randomDev.profilePhoto} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {randomDev.firstName.charAt(0)}{randomDev.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-foreground truncate">{randomDev.firstName} {randomDev.lastName}</h3>
                        {randomDev.isVerified && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{randomDev.currentLastRole}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {randomDev.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full font-semibold group" asChild>
                    <Link href={`/developers/${randomDev.id}`}>
                      View Profile <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Card Card */}
            {randomJob && (
              <Card className="absolute bottom-10 left-0 w-[340px] shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm z-10 hover:translate-y-[-4px] transition-transform duration-300">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 text-primary border-primary/20 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                    New Opportunity
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground mb-1">{randomJob.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {randomJob.companyName} • {randomJob.locationCity}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Open Position</span>
                    <Button size="sm" className="h-8 px-4 font-bold" asChild>
                      <Link href={`/jobs/${randomJob.id}`}>View</Link>
                    </Button>
                  </div>
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

