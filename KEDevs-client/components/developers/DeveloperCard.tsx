'use client';

import { useState } from 'react';
import { UserDtos } from '@/lib/types/user-dtos';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, CheckCircle2, Bookmark, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/hooks';
import { PaywallModal } from '@/components/shared/paywall-modal';

interface DeveloperCardProps {
  developer: UserDtos.DeveloperSummaryResponse;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  const { user, profile } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const firstName = developer?.firstName || '';
  const lastName = developer?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === 'EMPLOYER') {
      if (!profile?.isProAccount) {
        setShowPaywall(true);
      } else {
        // Toggle bookmark (would connect to mutation in a real app)
        setIsBookmarked(!isBookmarked);
      }
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-secondary hover:border-primary transition-all group hover:shadow-xl hover:shadow-primary/5 rounded-3xl bg-white relative">
        {/* Spotlight Badge */}
        {developer.isSpotlighted && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-200 text-amber-900 px-4 py-1 rounded-bl-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-900" /> Spotlight
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="w-20 h-20 rounded-2xl shadow-inner border-2 border-slate-50">
              <AvatarImage src={developer.profilePhoto} alt={`${developer.firstName} ${developer.lastName}`} className="object-cover" />
              <AvatarFallback className="bg-secondary text-foreground font-bold text-xl rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {developer.firstName} {developer.lastName}
                </h3>
                <div className="flex items-center gap-2">
                  {developer.isVerified && (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Verified</span>
                    </Badge>
                  )}
                  {user?.role === 'EMPLOYER' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 rounded-full transition-colors ${isBookmarked ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-secondary/20'}`}
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4 font-medium">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{developer.currentLastRole || 'Software Developer'}</span>
                </div>
                {(developer.locationCity || developer.locationCountry) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">
                      {[developer.locationCity, developer.locationCountry].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {developer.skills?.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-secondary/20 text-foreground hover:bg-secondary/40 border-transparent font-medium px-3"
                  >
                    {skill}
                  </Badge>
                ))}
                {(developer.skills?.length || 0) > 4 && (
                  <Badge variant="outline" className="border-secondary text-muted-foreground px-2 font-bold">
                    +{(developer.skills?.length || 0) - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-secondary/30 flex items-center justify-between">
            <Badge className={`
              ${developer.availabilityStatus === 'AVAILABLE_NOW' ? 'bg-green-50 text-green-700 border-green-100' :
                developer.availabilityStatus === 'OPEN_TO_OFFERS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-slate-50 text-slate-600 border-slate-100'}
              px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border
            `}>
              {developer.availabilityStatus?.replace(/_/g, ' ') || 'UNKNOWN'}
            </Badge>

            <Link href={`/developers/${developer.id}`}>
              <Button variant="ghost" className="text-primary hover:text-[#2a6f4d] hover:bg-secondary/20 font-bold text-sm h-9 px-4 rounded-xl">
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        title="Bookmarks are a PRO Feature"
        description="Upgrade to KEDevs PRO to save developer profiles and easily access them later."
      />
    </>
  );
}

export function DeveloperSkeleton() {
  return (
    <Card className="overflow-hidden border-secondary rounded-3xl bg-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-50 rounded-lg w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-50 rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-slate-50 rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-slate-50 rounded-full w-14 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between">
          <div className="h-6 bg-slate-50 rounded-full w-24 animate-pulse" />
          <div className="h-9 bg-slate-50 rounded-xl w-28 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
