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
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DeveloperProfilePage() {
  const { profileId } = useParams();
  const { isLoggedIn } = useAuth();
  const [dev, setDev] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const fullName = dev ? (dev.fullName || `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || dev.email || 'Developer') : '';

  useEffect(() => {
    const loadDeveloper = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getDeveloperProfile(profileId as string);
        if (response.success) {
          const data = response.data;
          setDev(data);
          const computedName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'Developer';
          setMessage(`Hi ${computedName}, I found your profile on KEDevs and would like to invite you to apply for an opportunity.`);
        }
      } catch (err: any) {
        setError('Unable to load developer profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeveloper();
  }, [profileId]);

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
      <div className="container mx-auto px-4 py-12 animate-pulse space-y-12">
        <div className="h-[300px] w-full rounded-[3rem] bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           <div className="md:col-span-8 space-y-6">
              <div className="h-[200px] w-full rounded-[2.5rem] bg-slate-100" />
              <div className="h-[400px] w-full rounded-[2.5rem] bg-slate-100" />
           </div>
           <div className="md:col-span-4 space-y-6">
              <div className="h-[300px] w-full rounded-[2.5rem] bg-slate-100" />
           </div>
        </div>
      </div>
    );
  }

  if (error || !dev) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">{error || 'Developer not found'}</h2>
        <Button variant="outline" className="rounded-2xl h-12 font-black" asChild>
           <Link href="/developers">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Dynamic Header Spotlight */}
      <div className="bg-slate-900 pt-32 pb-60 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10 opacity-50" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-60 -mt-60" />
         
         <div className="container mx-auto px-4 relative z-10">
            <Link href="/developers" className="inline-flex items-center text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest mb-12 transition-all group">
               <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
               Back to Talent Directory
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
               <div className="relative">
                  <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-[2.5rem] border-4 border-white/10 shadow-2xl">
                     <AvatarImage src={dev.avatarUrl} />
                     <AvatarFallback className="bg-primary text-white text-5xl font-black">{fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {dev.isVerified && (
                     <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-1.5 shadow-xl">
                        <BadgeCheck className="h-8 w-8 text-primary" />
                     </div>
                  )}
               </div>

               <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                     <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">{fullName}</h1>
                     {dev.availability === 'AVAILABLE' && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-lg">
                           ACTIVE NOW
                        </Badge>
                     )}
                  </div>
                  <p className="text-xl md:text-2xl font-black text-slate-400">{dev.currentRole || dev.role}</p>
                  <div className="flex flex-wrap gap-6 text-slate-400">
                     <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><MapPin className="h-4 w-4 text-primary" /> {dev.city || 'Nairobi'}, Kenya</span>
                     <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><Star className="h-4 w-4 text-amber-400" /> {dev.endorsementCount || 0} Endorsements</span>
                     <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><Calendar className="h-4 w-4 text-emerald-500" /> Joined {new Date(dev.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  {!isLoggedIn ? (
                     <Button className="h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20" asChild>
                        <Link href="/register">Connect with {dev.firstName || 'Dev'}</Link>
                     </Button>
                  ) : (
                     <Button 
                        className="h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
                        onClick={handleContactDeveloper}
                        disabled={isRequesting}
                     >
                        {isRequesting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                        Contact Developer
                     </Button>
                  )}
                  <Button 
                     variant="outline" 
                     className="h-14 rounded-2xl font-black border-white/10 bg-white/5 text-white hover:bg-white/10"
                     onClick={handleEndorseDeveloper}
                     disabled={!isLoggedIn}
                  >
                     <Star className="mr-2 h-5 w-5" /> Endorse Skills
                  </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               {/* About Section */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="bg-white p-10 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <User className="h-6 w-6 text-primary" /> Professional Summary
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                     <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                        {dev.bio || 'This developer hasn\'t added a biography yet.'}
                     </p>
                  </CardContent>
               </Card>

               {/* Arsenal (Skills) */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="bg-white p-10 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <Layers className="h-6 w-6 text-primary" /> Technical Arsenal
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                     <div className="flex flex-wrap gap-3">
                        {(dev.skills || []).map((skill: string) => (
                           <Badge key={skill} className="h-12 px-6 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm hover:bg-primary hover:text-white transition-all cursor-default shadow-sm border-none">
                              {skill}
                           </Badge>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               {/* Featured Projects */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-6">
                     <h2 className="text-2xl font-black text-slate-900">Featured Projects</h2>
                     <Badge variant="outline" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-3 py-1 border-slate-200 text-slate-400">
                        {dev.projects?.length || 0} SHOWCASED
                     </Badge>
                  </div>
                  
                  {dev.projects && dev.projects.length > 0 ? (
                     <div className="grid grid-cols-1 gap-6">
                        {dev.projects.map((project: any, i: number) => (
                           <Card key={i} className="rounded-[3rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-white">
                              <div className="grid grid-cols-1 md:grid-cols-12">
                                 {project.screenshotUrl && (
                                    <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden">
                                       <img 
                                          src={project.screenshotUrl} 
                                          alt={project.title}
                                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                       />
                                       <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/0 transition-all" />
                                    </div>
                                 )}
                                 <div className={cn("p-10 space-y-6 flex flex-col justify-center", project.screenshotUrl ? "md:col-span-8" : "md:col-span-12")}>
                                    <div className="space-y-2">
                                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h3>
                                       <p className="text-slate-500 font-medium leading-relaxed">{project.description}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {project.techStack?.map((t: string) => (
                                          <Badge key={t} variant="secondary" className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase rounded-lg border-none">{t}</Badge>
                                       ))}
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                       {project.url && (
                                          <Button variant="outline" className="rounded-xl font-black gap-2 h-10 border-slate-100" asChild>
                                             <a href={project.url} target="_blank"><ExternalLink className="h-4 w-4" /> Live Demo</a>
                                          </Button>
                                       )}
                                       {project.repoUrl && (
                                          <Button variant="outline" className="rounded-xl font-black gap-2 h-10 border-slate-100" asChild>
                                             <a href={project.repoUrl} target="_blank"><ExternalLink className="h-4 w-4" /> Code</a>
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </div>
                  ) : (
                     <div className="p-16 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                        <Layers className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-black text-lg">No projects showcased yet.</p>
                     </div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               {/* Contact & Professional Info Sidebar */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                  <CardHeader className="p-10 pb-0">
                     <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-400">Connectivity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                     {!isLoggedIn ? (
                        <div className="space-y-6 text-center py-4">
                           <div className="h-16 w-16 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto">
                              <Sparkles className="h-8 w-8" />
                           </div>
                           <div className="space-y-2">
                              <p className="font-black text-slate-900">Private Details Hidden</p>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed">Sign up to view contact information and full professional history.</p>
                           </div>
                           <Button className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/10" asChild>
                              <Link href="/register">Unlock Profile</Link>
                           </Button>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                 <Mail className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                                 <p className="font-bold text-slate-900 truncate">{dev.email || 'Not shared'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                 <Phone className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                                 <p className="font-bold text-slate-900 truncate">{dev.phone || 'Not shared'}</p>
                              </div>
                           </div>
                           <div className="pt-2 flex flex-col gap-3">
                              {dev.linkedinUrl && (
                                 <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 font-black gap-2 justify-start px-6" asChild>
                                    <a href={dev.linkedinUrl} target="_blank"><ExternalLink className="h-4 w-4 text-[#0077b5]" /> LinkedIn</a>
                                 </Button>
                              )}
                              {dev.githubUrl && (
                                 <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 font-black gap-2 justify-start px-6" asChild>
                                    <a href={dev.githubUrl} target="_blank"><ExternalLink className="h-4 w-4 text-slate-900" /> GitHub Profile</a>
                                 </Button>
                              )}
                           </div>
                        </div>
                     )}

                     <Separator className="bg-slate-50" />

                     <div className="space-y-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience</p>
                           <p className="font-black text-slate-900 text-lg flex items-center gap-2 uppercase tracking-tight">
                              <Briefcase className="h-4 w-4 text-primary" /> {dev.yearsOfExperience?.replace(/_/g, ' ') || 'Expert'}
                           </p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Work</p>
                           <p className="font-black text-slate-900 text-lg flex items-center gap-2 uppercase tracking-tight">
                              <Globe className="h-4 w-4 text-emerald-500" /> Remote, Full-time
                           </p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Recommendation Prompt */}
               <div className="p-8 rounded-[3rem] bg-slate-900 text-white space-y-4 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
                  <MessageSquareShare className="h-8 w-8 text-primary" />
                  <div className="space-y-1">
                     <p className="text-xl font-black">Endorse {dev.firstName}?</p>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed">Help employers find this talent by adding a recommendation.</p>
                  </div>
                  <Button className="w-full h-12 rounded-2xl font-black bg-white text-slate-900 hover:bg-white/90" onClick={handleEndorseDeveloper} disabled={!isLoggedIn}>
                     Add Endorsement
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
