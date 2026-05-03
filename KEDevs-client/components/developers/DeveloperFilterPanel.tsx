'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Users,
  Briefcase,
  MapPin,
  Sparkles,
  Plus,
  Loader2
} from 'lucide-react';
import { AvailabilityStatus, YearsOfExperience, WorkType } from '@/lib/types/user';

interface DeveloperFilters {
  availabilityStatus?: AvailabilityStatus;
  yearsOfExperience?: YearsOfExperience;
  skills?: string[];
  preferredWorkType?: WorkType;
  locationCity?: string;
  isVerified?: boolean;
}

interface DeveloperFilterPanelProps {
  onFilter: (filters: DeveloperFilters) => void;
  isLoading?: boolean;
}

export function DeveloperFilterPanel({ onFilter, isLoading }: DeveloperFilterPanelProps) {
  const [filters, setFilters] = useState<DeveloperFilters>({});
  const [skillInput, setSkillInput] = useState('');

  const handleApply = () => {
    onFilter(filters);
  };

  const addSkill = () => {
    if (skillInput && !filters.skills?.includes(skillInput)) {
      setFilters({ ...filters, skills: [...(filters.skills || []), skillInput] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills?.filter(s => s !== skill) });
  };

  const reset = () => {
    setFilters({});
    onFilter({});
  };

  return (
    <Card className="border-[#8ce5b8] rounded-[32px] bg-white shadow-sm overflow-hidden sticky top-24">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#4ccb8c]" />
          <CardTitle className="text-lg font-bold text-[#0b1a13]">Filters</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-[#52a37a] font-bold text-xs h-8">
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Availability */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-black text-[#52a37a]">Availability</Label>
          <Select 
            value={filters.availabilityStatus || ''} 
            onValueChange={(val) => setFilters({ ...filters, availabilityStatus: val as AvailabilityStatus })}
          >
            <SelectTrigger className="rounded-xl border-[#8ce5b8] bg-[#f2faf6] h-11">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#8ce5b8]">
              <SelectItem value="AVAILABLE_NOW">Available Now</SelectItem>
              <SelectItem value="OPEN_TO_OFFERS">Open to Offers</SelectItem>
              <SelectItem value="BUSY">Busy / Not looking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-black text-[#52a37a]">Experience Level</Label>
          <Select 
            value={filters.yearsOfExperience || ''} 
            onValueChange={(val) => setFilters({ ...filters, yearsOfExperience: val as YearsOfExperience })}
          >
            <SelectTrigger className="rounded-xl border-[#8ce5b8] bg-[#f2faf6] h-11">
              <SelectValue placeholder="Any Experience" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#8ce5b8]">
              <SelectItem value="ENTRY_LEVEL">Entry Level (0-1y)</SelectItem>
              <SelectItem value="ONE_TO_THREE">Junior (1-3y)</SelectItem>
              <SelectItem value="THREE_TO_FIVE">Mid-level (3-5y)</SelectItem>
              <SelectItem value="FIVE_PLUS">Senior (5+y)</SelectItem>
              <SelectItem value="TEN_PLUS">Lead / Architect (10+y)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Work Type */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-black text-[#52a37a]">Work Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {['REMOTE', 'HYBRID', 'ONSITE'].map((mode) => (
              <Button
                key={mode}
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, preferredWorkType: mode as WorkType })}
                className={`rounded-xl h-9 text-xs font-bold ${filters.preferredWorkType === mode ? 'bg-[#4ccb8c] text-white border-[#4ccb8c]' : 'border-[#8ce5b8] text-[#0b1a13]'}`}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Skills Tag Input */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-black text-[#52a37a]">Skills Required</Label>
          <div className="relative">
            <Input 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="e.g. React, Go"
              className="rounded-xl border-[#8ce5b8] bg-[#f2faf6] h-11 pr-10"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={addSkill}
              className="absolute right-1 top-1 h-9 w-9 text-[#4ccb8c]"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.skills?.map(skill => (
              <Badge key={skill} className="bg-[#4ccb8c]/10 text-[#4ccb8c] border-transparent rounded-lg flex items-center gap-1 py-1 pr-1">
                {skill}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-black text-[#52a37a]">City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#52a37a]" />
            <Input 
              value={filters.locationCity || ''}
              onChange={(e) => setFilters({ ...filters, locationCity: e.target.value })}
              placeholder="Search by city"
              className="rounded-xl border-[#8ce5b8] bg-[#f2faf6] h-11 pl-9"
            />
          </div>
        </div>

        {/* Verified Only */}
        <div className="flex items-center space-x-3 p-4 bg-[#f2faf6] rounded-2xl border border-transparent hover:border-[#8ce5b8] transition-all cursor-pointer" 
             onClick={() => setFilters({ ...filters, isVerified: !filters.isVerified })}>
          <Checkbox 
            id="verified" 
            checked={filters.isVerified}
            onCheckedChange={(checked) => setFilters({ ...filters, isVerified: checked as boolean })}
            className="rounded-md border-[#8ce5b8] data-[state=checked]:bg-[#4ccb8c]"
          />
          <Label htmlFor="verified" className="text-sm font-bold text-[#0b1a13] cursor-pointer flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Verified Only
          </Label>
        </div>

        <Button 
          onClick={handleApply}
          disabled={isLoading}
          className="w-full bg-[#0b1a13] hover:bg-[#2a6f4d] text-white rounded-2xl h-14 font-black shadow-lg shadow-[#0b1a13]/20 mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply Filters'}
        </Button>
      </CardContent>
    </Card>
  );
}
