'use client';
import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ExternalLink, 
  Code, 
  ArrowRight, 
  Zap, 
  Trophy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SpotlightSectionProps {
  dayDev: any;
  weekDev: any;
  loading: boolean;
  hideTitle?: boolean;
}

function EmptySpotlightCard({ type }: { type: string }) {
  const { user } = useAuth();

  const handleClaim = (e: React.MouseEvent) => {
    if (user?.role === 'EMPLOYER') {
      e.preventDefault();
      toast.error('Claiming spotlight spots is only available for developers.', {
        description: 'Build your employer brand by posting quality job opportunities!'
      });
    }
  };

  return (
    <Card className="h-full min-h-[400px] border-2 border-dashed border-muted hover:border-primary/50 transition-colors bg-muted/20 flex flex-col items-center justify-center text-center p-8 relative">
      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm mb-6">
        <Zap className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">Slot Available</h3>
      <p className="text-sm text-muted-foreground max-w-[260px] mb-8 leading-relaxed">
        This spotlight spot is currently vacant. Verified developers can claim it to boost their visibility.
      </p>
      <Button variant="outline" className="font-semibold" asChild onClick={handleClaim}>
        <Link href="/profile/me?buySpotlight=true">Claim This Spot</Link>
      </Button>
    </Card>
  );
}

function SpotlightBigCard({ dev, type }: { dev: any, type: string }) {
  const project = dev.featuredProjects?.[0];

  return (
    <Card className="h-full border-border shadow-xl shadow-primary/5 overflow-hidden group">
      <div className="grid grid-cols-1 md:grid-cols-5 h-full">
        {/* Left: Dev Info */}
        <div className="md:col-span-2 p-8 bg-muted/30 flex flex-col items-center text-center">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-6">
            <AvatarImage src={dev.profilePhoto} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">
              {dev.developerName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="mb-4">
            <h3 className="text-xl font-bold flex items-center justify-center gap-1.5 mb-1">
              {dev.developerName}
              {dev.isVerified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">{dev.currentLastRole}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed line-clamp-3">
            {dev.bio || "Full-stack developer specializing in building scalable web applications."}
          </p>
          <Button className="w-full font-bold group" asChild>
            <Link href={`/developers/${dev.developerId || dev.id}`}>
              View Profile <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Right: Featured Project */}
        <div className="md:col-span-3 p-8 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Featured Project</span>
          
          {project ? (
            <div className="flex flex-col h-full">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border mb-6 group/img">
                {project.screenshotUrl ? (
                  <img src={project.screenshotUrl} alt={project.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground opacity-20">
                    <Code className="h-16 w-16" />
                  </div>
                )}
              </div>
              <h4 className="text-lg font-bold mb-2">{project.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {(Array.isArray(project.techStack) ? project.techStack : (project.techStack?.split(',') || [])).slice(0, 4).map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                    {tech.trim()}
                  </Badge>
                ))}
              </div>
              {project.projectUrl && (
                <Button variant="ghost" size="sm" className="w-fit -ml-2 text-primary font-bold hover:text-primary hover:bg-primary/5" asChild>
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" /> Visit Live Project
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
              <Code className="h-12 w-12 mb-2" />
              <p className="text-sm">No featured project listed yet.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function SpotlightSection({ dayDev, weekDev, loading, hideTitle }: SpotlightSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        {!hideTitle && (
          <div className="flex flex-col items-start mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Featured <span className="text-primary">Talent</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Exceptional Kenyan developers currently in the spotlight.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {loading ? (
            <>
              <Skeleton className="h-[400px] rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
            </>
          ) : (
            <>
              <div>
                {dayDev ? (
                  <SpotlightBigCard dev={dayDev} type="Developer of the Day" />
                ) : (
                  <EmptySpotlightCard type="Developer of the Day" />
                )}
              </div>
              <div>
                {weekDev ? (
                  <SpotlightBigCard dev={weekDev} type="Developer of the Week" />
                ) : (
                  <EmptySpotlightCard type="Developer of the Week" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

