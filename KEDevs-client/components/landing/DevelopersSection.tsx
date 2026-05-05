'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicDevelopers } from '@/lib/api/developers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function DevelopersSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['developers', 'public'],
    queryFn: () => getPublicDevelopers({ size: 8 }),
  });

  const developers = data?.content ?? [];

  return (
    <section id="developers" className="py-24 px-6 bg-[#f4f6f5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border-[#52796F]/20">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Our Community
            </Badge>
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">Top Tech Talent</h2>
            <p className="text-[#84A98C] text-lg max-w-xl">
              Connect with skilled developers across mobile, web, cloud, and AI domains.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-[#CAD2C5] text-[#2F3E46] hover:bg-white group">
              View All Developers
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[320px] rounded-3xl bg-white animate-pulse" />
            ))
          ) : developers.length > 0 ? (
            developers.map((dev: any) => {
              // Handle DeveloperSummaryResponse fields (firstName, lastName) vs DeveloperProfile (fullName)
              const name = dev.fullName || `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || 'Developer';
              const initials = name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

              return (
                <Card key={dev.id} className="group hover:border-[#52796F]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#52796F]/5 border-[#CAD2C5]/50 bg-white">
                  <CardContent className="pt-8 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <Avatar className="w-20 h-20 ring-4 ring-[#f4f6f5] border-2 border-white">
                        <AvatarImage src={dev.profilePhoto || dev.profileImageUrl} />
                        <AvatarFallback className="bg-[#CAD2C5] text-[#2F3E46] text-xl font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {dev.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-[#4ccb8c]" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-[#2F3E46] text-lg group-hover:text-[#52796F] transition-colors truncate w-full px-2">
                      {name}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {dev.availability && (
                        <Badge variant="outline" className="bg-[#f4f6f5] text-[#52796F] text-[10px] px-3 py-1 rounded-full">
                          {String(dev.availability).replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())}
                        </Badge>
                      )}
                      {dev.isVerified && (
                        <Badge variant="outline" className="bg-[#f4f6f5] text-[#2F855A] text-[10px] px-3 py-1 rounded-full">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#84A98C] text-xs mb-2 h-8 line-clamp-2 px-2">
                      {dev.currentLastRole || dev.headline || 'Software Engineer'}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[#84A98C] text-[10px] mb-4">
                      <MapPin className="w-3 h-3" />
                      {dev.locationCity || 'Kenya'}
                      <span className="inline-flex items-center gap-1">•</span>
                      <span>{(dev.endorsements?.length ?? 0)} endorsements</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5 h-[52px] overflow-hidden">
                      {Array.isArray(dev.skills) && dev.skills.slice(0, 4).map((skill: any, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-[#f4f6f5] text-[#354F52] text-[10px] border-0">
                          {typeof skill === 'string' ? skill : skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/login?from=/developers/${dev.id}`} className="w-full">
                      <Button variant="ghost" className="w-full text-xs text-[#52796F] hover:bg-[#52796F]/5">
                        View Profile
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-[#CAD2C5]/50">
              <p className="text-[#84A98C]">Join the community to be the first developer here!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
