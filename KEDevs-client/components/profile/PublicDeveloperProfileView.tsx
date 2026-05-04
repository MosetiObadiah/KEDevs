'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as developerApi from '@/lib/api/developers';
import * as employerApi from '@/lib/api/employers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MapPin, CheckCircle2, Bookmark, MessageSquare, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { useState } from 'react';
import { PaywallModal } from '@/components/shared/paywall-modal';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PublicDeveloperProfileViewProps {
  profileId: string;
}

export function PublicDeveloperProfileView({ profileId }: PublicDeveloperProfileViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPaywall, setShowPaywall] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // We need the employer profile to check if they are PRO
  const { data: employerProfile } = useQuery({
    queryKey: ['employers', 'me'],
    queryFn: employerApi.getMyEmployerProfile,
    enabled: user?.role === 'EMPLOYER',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['developers', profileId],
    queryFn: () => developerApi.getDeveloper(profileId),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => employerApi.bookmarkDeveloper(id),
    onSuccess: () => toast.success('Profile bookmarked successfully'),
    onError: () => toast.error('Failed to bookmark profile')
  });

  const contactMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string, msg: string }) => employerApi.sendContactRequest(id, msg),
    onSuccess: () => {
      setContactModalOpen(false);
      setContactMessage('');
      toast.success('Contact request sent');
    },
    onError: (err: any) => {
      if (err.response?.status === 429) {
        toast.error('You have reached the limit of 10 contact requests per day.');
      } else {
        toast.error('Failed to send contact request');
      }
    }
  });

  const handleBookmark = () => {
    if (user?.role === 'EMPLOYER') {
      if (!employerProfile?.isProAccount) {
        setShowPaywall(true);
        return;
      }
      bookmarkMutation.mutate(profileId);
    }
  };

  const handleContactClick = () => {
    if (user?.role === 'EMPLOYER') {
      if (!employerProfile?.isProAccount) {
        setShowPaywall(true);
        return;
      }
      setContactModalOpen(true);
    }
  };

  const handleSendContact = () => {
    contactMutation.mutate({ id: profileId, msg: contactMessage });
  };

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const fullName = profile.fullName || `${(profile as any).firstName || ''} ${(profile as any).lastName || ''}`.trim();

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

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
                <h1 className="text-3xl font-black">{fullName || 'Developer Profile'}</h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-primary" />}
                {(profile as any).isSpotlighted && (
                  <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-transparent font-black uppercase tracking-widest text-[10px] py-1">
                    <Star className="w-3 h-3 mr-1 fill-amber-900" /> Spotlight
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground font-medium text-white/80">
                {((profile as any).currentLastRole || profile.headline) && (
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {(profile as any).currentLastRole || profile.headline}</span>
                )}
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
                  onClick={handleContactClick}
                  className="w-full bg-primary hover:bg-[#2a6f4d] text-white font-bold h-12 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Contact Developer
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
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
        {/* Left Column - Skills */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: any, index: number) => (
                  <Badge key={skill.id || skill.name || skill || `skill-${index}`} className="bg-primary/10 text-primary border-transparent py-1.5 px-3">
                    {skill.name || skill.skill || skill}
                  </Badge>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span className="text-muted-foreground text-sm">No skills listed.</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map((lang: any, index: number) => (
                  <Badge key={lang.id || lang.language || `lang-${index}`} className="bg-secondary/10 text-foreground border-transparent py-1.5 px-3">
                    {lang.language}
                  </Badge>
                ))}
                {(!profile.languages || profile.languages.length === 0) && (
                  <span className="text-muted-foreground text-sm">No languages listed.</span>
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
                  {profile.projects?.map((proj: any, index: number) => (
                    <div key={proj.id || `proj-${index}`} className="p-4 rounded-2xl border border-secondary bg-secondary/5 transition-colors">
                      <h4 className="font-bold text-foreground">{proj.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Include other sections like Education, Certifications similarly */}
          <div className="text-center py-4 text-sm text-muted-foreground bg-secondary/10 rounded-2xl">
            More profile details are visible to PRO employers.
          </div>
        </div>
      </div>

      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact {fullName}</DialogTitle>
            <DialogDescription>
              Send a direct message to this developer. They will receive an email and an in-app notification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Hi there! We are looking for a developer with your skills..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground mt-2">You have a limit of 10 contact requests per day.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendContact} disabled={!contactMessage.trim() || contactMutation.isPending}>
              {contactMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
      />
    </div>
  );
}
