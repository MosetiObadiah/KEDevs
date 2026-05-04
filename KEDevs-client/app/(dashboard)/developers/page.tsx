'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { DeveloperCard, DeveloperSkeleton } from '@/components/developers/DeveloperCard';
import { DeveloperFilterPanel } from '@/components/developers/DeveloperFilterPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PaywallModal } from '@/components/shared/paywall-modal';

export default function DevelopersPage() {
  const [filters, setFilters] = useState<any>({});
  const [isFiltered, setIsFiltered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Default unfiltered query
  const publicQuery = useInfiniteQuery({
    queryKey: ['developers', 'public'],
    queryFn: ({ pageParam = 0 }) => profileApi.getPublicDevelopers({ page: pageParam, size: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => (lastPage?.last ? undefined : (lastPage?.number ?? 0) + 1),
    enabled: !isFiltered,
  });

  // Filter mutation (for checking permissions/tokens)
  const filterMutation = useMutation({
    mutationFn: (f: any) => profileApi.filterDevelopers(f, { page: 0, size: 10 }),
    onSuccess: (data) => {
      setIsFiltered(true);
    },
    onError: (error: any) => {
      if (error.response?.status === 402 || error.response?.status === 403) {
        setShowPaywall(true);
        toast.error('PRO Account required for advanced filtering');
      } else {
        toast.error('Failed to apply filters');
      }
    }
  });

  const handleFilter = (newFilters: any) => {
    if (Object.keys(newFilters || {}).length === 0) {
      setIsFiltered(false);
      setFilters({});
      return;
    }
    setFilters(newFilters);
    filterMutation.mutate(newFilters);
  };

  const developers = isFiltered 
    ? filterMutation.data?.content || [] 
    : (publicQuery.data?.pages || []).flatMap(p => p?.content || []) || [];

  const isLoading = isFiltered ? filterMutation.isPending : publicQuery.isLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Developer Directory</h1>
          <p className="text-muted-foreground mt-1 font-medium">Connect with the best technical talent in Kenya</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1">
          <DeveloperFilterPanel onFilter={handleFilter} isLoading={isLoading} />
        </aside>

        {/* Developer List */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: 5 }).map((_, i) => <DeveloperSkeleton key={i} />)}
            </div>
          ) : developers.length === 0 ? (
            <div className="py-24 text-center bg-secondary/10 rounded-[40px] border-2 border-dashed border-secondary">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No developers match your filters</h3>
              <p className="text-muted-foreground text-sm">Try broadening your search criteria.</p>
              <Button variant="link" onClick={() => handleFilter({})} className="mt-4 text-primary font-bold">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {developers.map((dev: any) => (
                <DeveloperCard key={dev?.id || Math.random()} developer={dev} />
              ))}
              
              {!isFiltered && publicQuery.hasNextPage && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => publicQuery.fetchNextPage()}
                    disabled={publicQuery.isFetchingNextPage}
                    className="border-secondary text-foreground font-bold h-12 px-12 rounded-xl hover:bg-secondary/10"
                  >
                    {publicQuery.isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load more talent'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
        title="Advanced Filters are PRO"
        description="Upgrade to KEDevs PRO to unlock unlimited developer filtering, direct contacts, and advanced talent discovery."
      />
    </div>
  );
}
