'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentSpotlight } from '@/lib/api/spotlight';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, ArrowRight, Zap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

export function SpotlightBanner() {
  const { data: spotlightData, isLoading } = useQuery({
    queryKey: ['spotlight', 'current'],
    queryFn: getCurrentSpotlight,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-24 rounded-3xl mb-8" />;
  }

  const daySlot = spotlightData?.daySlot;
  const weekSlot = spotlightData?.weekSlot;

  if (!daySlot && !weekSlot) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {daySlot && <MiniSpotlightCard slot={daySlot} label="Day" icon={<Zap className="w-3 h-3" />} />}
      {weekSlot && <MiniSpotlightCard slot={weekSlot} label="Week" icon={<Calendar className="w-3 h-3" />} />}
    </div>
  );
}

function MiniSpotlightCard({ slot, label, icon }: { slot: any, label: string, icon: React.ReactNode }) {
  const initials = slot.developerName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  return (
    <Link href={`/developers/${slot.developerId}`} className="block group">
      <div className="bg-[#2F3E46] rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-amber-500/30 transition-all shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
        
        <Avatar className="w-12 h-12 ring-2 ring-amber-500/20 shrink-0">
          <AvatarImage src={slot.profilePhoto} />
          <AvatarFallback className="bg-[#52796F] text-white text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-white text-sm truncate">{slot.developerName}</h4>
            <Badge className="h-4 px-1.5 text-[8px] bg-amber-500/20 text-amber-500 border-amber-500/30 font-bold uppercase tracking-tighter">
              <span className="mr-1">{icon}</span>
              Dev of {label}
            </Badge>
          </div>
          <p className="text-[#84A98C] text-[10px] font-medium truncate">
            {slot.currentLastRole || 'Top Talent'}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
