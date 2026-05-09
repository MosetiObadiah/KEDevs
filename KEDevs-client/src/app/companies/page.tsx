'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Building2, 
  MapPin, 
  Layers, 
  BadgeCheck, 
  Filter, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { companyService } from '@/services/companyService';
import { INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await companyService.getPublicCompanies(0, 50);
        if (response.success) {
          setCompanies(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch company directory.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = industryFilter === 'All' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="container mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="mb-12">
         <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 mb-4 px-3 py-1">
            ECOSYSTEM DIRECTORY
         </Badge>
         <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Top Employers</h1>
         <p className="text-slate-500 font-semibold mt-2">Discover the most innovative tech companies hiring in Kenya</p>
      </div>

      {/* Modern Filter Bar */}
      <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-6 mb-12 bg-white">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                  placeholder="Search by company name or industry keywords..." 
                  className="pl-11 h-14 rounded-2xl bg-slate-50 border-none font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="md:col-span-4">
               <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-slate-600 px-6">
                     <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="All Industries" />
                     </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                     <SelectItem value="All" className="font-bold">All Industries</SelectItem>
                     {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="font-bold">{i}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
         </div>
      </Card>

      {error && (
         <div className="p-6 rounded-[2rem] bg-red-50 border border-red-100 flex gap-4 mb-8">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 leading-relaxed">{error}</p>
         </div>
      )}

      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
               <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />
            ))}
         </div>
      ) : filteredCompanies.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
               <Link key={company.id} href={`/companies/${company.id}`} className="group">
                  <Card className="rounded-[3rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 bg-white h-full flex flex-col">
                     <CardContent className="p-10 text-center flex-1 flex flex-col">
                        <div className="relative mx-auto mb-6">
                           <Avatar className="h-24 w-24 rounded-[2rem] border-2 border-slate-50 shadow-sm group-hover:border-primary/20 transition-all bg-white">
                              <AvatarImage src={company.logoUrl} className="object-contain p-4" />
                              <AvatarFallback className="bg-slate-900 text-white font-black text-2xl uppercase">
                                 {company.companyName.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                           {company.isApproved && (
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-xl p-1 shadow-md">
                                 <BadgeCheck className="h-5 w-5 text-emerald-500" />
                              </div>
                           )}
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{company.companyName}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{company.industry || 'TECH ECOSYSTEM'}</p>
                        
                        <div className="space-y-4 mb-8">
                           <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                              <MapPin className="h-3.5 w-3.5 text-primary" /> {company.locationHQ}
                           </div>
                           <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                              <Layers className="h-3.5 w-3.5 text-emerald-500" /> {company.companySize?.replace(/_/g, ' ') || 'Growing'}
                           </div>
                        </div>

                        <div className="mt-auto">
                           <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 group-hover:bg-primary group-hover:text-white transition-all w-full h-12">
                              View Profile <ArrowRight className="h-3 w-3" />
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               </Link>
            ))}
         </div>
      ) : (
         <div className="text-center py-20 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center">
            <Building2 className="h-20 w-20 text-slate-100 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Matching Companies</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
               Try adjusting your search terms or industry filters to find what you're looking for.
            </p>
         </div>
      )}
    </div>
  );
}
