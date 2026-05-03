'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getJobs } from '@/lib/api/jobs';
import { JobCard, JobSkeleton } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobFormModal } from '@/components/jobs/JobFormModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { JobFilters as IJobFilters, WorkType, ExperienceLevel, JobType } from '@/lib/types/job';
import { useAuth } from '@/lib/auth/hooks';

import { Suspense } from 'react';

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = useMemo(() => {
    const f: IJobFilters = {};
    const keyword = searchParams.get('keyword');
    const workType = searchParams.get('workType');
    const exp = searchParams.get('experienceLevel');
    const jt = searchParams.get('jobType');
    
    if (keyword) f.keyword = keyword;
    if (workType) f.workType = workType as WorkType;
    if (exp) f.experienceLevel = exp as ExperienceLevel;
    if (jt) f.jobType = jt as JobType;
    
    return f;
  }, [searchParams]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam = 0 }) => getJobs({ ...filters, page: pageParam, size: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  const allJobs = data?.pages.flatMap((page) => page.content) || [];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2F3E46]">Developer Dashboard</h1>
          <p className="text-[#84A98C] mt-1 font-medium">Explore opportunities and community discussions</p>
        </div>
        
        {user && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#52796F]/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post a Job
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <JobFilters />
          </div>
        </aside>

        {/* Job List */}
        <main className="lg:col-span-3 space-y-6">
          {status === 'pending' ? (
            Array.from({ length: 5 }).map((_, i) => <JobSkeleton key={i} />)
          ) : status === 'error' ? (
            <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
              <p className="text-red-600 font-medium">Failed to load dashboard</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : allJobs.length === 0 ? (
            <div className="py-24 text-center bg-[#f4f6f5] rounded-[40px] border-2 border-dashed border-[#CAD2C5]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Info className="w-8 h-8 text-[#84A98C]" />
              </div>
              <h3 className="text-lg font-bold text-[#2F3E46] mb-1">No jobs found</h3>
              <p className="text-[#84A98C] text-sm">Try adjusting your filters to find more opportunities.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                {allJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {hasNextPage && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="border-[#CAD2C5] text-[#2F3E46] font-bold h-12 px-12 rounded-xl hover:bg-[#f4f6f5]"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading more...
                      </>
                    ) : (
                      'Load more opportunities'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <JobFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-10 bg-slate-200 rounded-xl w-64 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-lg w-48 animate-pulse" />
        </div>
        <div className="h-11 bg-slate-200 rounded-xl w-40 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse" />
        </aside>
        <main className="lg:col-span-3 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobSkeleton key={i} />
          ))}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
