'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getPublicEmployerDetail } from '@/lib/api/employers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Briefcase, 
  Mail, 
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailPage() {
  const { id } = useParams();

  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getPublicEmployerDetail(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] pt-32 px-6">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-64 bg-white rounded-[40px] mb-8 shadow-sm" />
          <div className="h-96 bg-white rounded-[40px] shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Building2 className="w-10 h-10 text-[#CAD2C5]" />
        </div>
        <h1 className="text-2xl font-bold text-[#2F3E46] mb-2">Company not found</h1>
        <p className="text-[#84A98C] mb-8">The company profile you're looking for doesn't exist or is no longer available.</p>
        <Link href="/companies">
          <Button className="bg-[#52796F] hover:bg-[#354F52] text-white rounded-2xl px-8">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const initials = company.companyName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';

  return (
    <div className="min-h-screen bg-[#f4f6f5] pb-24">
      {/* Header / Hero */}
      <div className="bg-[#2F3E46] pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/companies" className="inline-flex items-center gap-2 text-[#CAD2C5] hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white/10 shadow-2xl">
              <AvatarImage src={company.logoUrl} alt={company.companyName} />
              <AvatarFallback className="bg-[#52796F] text-white text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{company.companyName}</h1>
                {company.proAccount && (
                  <Badge className="bg-[#52796F] text-white border-0 py-1">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Verified Partner
                  </Badge>
                )}
              </div>
              <p className="text-[#84A98C] text-lg font-medium mb-6">{company.industry}</p>
              
              <div className="flex flex-wrap gap-6 text-[#CAD2C5] text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#84A98C]" />
                  {company.locationHQ || 'Kenya'}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#84A98C]" />
                  {String(company.companySize || 'Unknown').replace(/_/g, ' ').toLowerCase()}
                </div>
                {company.websiteUrl && (
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Globe className="w-4 h-4 text-[#84A98C]" />
                    {company.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Link href="/register?role=DEVELOPER">
                <Button className="w-full md:w-auto bg-[#52796F] hover:bg-[#354F52] text-white rounded-2xl h-14 px-8 font-bold shadow-xl shadow-[#52796F]/20">
                  Follow Company
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[40px] border-[#CAD2C5]/30 shadow-xl shadow-black/5 overflow-hidden bg-white">
              <CardHeader className="border-b border-[#f4f6f5] p-8">
                <h2 className="text-2xl font-bold text-[#2F3E46]">About {company.companyName}</h2>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-slate max-w-none text-[#2F3E46]/80 leading-relaxed">
                  {company.companyBio || "This company hasn't provided a detailed bio yet."}
                </div>
              </CardContent>
            </Card>

            {/* Active Jobs Section */}
            <div>
              <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-2xl font-bold text-[#2F3E46]">Active Job Openings</h2>
                <Badge variant="outline" className="bg-white border-[#CAD2C5]/30 text-[#52796F] px-4 py-1">
                  {company.activeJobsCount} roles
                </Badge>
              </div>
              
              <div className="space-y-4">
                {company.activeJobs && company.activeJobs.length > 0 ? (
                  company.activeJobs.map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <Card className="group hover:border-[#52796F]/40 transition-all duration-300 hover:shadow-lg border-[#CAD2C5]/30 bg-white rounded-3xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg text-[#2F3E46] group-hover:text-[#52796F] transition-colors mb-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-4 text-[#84A98C] text-sm font-medium">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.locationCity || 'Remote'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                {job.workType}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-6 h-6 text-[#CAD2C5] group-hover:text-[#52796F] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="rounded-3xl border-2 border-dashed border-[#CAD2C5]/50 bg-white/50 p-12 text-center">
                    <p className="text-[#84A98C]">No active job openings at the moment.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="rounded-[40px] border-[#CAD2C5]/30 shadow-xl shadow-black/5 bg-white p-8">
              <h3 className="font-bold text-[#2F3E46] mb-6 text-xl">Hiring Contact</h3>
              <div className="p-6 bg-[#f4f6f5] rounded-3xl border border-[#CAD2C5]/20 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Mail className="w-8 h-8 text-[#CAD2C5]" />
                </div>
                <p className="text-[#84A98C] text-sm mb-6">Contact information is only available to logged in developers.</p>
                <Link href="/login">
                  <Button className="w-full bg-[#2F3E46] hover:bg-[#354F52] text-white rounded-xl">
                    Sign in to View
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="rounded-[40px] border-[#CAD2C5]/30 shadow-xl shadow-black/5 bg-white p-8">
              <h3 className="font-bold text-[#2F3E46] mb-6 text-xl">Company Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#84A98C]">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Posts</span>
                  </div>
                  <span className="font-bold text-[#2F3E46]">{company.activeJobsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#84A98C]">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Industry</span>
                  </div>
                  <span className="font-bold text-[#2F3E46] text-xs text-right truncate max-w-[120px]">{company.industry}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
