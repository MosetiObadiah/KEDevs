'use client';

import { useQuery } from '@tanstack/react-query';
import { getExternalJobs } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Briefcase, MapPin, Clock, ArrowUpCircle, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function JobsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'external'],
    queryFn: () => getExternalJobs({ size: 6 }),
  });

  const jobs = data?.content ?? [];

  return (
    <section id="jobs" className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border-[#52796F]/20">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Opportunities
            </Badge>
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">Latest Tech Roles</h2>
            <p className="text-[#84A98C] text-lg max-w-xl">
              Discover verified opportunities from top companies in the Kenyan tech ecosystem.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-[#CAD2C5] text-[#2F3E46] hover:bg-[#f4f6f5] group">
              Browse All Jobs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-[#f4f6f5] animate-pulse" />
            ))
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="group hover:border-[#52796F]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#52796F]/5 border-[#CAD2C5]/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2F3E46] text-lg group-hover:text-[#52796F] transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-[#84A98C] text-sm font-medium">{job.companyName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f6f5] text-[#52796F] text-xs font-bold">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      {job.upvotes}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="bg-[#CAD2C5]/20 text-[#354F52] hover:bg-[#CAD2C5]/30 border-0">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[#84A98C] text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.locationCity || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.workType}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/login?from=/jobs/${job.id}`} className="w-full">
                    <Button variant="ghost" className="w-full justify-between hover:bg-[#52796F]/5 text-[#52796F] group/btn">
                      View details
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-[#f4f6f5] rounded-3xl border-2 border-dashed border-[#CAD2C5]">
              <p className="text-[#84A98C]">No job posts available right now. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
