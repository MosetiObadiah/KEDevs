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
          if (isLoggedIn && user && (data.userId === user.id || data.id === user.developerProfileId)) {
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
      <div className="container mx-auto px-6 pt-8 pb-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Link 
               href="/developers" 
               className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
               <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
               Back to Directory
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{fullName}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
             {!isLoggedIn ? (
                <Button className="h-14 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 px-8" asChild>
                   <Link href="/register">Connect with {dev.firstName || 'Dev'}</Link>
                </Button>
             ) : (
                <Button 
                   className="h-14 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 px-8 transition-all active:scale-95"
                   onClick={handleContactDeveloper}
                   disabled={isRequesting}
                >
                   {isRequesting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                   Contact Developer
                </Button>
             )}
             <Button 
                variant="outline" 
                className="h-14 rounded-2xl font-black border-border/50 bg-background hover:bg-muted/50 px-8"
                onClick={handleEndorseDeveloper}
                disabled={!isLoggedIn}
             >
                <Star className="mr-2 h-5 w-5 text-amber-400" /> Endorse Skills
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identity Card */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
               <div className="h-40 bg-gradient-to-br from-primary via-primary/80 to-emerald-500 relative">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
               </div>
               <CardContent className="px-10 pb-10 relative">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="relative -mt-20">
                        <Avatar className="h-40 w-40 rounded-3xl border-[6px] border-background shadow-xl">
                           <AvatarImage src={dev.avatarUrl} className="object-cover" />
                           <AvatarFallback className="bg-primary text-white text-5xl font-black">{fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {dev.isVerified && (
                           <div className="absolute -bottom-2 -right-2 bg-background rounded-2xl p-1 shadow-lg">
                              <div className="bg-primary text-white p-1.5 rounded-xl">
                                 <BadgeCheck className="h-6 w-6" />
                              </div>
                           </div>
                        )}
                     </div>
                     <div className="pt-4 space-y-4 flex-1">
                        <div className="flex flex-wrap gap-2">
                           {dev.availability === 'AVAILABLE' && (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] px-3 py-1 rounded-lg">
                                 Active Now
                              </Badge>
                           )}
                           <Badge variant="outline" className="border-border/50 font-bold uppercase text-[10px] px-3 py-1 rounded-lg">
                              {dev.locationCity || 'Nairobi'}, Kenya
                           </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                              <Star className="h-4 w-4 text-amber-400" /> {dev.endorsementCount || 0} Endorsements
                           </div>
                           <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                              <Briefcase className="h-4 w-4 text-primary" /> {formatExperience(dev.yearsOfExperience)}
                           </div>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
               <CardHeader className="px-10 pt-10 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                     <div className="h-8 w-2 bg-primary rounded-full" />
                     Professional Story
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-10">
                  <p className="text-lg leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                     {dev.bio || 'This developer hasn\'t added a biography yet.'}
                  </p>
               </CardContent>
            </Card>

            {/* Technical Arsenal */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
               <CardHeader className="px-10 pt-10 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                     <div className="h-8 w-2 bg-primary rounded-full" />
                     Technical Arsenal
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-10">
                  <div className="flex flex-wrap gap-3">
                     {(dev.skills || []).map((skill: string) => (
                        <Badge key={skill} className="h-12 px-6 rounded-2xl bg-muted/50 border border-border/50 text-foreground font-black text-sm hover:bg-primary hover:text-white hover:border-primary transition-all cursor-default">
                           {skill}
                        </Badge>
                     ))}
                     {(dev.skills || []).length === 0 && (
                        <p className="text-muted-foreground font-bold italic">No technical skills showcased yet.</p>
                     )}
                  </div>
               </CardContent>
            </Card>

            {/* Projects Section */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-6">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                     <div className="h-8 w-2 bg-primary rounded-full" />
                     Featured Projects
                  </h2>
                  <Badge variant="outline" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-3 py-1 border-border/50 text-muted-foreground">
                     {dev.projects?.length || 0} SHOWCASED
                  </Badge>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {dev.projects && dev.projects.length > 0 ? (
                     dev.projects.map((project: any, i: number) => (
                        <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-500 bg-background">
                           <div className="grid grid-cols-1 md:grid-cols-12">
                              {project.screenshotUrl && (
                                 <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden bg-muted">
                                    <img 
                                       src={project.screenshotUrl} 
                                       alt={project.title}
                                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                 </div>
                              )}
                              <div className={cn("p-10 space-y-6 flex flex-col justify-center", project.screenshotUrl ? "md:col-span-8" : "md:col-span-12")}>
                                 <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground tracking-tight">{project.title}</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-3">{project.description}</p>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {project.techStack?.map((t: string) => (
                                       <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground font-bold text-[10px] uppercase rounded-lg border-none">{t}</Badge>
                                    ))}
                                 </div>
                                 <div className="flex gap-4 pt-2">
                                    {project.url && (
                                       <Button variant="outline" className="rounded-xl font-black gap-2 h-10 border-border/50" asChild>
                                          <a href={project.url} target="_blank"><ExternalLink className="h-4 w-4" /> Live Demo</a>
                                       </Button>
                                    )}
                                    {project.repoUrl && (
                                       <Button variant="outline" className="rounded-xl font-black gap-2 h-10 border-border/50" asChild>
                                          <a href={project.repoUrl} target="_blank"><GitBranch className="h-4 w-4" /> Source</a>
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </Card>
                     ))
                  ) : (
                     <div className="p-16 text-center border-4 border-dashed border-border/20 rounded-[3rem] bg-background/50">
                        <Layers className="h-16 w-16 text-muted/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-black text-lg">No projects showcased yet.</p>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact & Professional Info Card */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
               <CardHeader className="px-10 pt-10 pb-0">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Connectivity</CardTitle>
               </CardHeader>
               <CardContent className="p-10 space-y-8">
                  {!isLoggedIn ? (
                     <div className="space-y-6 text-center py-4">
                        <div className="h-16 w-16 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto">
                           <Sparkles className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                           <p className="font-black text-foreground">Private Details Hidden</p>
                           <p className="text-xs font-medium text-muted-foreground leading-relaxed">Sign up to view contact information and full professional history.</p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/10" asChild>
                           <Link href="/register">Unlock Full Profile</Link>
                        </Button>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-sm border border-primary/10">
                              <Mail className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                              <p className="font-bold text-foreground truncate">{dev.publicEmail || dev.email || 'Not shared'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm border border-emerald-100">
                              <Phone className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</p>
                              <p className="font-bold text-foreground truncate">{dev.publicPhone || dev.phone || 'Not shared'}</p>
                           </div>
                        </div>
                        <div className="pt-2 flex flex-col gap-3">
                           {dev.linkedinUrl && (
                              <Button variant="outline" className="w-full h-14 rounded-2xl border-border/50 font-black gap-4 justify-start px-6 bg-muted/20" asChild>
                                 <a href={dev.linkedinUrl} target="_blank">
                                    <LinkIcon className="h-5 w-5 text-[#0077b5]" /> 
                                    <span>LinkedIn Profile</span>
                                    <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground/30" />
                                 </a>
                              </Button>
                           )}
                           {dev.githubUrl && (
                              <Button variant="outline" className="w-full h-14 rounded-2xl border-border/50 font-black gap-4 justify-start px-6 bg-muted/20" asChild>
                                 <a href={dev.githubUrl} target="_blank">
                                    <GitBranch className="h-5 w-5 text-foreground" /> 
                                    <span>GitHub Profile</span>
                                    <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground/30" />
                                 </a>
                              </Button>
                           )}
                        </div>
                     </div>
                  )}

                  <Separator className="bg-border/50" />

                  <div className="space-y-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preferred Work</p>
                        <p className="font-black text-foreground text-lg flex items-center gap-2 uppercase tracking-tight">
                           <Globe className="h-4 w-4 text-emerald-500" /> Remote, Full-time
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Endorsement Card */}
            <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
               <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                  <MessageSquareShare className="h-7 w-7" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Endorse {dev.firstName}?</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">Help employers discover this talent by adding a professional recommendation.</p>
               </div>
               <Button 
                  className="w-full h-14 rounded-2xl font-black bg-white text-slate-900 hover:bg-slate-100 transition-all active:scale-95" 
                  onClick={handleEndorseDeveloper} 
                  disabled={!isLoggedIn}
               >
                  Submit Endorsement
               </Button>
            </div>

            {/* Achievements Card (if any) */}
            {dev.achievements && dev.achievements.length > 0 && (
               <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
                  <CardHeader className="px-10 pt-10 pb-6 border-b border-border/50">
                     <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                     {dev.achievements.map((ach: any) => (
                        <div key={ach.id} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                           <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                              <Trophy className="h-5 w-5" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="font-black text-sm text-foreground">{ach.title}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{ach.year}</p>
                           </div>
                        </div>
                     ))}
                  </CardContent>
               </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
