'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Star, 
  Send, 
  BadgeCheck, 
  ExternalLink,
  ChevronLeft,
  Loader2,
  Calendar,
  Briefcase,
  Layers,
  Sparkles,
  MessageSquareShare,
  User,
  GitBranch,
  Trophy,
  Award,
  ArrowLeft,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';
import { cn, formatExperience } from '@/lib/utils';
import { toast } from 'sonner';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PublicProfileSidebar } from '@/components/profile/PublicProfileSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DeveloperProfilePage() {
  const { profileId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [dev, setDev] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const fullName = dev ? (dev.fullName || `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || dev.publicEmail || dev.email || 'Developer') : '';

  useEffect(() => {
    const loadDeveloper = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getDeveloperProfile(profileId as string);
        if (response.success) {
          const data = response.data;
          
          // If the logged in user is viewing their own profile, redirect to private profile page
          if (isLoggedIn && user && data.userId === user.id) {
            router.replace('/profile/me');
            return;
          }

          setDev(data);
          const computedName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.publicEmail || data.email || 'Developer';
          setMessage(`Hi ${computedName}, I found your profile on KEDevs and would like to invite you to apply for an opportunity.`);
        }
      } catch (err: any) {
        setError('Unable to load developer profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeveloper();
  }, [profileId, isLoggedIn, user, router]);

  const handleContactDeveloper = async () => {
    if (!dev) return;
    setIsRequesting(true);
    try {
      const response = await employerService.contactDeveloper(dev.id, { message });
      if (response.success) {
        toast.success('Contact request sent successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to send contact request.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEndorseDeveloper = async () => {
    if (!dev) return;
    try {
      await developerService.endorseDeveloper(dev.id, { message: 'Strong recommendation from the KEDevs community.' });
      toast.success('Developer endorsed successfully.');
      setDev({ ...dev, endorsementCount: (dev.endorsementCount || 0) + 1 });
    } catch (err: any) {
      toast.error('Failed to endorse developer.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-6 pt-8 pb-12 space-y-12 animate-pulse">
          <div className="space-y-4">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-12 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-6">
                <Skeleton className="h-[300px] w-full rounded-[2rem]" />
                <Skeleton className="h-[400px] w-full rounded-[2rem]" />
             </div>
             <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-[200px] w-full rounded-[2rem]" />
                <Skeleton className="h-[300px] w-full rounded-[2rem]" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dev) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-12 text-center rounded-[2.5rem] border-border/50 shadow-xl">
           <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10" />
           </div>
           <h2 className="text-2xl font-black mb-2">{error || 'Developer not found'}</h2>
           <p className="text-muted-foreground mb-8">The profile you are looking for might have been moved or set to private.</p>
           <Button className="w-full rounded-2xl h-14 font-black" asChild>
              <Link href="/developers">Back to Talent Directory</Link>
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-6 pt-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-8">
          <Link 
             href="/developers" 
             className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
             <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
             Back to Talent Directory
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column (65%) */}
          <div className="lg:col-span-2 space-y-10">
            <ProfileHeader profile={dev} isOwner={false} />
            
            <ProfileTabs 
              profile={dev} 
              isOwner={false}
            />
          </div>

          {/* Right Column (35%) */}
          <div className="lg:col-span-1">
            <PublicProfileSidebar 
              profile={dev}
              isLoggedIn={isLoggedIn}
              onContact={handleContactDeveloper}
              onEndorse={handleEndorseDeveloper}
              isRequesting={isRequesting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
