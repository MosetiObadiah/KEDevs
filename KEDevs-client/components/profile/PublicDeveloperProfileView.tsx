'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as developerApi from '@/lib/api/developers';
import * as employerApi from '@/lib/api/employers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MapPin, CheckCircle2, Bookmark, MessageSquare, Star, ArrowLeft, Heart } from 'lucide-react';
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
  
  const [endorseModalOpen, setEndorseModalOpen] = useState(false);
  const [endorseMessage, setEndorseMessage] = useState('');

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

  const endorseMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string, msg: string }) => developerApi.endorseDeveloper(id, msg),
    onSuccess: () => {
      setEndorseModalOpen(false);
      setEndorseMessage('');
      toast.success('Developer endorsed successfully!');
      queryClient.invalidateQueries({ queryKey: ['developers', profileId] });
    },
    onError: (err: any) => {
      if (err.response?.status === 400) {
        toast.error('You have already endorsed this developer or cannot self-endorse.');
      } else {
        toast.error('Failed to endorse developer');
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

  const handleSendEndorse = () => {
    endorseMutation.mutate({ id: profileId, msg: endorseMessage });
  };

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <Link href="/developers" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
      </Link>

      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-6 items-center">
            {profile.profilePhoto && (
              <img src={profile.profilePhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20" />
            )}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-black">{profile.firstName} {profile.lastName}</h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-primary" />}
                {(profile as any).isSpotlighted && (
                  <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-transparent font-black uppercase tracking-widest text-[10px] py-1">
                    <Star className="w-3 h-3 mr-1 fill-amber-900" /> Spotlight
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground font-medium text-white/80">
                {profile.currentLastRole && (
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.currentLastRole}</span>
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
                  <MessageSquare className="w-4 h-4 mr-2" /> Send Job Request
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
            {user?.id !== profile.userId && (
              <Button 
                variant="outline"
                onClick={() => setEndorseModalOpen(true)}
                className="w-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border-pink-500/20 font-bold h-12 rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2" /> Endorse
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Skills & Endorsements */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: any, index: number) => (
                  <Badge key={index} className="bg-primary/10 text-primary border-transparent py-1.5 px-3">
                    {skill}
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
                  <Badge key={index} className="bg-secondary/10 text-foreground border-transparent py-1.5 px-3">
                    {lang}
                  </Badge>
                ))}
                {(!profile.languages || profile.languages.length === 0) && (
                  <span className="text-muted-foreground text-sm">No languages listed.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-4 flex items-center justify-between">
                Endorsements
                <Badge variant="secondary" className="bg-primary/10 text-primary">{profile.endorsementCount || 0}</Badge>
              </h3>
              <div className="space-y-3">
                {(!profile.endorsements || profile.endorsements.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No endorsements yet.</p>
                ) : (
                  profile.endorsements.map((end: any) => (
                    <div key={end.id} className="p-3 bg-secondary/10 rounded-xl text-sm">
                      <p className="text-foreground italic">"{end.content}"</p>
                      <p className="text-muted-foreground font-bold text-xs mt-2">- {end.authorName}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projects, Education, etc. */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Projects */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-4">Projects</h3>
              
              {(!profile.projects || profile.projects.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">No projects added yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {profile.projects?.map((proj: any) => (
                    <div key={proj.id} className="p-4 rounded-2xl border border-secondary bg-white transition-colors flex gap-4">
                      {proj.screenshotUrl && (
                        <img src={proj.screenshotUrl} alt={proj.title} className="w-32 h-24 object-cover rounded-xl border border-secondary shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-foreground">{proj.title}</h4>
                          {proj.isFeatured && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Featured</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                        <p className="text-xs text-primary font-medium mt-1">{proj.techStack}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Live Link</a>}
                          {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Repository</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Education */}
          {profile.education?.length > 0 && (
            <Card className="rounded-3xl border-secondary shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-black text-foreground uppercase tracking-tight">Education</h3>
                <div className="space-y-4">
                  {profile.education?.map((edu: any) => (
                    <div key={edu.id} className="p-4 rounded-2xl border border-secondary bg-white">
                      <h4 className="font-bold text-foreground">{edu.institution}</h4>
                      <p className="text-sm text-muted-foreground">{edu.qualification}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications?.length > 0 && (
            <Card className="rounded-3xl border-secondary shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-black text-foreground uppercase tracking-tight">Certifications</h3>
                <div className="space-y-4">
                  {profile.certifications?.map((cert: any) => (
                    <div key={cert.id} className="p-4 rounded-2xl border border-secondary bg-white">
                      <h4 className="font-bold text-foreground">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuedBy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OSS Contributions */}
          {profile.ossContributions?.length > 0 && (
            <Card className="rounded-3xl border-secondary shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-black text-foreground uppercase tracking-tight">Open Source</h3>
                <div className="space-y-4">
                  {profile.ossContributions?.map((oss: any) => (
                    <div key={oss.id} className="p-4 rounded-2xl border border-secondary bg-white">
                      <h4 className="font-bold text-foreground">{oss.projectName}</h4>
                      <p className="text-sm text-muted-foreground">{oss.description}</p>
                      {oss.contributionUrl && <a href={oss.contributionUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Link</a>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {profile.achievements?.length > 0 && (
            <Card className="rounded-3xl border-secondary shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-black text-foreground uppercase tracking-tight">Achievements</h3>
                <div className="space-y-4">
                  {profile.achievements?.map((ach: any) => (
                    <div key={ach.id} className="p-4 rounded-2xl border border-secondary bg-white">
                      <h4 className="font-bold text-foreground">{ach.title}</h4>
                      <p className="text-sm text-muted-foreground">{ach.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Job Request</DialogTitle>
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

      <Dialog open={endorseModalOpen} onOpenChange={setEndorseModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Endorse Developer</DialogTitle>
            <DialogDescription>
              Write a short recommendation (max 200 chars) for this developer's skills and work.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="An excellent problem solver and team player..."
              value={endorseMessage}
              onChange={(e) => setEndorseMessage(e.target.value)}
              maxLength={200}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndorseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEndorse} disabled={!endorseMessage.trim() || endorseMutation.isPending}>
              {endorseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Endorse
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
