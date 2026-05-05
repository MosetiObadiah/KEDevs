'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const WORK_TYPES = ['REMOTE', 'ONSITE', 'HYBRID'];
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const EXP_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete('page'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string | null) => {
    startTransition(() => {
      router.push(`?${createQueryString(name, value)}`, { scroll: false });
    });
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleFilterChange('keyword', value || null);
    }, 500);
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname || '/dashboard');
    });
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'page').length;

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-[#CAD2C5]/50 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-[#2F3E46] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#52796F]" />
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-[#84A98C] hover:text-[#2F3E46]"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CAD2C5]" />
        <Input
          placeholder="Search jobs, skills..."
          className="pl-9 bg-[#f4f6f5] border-0 focus-visible:ring-1 focus-visible:ring-[#52796F]"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {/* Work Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#84A98C]">Work Type</label>
          <Select 
            value={searchParams.get('workType') || 'all'} 
            onValueChange={(val) => handleFilterChange('workType', val === 'all' ? null : val)}
          >
            <SelectTrigger className="bg-[#f4f6f5] border-0 h-10 rounded-xl">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {WORK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#84A98C]">Experience</label>
          <Select 
            value={searchParams.get('experienceLevel') || 'all'} 
            onValueChange={(val) => handleFilterChange('experienceLevel', val === 'all' ? null : val)}
          >
            <SelectTrigger className="bg-[#f4f6f5] border-0 h-10 rounded-xl">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any level</SelectItem>
              {EXP_LEVELS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#84A98C]">Job Category</label>
          <Select 
            value={searchParams.get('jobType') || 'all'} 
            onValueChange={(val) => handleFilterChange('jobType', val === 'all' ? null : val)}
          >
            <SelectTrigger className="bg-[#f4f6f5] border-0 h-10 rounded-xl">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center pt-2">
          <span className="text-[10px] text-[#52796F] animate-pulse font-medium">Updating results...</span>
        </div>
      )}
    </div>
  );
}
