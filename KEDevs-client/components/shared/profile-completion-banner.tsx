'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Rocket, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProfileCompletionBanner() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const completion = useMemo(() => {
    if (!profile) return 0;
    
    let score = 0;
    if (user?.role === 'DEVELOPER') {
      // 5 fields, 20% each
      if (profile.bio) score += 20;
      if (profile.skills?.length > 0) score += 20;
      if (profile.githubUrl || profile.linkedinUrl) score += 20;
      if (profile.projects?.length > 0) score += 20;
      if (profile.profilePhoto || profile.profileImageUrl) score += 20;
    } else if (user?.role === 'EMPLOYER') {
      if (profile.companyBio || profile.about) score += 25;
      if (profile.logoUrl || profile.companyLogoUrl) score += 25;
      if (profile.industry || profile.industrySector) score += 25;
      if (profile.companyWebsite) score += 25;
    }
    return score;
  }, [profile, user]);

  if (!isVisible || completion >= 100) return null;

  return (
    <div className="bg-teal text-white p-3 shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3 ml-4">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-medium">
          🚀 Your profile is <span className="font-bold">{completion}%</span> complete. 
          Complete it to be <span className="underline decoration-white/40">5x more likely</span> to be noticed!
        </p>
      </div>
      
      <div className="flex items-center gap-4 mr-4">
        <Button 
          variant="outline" 
          size="sm"
          className="text-white border-white hover:bg-white hover:text-teal h-8 text-xs px-4"
          onClick={() => router.push('/profile/me')}
        >
          Complete Profile
        </Button>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
