'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getPublicEmployers } from '@/lib/api/employers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, MapPin, Briefcase, ChevronRight, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function CompaniesPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['companies', 'public'],
    queryFn: ({ pageParam = 0 }) => getPublicEmployers({ page: pageParam, size: 12 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const companies = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <div className="min-h-screen bg-[#f4f6f5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border-[#52796F]/20">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Employer Directory
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2F3E46] mb-4">Discover Top Companies</h1>
          <p className="text-[#84A98C] text-lg max-w-2xl">
            Explore the companies hiring Kenya's best tech talent. From early-stage startups to industry giants.
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-white animate-pulse shadow-sm" />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map((company) => {
                const initials = company.companyName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'C';

                return (
                  <Card key={company.id} className="group hover:border-[#52796F]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#52796F]/5 border-[#CAD2C5]/50 bg-white overflow-hidden rounded-[32px]">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 rounded-2xl border-2 border-[#f4f6f5] shadow-sm">
                          <AvatarImage src={company.logoUrl} alt={company.companyName} />
                          <AvatarFallback className="bg-[#CAD2C5] text-[#2F3E46] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#2F3E46] text-xl group-hover:text-[#52796F] transition-colors truncate">
                            {company.companyName}
                          </h3>
                          <p className="text-[#84A98C] text-sm font-medium truncate">{company.industry}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-4">
                      <div className="flex flex-wrap gap-4 text-[#84A98C] text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {company.locationHQ || 'Kenya'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {String(company.companySize || 'Unknown').replace(/_/g, ' ').toLowerCase()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#f4f6f5] rounded-xl text-[#52796F] w-fit">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-bold">{company.activeJobsCount} active jobs</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/companies/${company.id}`} className="w-full">
                        <Button variant="ghost" className="w-full justify-between hover:bg-[#52796F]/5 text-[#52796F] group/btn font-bold">
                          View Company Profile
                          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {hasNextPage && (
              <div ref={ref} className="mt-12 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="w-8 h-8 border-4 border-[#52796F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Button onClick={() => fetchNextPage()} variant="outline" className="border-[#CAD2C5] text-[#52796F]">
                    Load More Companies
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center bg-white rounded-[32px] border-2 border-dashed border-[#CAD2C5]/50 shadow-sm">
            <div className="w-20 h-20 bg-[#f4f6f5] rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-[#CAD2C5]" />
            </div>
            <h3 className="text-xl font-bold text-[#2F3E46] mb-2">No companies found</h3>
            <p className="text-[#84A98C]">We couldn't find any companies at the moment. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
