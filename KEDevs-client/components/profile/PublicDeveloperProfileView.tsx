'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MapPin, CheckCircle2, Bookmark, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { useState } from 'react';
import { PaywallModal } from '@/components/shared/paywall-modal';
import Link from 'next/link';

interface PublicDeveloperProfileViewProps {
  profileId: string;
}

export function PublicDeveloperProfileView({ profileId }: PublicDeveloperProfileViewProps) {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['developers', profileId],
    queryFn: () => profileApi.getDeveloperById(profileId),
  });

  const handleContactOrBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // Typically handled by auth guard, but just in case
      return;
    }
    if (user.role === 'EMPLOYER' && !user.isProAccount) {
      setShowPaywall(true);
    }
  };

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-6 items-center">
            {profile.profileImageUrl && (
              <img src={profile.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20" />
            )}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-black">{profile.firstName} {profile.lastName}</h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-primary" />}
                {profile.isSpotlighted && (
                  <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-transparent font-black uppercase tracking-widest text-[10px] py-1">
                    <Star className="w-3 h-3 mr-1 fill-amber-900" /> Spotlight
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.currentLastRole}</span>
                {(profile.locationCity || profile.locationCountry) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
              <p className="mt-4 text-white/80 max-w-2xl leading-relaxed">{profile.bio}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            {user?.role === 'EMPLOYER' && (
              <>
                <Button 
                  onClick={handleContactOrBookmark}
                  className="w-full bg-primary hover:bg-[#2a6f4d] text-white font-bold h-12 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Contact Developer
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleContactOrBookmark}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold h-12 rounded-xl"
                >
                  <Bookmark className="w-4 h-4 mr-2" /> Bookmark Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Skills & Languages */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: any) => (
                  <Badge key={skill.id || skill} className="bg-secondary/10 text-foreground border-transparent py-1.5 px-3">
                    {skill.name || skill}
                  </Badge>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span className="text-muted-foreground text-sm">No skills listed.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projects */}
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-4">Projects</h3>
              
              {(!profile.projects || profile.projects.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">No projects added yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects?.map((proj: any) => (
                    <div key={proj.id} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors">
                      <h4 className="font-bold text-foreground">{proj.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        title="Direct Contact is PRO"
        description="Upgrade to KEDevs PRO to unlock direct developer contact and profile bookmarking."
      />
    </div>
  );
}
