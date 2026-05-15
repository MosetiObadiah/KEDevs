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
  Info,
  Flag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { companyService, CompanyProfile } from '@/services/companyService';
import { cn, formatCompanySize } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user && company && user.id === company.userId;

  // Flag modal state
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagContent, setFlagContent] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const handleFlagCompany = async () => {
    if (!flagContent.trim()) return;
    setIsSubmittingFlag(true);
    try {
      const response = await companyService.flagCompany(companyId as string, flagContent.trim());
      if (response.success) {
        toast.success('Profile reported to moderation.');
        setIsFlagOpen(false);
        setFlagContent('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to report profile. You may have already flagged them.');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

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
      <div className="container mx-auto px-4 pt-4 pb-12 animate-pulse space-y-12">
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
      <div className="container mx-auto px-4 pt-12 pb-20 text-center">
        <h2 className="text-3xl font-black mb-4">{error || 'Company profile not found'}</h2>
        <Button variant="outline" className="rounded-2xl h-12 font-black" asChild>
           <Link href="/companies">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-6 pt-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link 
            href="/companies" 
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Company Directory
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column (65%) - Main Profile Data */}
          <div className="lg:col-span-2 space-y-10">
            {/* Company Header Simulation */}
            <div className="flex flex-col md:flex-row items-start gap-8 mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="relative group">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-background shadow-xl overflow-hidden bg-white">
                  <AvatarImage src={company.logoUrl} className="object-contain p-4" />
                  <AvatarFallback className="bg-emerald-600 text-white text-4xl font-black">
                    {company.companyName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {company.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-xl p-1 shadow-lg">
                    <BadgeCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    {company.companyName}
                  </h1>
                  {company.isVerified && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold tracking-wider text-[10px] uppercase h-6 px-2">
                      <BadgeCheck className="w-3 h-3 mr-1" /> VERIFIED EMPLOYER
                    </Badge>
                  )}
                </div>
                
                <p className="text-xl font-medium text-muted-foreground">{company.industry || 'Industry Unknown'}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {company.locationHQ || 'Nairobi, Kenya'}
                  </span>
                  <span className="hidden md:block text-muted-foreground/30">•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    {company.companySize ? formatCompanySize(company.companySize) : 'Size unknown'}
                  </span>
                  {company.companyWebsite && (
                    <>
                      <span className="hidden md:block text-muted-foreground/30">•</span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        WEBSITE ACTIVE
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
              <CardHeader className="px-10 pt-10 pb-4">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                   <div className="h-7 w-1.5 bg-emerald-500 rounded-full" />
                   About the Company
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                   {company.companyBio || 'This company profile has no extended biography.'}
                </p>
              </CardContent>
            </Card>

            {/* Careers Section */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
              <CardHeader className="px-10 pt-10 pb-4">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                   <div className="h-7 w-1.5 bg-emerald-500 rounded-full" />
                   Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <Briefcase className="h-10 w-10 text-slate-300 mb-4" />
                  <h4 className="text-xl font-black text-slate-900 mb-1">Looking for Opportunities?</h4>
                  <p className="text-slate-500 font-medium mb-6">
                     Check out all listed opportunities from {company.companyName}.
                  </p>
                  <Button className="h-12 rounded-xl px-8 font-black shadow-lg bg-slate-900 text-white" asChild>
                     <Link href="/jobs">Browse Listings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (35%) - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
              <CardContent className="p-8 space-y-8">
                {/* Core Contact Action */}
                <div className="space-y-4">
                  <Button className="w-full h-14 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20" asChild>
                    <a href={`mailto:${company.contactEmail}`}>
                      <Mail className="mr-2 h-5 w-5" /> Send Inquiry
                    </a>
                  </Button>
                  {company.companyWebsite && (
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 gap-2" asChild>
                      <a href={company.companyWebsite} target="_blank" rel="noreferrer">
                        <Globe className="h-4 w-4" /> Visit Website
                      </a>
                    </Button>
                  )}
                </div>

                <Separator className="bg-slate-100" />

                {/* Details List */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Identity</h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Anchor</p>
                      <p className="font-bold text-slate-900">{company.contactPersonName || 'General Team'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Vector</p>
                      <p className="font-bold text-slate-900 truncate">{company.contactEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Social Connections */}
                {(company.linkedinUrl || company.twitterUrl) && (
                  <>
                    <Separator className="bg-slate-100" />
                    <div className="space-y-3">
                       {company.linkedinUrl && (
                          <Button variant="ghost" className="w-full justify-start rounded-xl h-12 px-4 font-bold gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50" asChild>
                             <a href={company.linkedinUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 text-[#0077b5]" /> LinkedIn Profile
                             </a>
                          </Button>
                       )}
                    </div>
                  </>
                )}

                {/* Verified Status Box */}
                {company.isVerified && (
                  <div className="p-6 rounded-[1.5rem] bg-slate-900 text-white space-y-3 shadow-xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                      <span className="font-black text-sm uppercase tracking-wider">Authenticated</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      This entity has undergone formal operational audit by KEDevs compliance teams.
                    </p>
                  </div>
                )}

                {/* Flag Action */}
                {user && !isOwnProfile && (
                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <button 
                      onClick={() => setIsFlagOpen(true)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-destructive transition-colors"
                    >
                      <Flag className="h-3.5 w-3.5" /> Report Employer Profile
                    </button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      </div>

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
              onClick={handleFlagCompany}
              disabled={isSubmittingFlag || !flagContent.trim()}
            >
              {isSubmittingFlag ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
