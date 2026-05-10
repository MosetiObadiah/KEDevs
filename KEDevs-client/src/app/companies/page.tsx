'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  MapPin, 
  FilterX,
  ArrowRight,
  Layers,
  Building2,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/companyService';
import { INDUSTRIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompaniesPage() {
  const { isLoggedIn, user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await companyService.getPublicCompanies(0, 50);
        if (response.success) {
          setCompanies(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch companies. Please try again later.');
        console.error(err);
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
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row justify-end items-center mb-6 space-y-4 md:space-y-0 print:hidden">
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8 print:hidden">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Employers</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Name or keyword..." 
                      className="pl-10 text-sm border-border/50 focus-visible:ring-primary/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Industry</label>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Industries</SelectItem>
                      {INDUSTRIES.map(i => (
                         <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || industryFilter !== 'All') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-muted-foreground"
                    onClick={() => {
                      setSearchTerm('');
                      setIndustryFilter('All');
                    }}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Results Area */}
          <main className="lg:col-span-3 print:col-span-full">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="p-8 flex flex-col items-center border-border/50">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </Card>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <Card key={company.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden">
                    <CardContent className="p-8 text-center flex-1">
                      <Link href={`/companies/${company.id}`} className="inline-block relative mb-6">
                        <Avatar className="h-20 w-20 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm">
                          <AvatarImage src={company.logoUrl} className="object-contain p-2" />
                          <AvatarFallback className="bg-slate-900 text-white font-black text-2xl uppercase">
                             {company.companyName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {company.isApproved && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500 text-white" />
                          </div>
                        )}
                      </Link>
                      
                      <div className="mb-4">
                        <Link href={`/companies/${company.id}`}>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                            {company.companyName}
                          </h3>
                        </Link>
                        <p className="text-sm font-semibold text-muted-foreground">{company.industry || 'Tech Ecosystem'}</p>
                      </div>

                      <Badge 
                        variant="secondary"
                        className="mb-6 text-[10px] uppercase font-black px-2 shadow-sm bg-muted/50"
                      >
                        {company.companySize?.replace(/_/g, ' ') || 'Growing'}
                      </Badge>

                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest print:hidden">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {company.locationHQ}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="h-8 px-3 font-bold group/btn" asChild>
                          <Link href={`/companies/${company.id}`}>
                            View <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FilterX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">No companies found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setIndustryFilter('All'); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
