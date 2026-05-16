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
  Link as LinkIcon,
  Heart,
  Flag
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DeveloperProfilePage() {
  const { profileId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [dev, setDev] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Endorsement modal state
  const [isEndorseOpen, setIsEndorseOpen] = useState(false);
  const [endorsementContent, setEndorsementContent] = useState('');
  const [isSubmittingEndorsement, setIsSubmittingEndorsement] = useState(false);

  // Flag modal state
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagContent, setFlagContent] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

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
          setMessage('');
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
    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setIsRequesting(true);
    try {
      const response = await employerService.contactDeveloper(dev.id, { message: message.trim() });
      if (response.success) {
        toast.success('Contact request sent successfully!');
        setIsContactOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send contact request.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEndorseDeveloper = async () => {
    if (!dev) return;
    if (!endorsementContent.trim()) {
      toast.error('Endorsement text is required.');
      return;
    }
    setIsSubmittingEndorsement(true);
    try {
      // Corrected property name from 'message' to 'content' to match UserDtos.CreateEndorsementRequest
      const response = await developerService.endorseDeveloper(dev.id, { content: endorsementContent.trim() });
      if (response.success) {
        toast.success('Developer endorsed successfully!');
        setDev({ 
          ...dev, 
          endorsementCount: (dev.endorsementCount || 0) + 1,
          // Optionally push the new endorsement into the dev.endorsements list locally
          endorsements: response.data ? [...(dev.endorsements || []), response.data] : dev.endorsements
        });
        setIsEndorseOpen(false);
        setEndorsementContent('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to endorse developer. You may have already endorsed them.');
    } finally {
      setIsSubmittingEndorsement(false);
    }
  };

  const handleFlagDeveloper = async () => {
    if (!dev) return;
    if (!flagContent.trim()) {
      toast.error('Reason for reporting is required.');
      return;
    }
    setIsSubmittingFlag(true);
    try {
      const response = await developerService.flagDeveloper(dev.id, flagContent.trim());
      if (response.success) {
        toast.success('Profile reported to moderation team.');
        setIsFlagOpen(false);
        setFlagContent('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to report developer. You may have already flagged them.');
    } finally {
      setIsSubmittingFlag(false);
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
              onEndorse={() => {
                if (!isLoggedIn) {
                  toast.error("Please sign in to endorse developers");
                  router.push('/login');
                  return;
                }
                setIsEndorseOpen(true);
              }}
            />
          </div>

          {/* Right Column (35%) */}
          <div className="lg:col-span-1">
            <PublicProfileSidebar 
              profile={dev}
              isLoggedIn={isLoggedIn}
              onContact={() => {
                if (!isLoggedIn) {
                  toast.error("Please sign in to contact developers");
                  router.push('/login');
                  return;
                }
                setIsContactOpen(true);
              }}
              onFlag={() => {
                if (!isLoggedIn) {
                  toast.error("Please sign in to report profiles");
                  router.push('/login');
                  return;
                }
                setIsFlagOpen(true);
              }}
              isRequesting={isRequesting}
            />
          </div>
        </div>
      </div>

      {/* Endorsement Modal */}
      <Dialog open={isEndorseOpen} onOpenChange={setIsEndorseOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              Endorse Developer
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Write a brief recommendation for {fullName}. Endorsements highlight skills and build community credibility.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Recommendation Content</span>
                <span className={cn(endorsementContent.length > 200 ? "text-destructive" : "")}>
                  {endorsementContent.length}/200
                </span>
              </Label>
              <Textarea 
                placeholder="e.g. Exceptionally skilled developer and amazing team player..." 
                className="min-h-[120px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-rose-500/20"
                value={endorsementContent}
                onChange={(e) => setEndorsementContent(e.target.value.slice(0, 200))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEndorseOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl font-black px-8 bg-slate-900 text-white hover:bg-slate-800" 
              onClick={handleEndorseDeveloper}
              disabled={isSubmittingEndorsement || !endorsementContent.trim()}
            >
              {isSubmittingEndorsement ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : 'Submit Endorsement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Modal */}
      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Flag className="h-6 w-6" />
              </div>
              Report Profile
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Please describe why you are reporting this profile. Our moderation team will review this report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Reason for Reporting</span>
                <span className={cn(flagContent.length > 500 ? "text-destructive" : "")}>
                  {flagContent.length}/500
                </span>
              </Label>
              <Textarea 
                placeholder="e.g. Inappropriate content, spam, or fake profile..." 
                className="min-h-[120px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-destructive/20"
                value={flagContent}
                onChange={(e) => setFlagContent(e.target.value.slice(0, 500))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsFlagOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl font-black px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              onClick={handleFlagDeveloper}
              disabled={isSubmittingFlag || !flagContent.trim()}
            >
              {isSubmittingFlag ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Send className="h-5 w-5" />
              </div>
              Contact Developer
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Send a direct message to {fullName}. Introduce yourself and share the details of your opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Message Content</span>
                <span className={cn(message.length > 1000 ? "text-destructive" : "")}>
                  {message.length}/1000
                </span>
              </Label>
              <Textarea 
                placeholder="Write your message here..." 
                className="min-h-[150px] rounded-2xl border-border/50 resize-none font-medium text-base p-4 focus-visible:ring-primary/20"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsContactOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl font-black px-8 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" 
              onClick={handleContactDeveloper}
              disabled={isRequesting || !message.trim()}
            >
              {isRequesting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Send Message</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
