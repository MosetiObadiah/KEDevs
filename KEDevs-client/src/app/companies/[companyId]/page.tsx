'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Users, 
  ExternalLink, 
  BadgeCheck, 
  ChevronLeft,
  Loader2,
  Briefcase,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { companyService, CompanyProfile } from '@/services/companyService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const response = await companyService.getCompanyDetails(companyId as string);
        if (response.success) {
          setCompany(response.data);
        }
      } catch (err: any) {
        setError('Company profile not found');
      } finally {
        setIsLoading(false);
      }
    };
    if (companyId) fetchCompany();
  }, [companyId]);

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

  if (error || !company) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">{error || 'Company profile not found'}</h2>
        <Button variant="outline" className="rounded-2xl h-12 font-black" asChild>
           <Link href="/companies">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Spotlight Header */}
      <div className="bg-emerald-950 pt-32 pb-60 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-primary/10 opacity-50" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-60 -mt-60" />
         
         <div className="container mx-auto px-4 relative z-10">
            <Link href="/companies" className="inline-flex items-center text-emerald-400 hover:text-white font-black uppercase text-[10px] tracking-widest mb-12 transition-all group">
               <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
               Back to Company Directory
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
               <div className="relative">
                  <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-[2.5rem] border-4 border-white/10 shadow-2xl bg-white">
                     <AvatarImage src={company.logoUrl} className="object-contain p-4" />
                     <AvatarFallback className="bg-emerald-600 text-white text-5xl font-black">{company.companyName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {company.isApproved && (
                     <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-1.5 shadow-xl">
                        <BadgeCheck className="h-8 w-8 text-emerald-600" />
                     </div>
                  )}
               </div>

               <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                     <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">{company.companyName}</h1>
                     <Badge className="bg-white/10 text-white border-white/20 font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-lg">
                        {company.industry || 'TECH'}
                     </Badge>
                  </div>
                  <div className="flex flex-wrap gap-6 text-emerald-400/80">
                     <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><MapPin className="h-4 w-4" /> {company.locationHQ}</span>
                     <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"><Users className="h-4 w-4" /> {company.companySize?.replace(/_/g, ' ')}</span>
                     {company.companyWebsite && (
                        <a href={company.companyWebsite} target="_blank" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-white transition-colors">
                           <Globe className="h-4 w-4" /> Official Website
                        </a>
                     )}
                  </div>
               </div>

               <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  <Button className="h-14 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95" asChild>
                     <Link href="/register">Sign up to Work Here</Link>
                  </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               {/* About Company */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                  <CardHeader className="p-10 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <Building2 className="h-6 w-6 text-emerald-600" /> About the Company
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                     <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                        {company.companyBio || 'This company hasn\'t added a full biography yet.'}
                     </p>
                  </CardContent>
               </Card>

               {/* Open Positions Prompt */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                  <CardHeader className="p-10 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <Briefcase className="h-6 w-6 text-emerald-600" /> Career Opportunities
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                     <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <Layers className="h-12 w-12 text-slate-200 mb-4" />
                        <h4 className="text-xl font-black text-slate-900 mb-2">Want to join {company.companyName}?</h4>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                           Stay updated with their latest job postings and career events by following their profile.
                        </p>
                        <Button className="rounded-2xl h-12 px-10 font-black shadow-lg" asChild>
                           <Link href="/jobs">Browse Current Jobs</Link>
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
               {/* Contact Information Sidebar */}
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                  <CardHeader className="p-10 pb-0">
                     <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-400">Company Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Mail className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Email</p>
                              <p className="font-bold text-slate-900 truncate">{company.contactEmail}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                              <Info className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person</p>
                              <p className="font-bold text-slate-900 truncate">{company.contactPersonName || 'HR Team'}</p>
                           </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                           {company.linkedinUrl && (
                              <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 font-black gap-2 justify-start px-6" asChild>
                                 <a href={company.linkedinUrl} target="_blank"><ExternalLink className="h-4 w-4 text-[#0077b5]" /> LinkedIn Profile</a>
                              </Button>
                           )}
                           {company.companyWebsite && (
                              <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 font-black gap-2 justify-start px-6" asChild>
                                 <a href={company.companyWebsite} target="_blank"><Globe className="h-4 w-4 text-emerald-600" /> Official Website</a>
                              </Button>
                           )}
                        </div>
                     </div>

                     <Separator className="bg-slate-50" />

                     <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-4 shadow-xl">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                        <p className="font-black text-lg">Verified Employer</p>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                           This company has been verified by the KEDevs team for legitimate business operations in Kenya.
                        </p>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
