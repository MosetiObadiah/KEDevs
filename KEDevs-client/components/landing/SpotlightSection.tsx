'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentSpotlight } from '@/lib/api/spotlight';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SpotlightSection() {
  const { data: spotlightData, isLoading } = useQuery({
    queryKey: ['spotlight', 'current'],
    queryFn: getCurrentSpotlight,
  });

  const devOfDay = spotlightData?.daySlot;
  const devOfWeek = spotlightData?.weekSlot;

  const SpotlightCard = ({ title, slot, fallbackLabel }: { title: string; slot?: any; fallbackLabel: string }) => {
    const initials = slot?.developerName
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';

    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group">
        <CardContent className="p-0">
          <div className="p-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {title}
              </Badge>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
            </div>

            {slot ? (
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 ring-4 ring-yellow-500/20 border-2 border-white/10">
                  <AvatarImage src={slot.profilePhoto} />
                  <AvatarFallback className="bg-[#52796F] text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-white mb-1">{slot.developerName}</h3>
                <p className="text-[#84A98C] text-sm mb-4">{slot.currentLastRole || 'Full Stack Developer'}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {slot.featuredProjects?.slice(0, 3).map((project: any) => (
                    <Badge key={project.title} variant="outline" className="border-white/10 text-white/60 text-[10px]">
                      {project.title}
                    </Badge>
                  ))}
                </div>
                <Link href={`/login?from=/developers/${slot.developerId}`} className="w-full">
                  <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group/btn">
                    View Profile
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-10 opacity-40">
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{fallbackLabel}</h3>
                <p className="text-sm text-white/40 mb-6">This slot is currently open for booking.</p>
                <Link href="/register">
                  <button className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 text-xs transition-all">
                    Claim this spot
                  </button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="spotlight" className="py-24 px-6 bg-[#2F3E46] relative overflow-hidden">
      {/* Animated background background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#52796F] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Hall of Fame
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">Developer Spotlight</h2>
          <p className="text-[#CAD2C5]/60 text-lg max-w-2xl mx-auto">
            Meet the most active and talented developers in our community this week.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {isLoading ? (
            <>
              <div className="h-[400px] rounded-3xl bg-white/5 animate-pulse" />
              <div className="h-[400px] rounded-3xl bg-white/5 animate-pulse" />
            </>
          ) : (
            <>
              <SpotlightCard title="Dev of the Day" slot={devOfDay} fallbackLabel="Daily Featured Developer" />
              <SpotlightCard title="Dev of the Week" slot={devOfWeek} fallbackLabel="Weekly Top Talent" />
            </>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/register">
            <p className="text-[#CAD2C5]/40 text-sm hover:text-yellow-500 transition-colors cursor-pointer inline-flex items-center gap-2 group">
              Want to be featured here?
              <span className="font-bold underline decoration-yellow-500/30 group-hover:decoration-yellow-500">Learn more</span>
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
