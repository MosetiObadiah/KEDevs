'use client';

import { UserDtos } from '@/lib/types/user-dtos';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DeveloperCardProps {
  developer: UserDtos.DeveloperSummaryResponse;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  const initials = `${developer.firstName[0]}${developer.lastName[0]}`.toUpperCase();

  return (
    <Card className="overflow-hidden border-[#CAD2C5] hover:border-[#52796F] transition-all group hover:shadow-xl hover:shadow-[#52796F]/5 rounded-3xl bg-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <Avatar className="w-20 h-20 rounded-2xl shadow-inner border-2 border-slate-50">
            <AvatarImage src={developer.profilePhoto} alt={`${developer.firstName} ${developer.lastName}`} className="object-cover" />
            <AvatarFallback className="bg-[#CAD2C5] text-[#2F3E46] font-bold text-xl rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#2F3E46] truncate group-hover:text-[#52796F] transition-colors">
                {developer.firstName} {developer.lastName}
              </h3>
              {developer.isVerified && (
                <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#84A98C] mb-4 font-medium">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span className="truncate">{developer.currentLastRole || 'Software Developer'}</span>
              </div>
              {(developer.locationCity || developer.locationCountry) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {[developer.locationCity, developer.locationCountry].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {developer.skills.slice(0, 4).map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="bg-[#f4f6f5] text-[#354F52] hover:bg-[#CAD2C5] border-transparent font-medium px-3"
                >
                  {skill}
                </Badge>
              ))}
              {developer.skills.length > 4 && (
                <Badge variant="outline" className="border-[#CAD2C5] text-[#84A98C] px-2 font-bold">
                  +{developer.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#CAD2C5]/30 flex items-center justify-between">
          <Badge className={`
            ${developer.availabilityStatus === 'AVAILABLE_NOW' ? 'bg-green-50 text-green-700 border-green-100' : 
              developer.availabilityStatus === 'OPEN_TO_OFFERS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
              'bg-slate-50 text-slate-600 border-slate-100'}
            px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border
          `}>
            {developer.availabilityStatus.replace(/_/g, ' ')}
          </Badge>

          <Link href={`/developers/${developer.id}`}>
            <Button variant="ghost" className="text-[#52796F] hover:text-[#354F52] hover:bg-[#f4f6f5] font-bold text-sm h-9 px-4 rounded-xl">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function DeveloperSkeleton() {
  return (
    <Card className="overflow-hidden border-[#CAD2C5] rounded-3xl bg-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-50 rounded-lg w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-50 rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-slate-50 rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-slate-50 rounded-full w-14 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between">
          <div className="h-6 bg-slate-50 rounded-full w-24 animate-pulse" />
          <div className="h-9 bg-slate-50 rounded-xl w-28 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
