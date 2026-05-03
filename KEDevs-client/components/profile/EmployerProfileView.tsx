'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, MapPin, Globe, CheckCircle2, AlertCircle, Bookmark, Search } from 'lucide-react';
import Link from 'next/link';

export function EmployerProfileView() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['employers', 'me'],
    queryFn: profileApi.getMyEmployerProfile,
  });

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt={profile.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-black">{profile.companyName}</h1>
                
                {/* Approval Badge */}
                {!profile.isApproved ? (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold uppercase tracking-widest text-[10px] py-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> Pending Approval
                  </Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px] py-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                  </Badge>
                )}

                {/* Pro Badge */}
                {profile.isProAccount && (
                  <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-transparent font-black uppercase tracking-widest text-[10px] py-1">
                    <Star className="w-3 h-3 mr-1 fill-amber-900" /> PRO
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium mt-3">
                {profile.industry && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {profile.industry}</span>}
                {profile.locationHQ && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.locationHQ}</span>}
                {profile.companyWebsite && <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Globe className="w-4 h-4" /> Website</a>}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button 
              className={`w-full font-bold ${!profile.isApproved ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-[#2a6f4d] text-white'}`}
              disabled={!profile.isApproved}
            >
              Post a Job
            </Button>
            {!profile.isProAccount && (
              <Link href="/payments">
                <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold">
                  Upgrade to PRO
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">About Company</h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile.companyBio || "No bio provided yet. Edit your profile to add a description of your company."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/employers/bookmarks" className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${profile.isProAccount ? 'border-secondary hover:border-primary bg-white' : 'border-dashed border-secondary bg-secondary/10 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <Bookmark className={`w-5 h-5 ${profile.isProAccount ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-foreground">Bookmarks</span>
                  </div>
                  {!profile.isProAccount && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
                </Link>

                <Link href="/employers/saved-searches" className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${profile.isProAccount ? 'border-secondary hover:border-primary bg-white' : 'border-dashed border-secondary bg-secondary/10 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <Search className={`w-5 h-5 ${profile.isProAccount ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-foreground">Saved Searches</span>
                  </div>
                  {!profile.isProAccount && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
