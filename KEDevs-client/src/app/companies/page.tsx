'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  CheckCircle2, 
  MapPin, 
  FilterX,
  ArrowRight,
  Layers,
  Building2,
  Bookmark,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/companyService';
import { INDUSTRIES } from '@/lib/constants';
import { cn, formatCompanySize } from '@/lib/utils';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const COMPANY_SIZES = [
  { value: 'ONE_TO_TEN', label: '1-10 employees' },
  { value: 'ELEVEN_TO_FIFTY', label: '11-50 employees' },
  { value: 'FIFTY_ONE_TO_TWO_HUNDRED', label: '51-200 employees' },
  { value: 'TWO_HUNDRED_PLUS', label: '200+ employees' }
];

const KENYA_CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Naivasha', 'Nyeri', 'Machakos'
];

function CompaniesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isLoggedIn, user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchTerm = searchParams.get('search') || '';
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [locationHQ, setLocationHQ] = useState('All');

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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (format === 'pdf') {
      window.print();
      return;
    }
    
    setIsExporting(true);
    try {
      const headers = ['CompanyName', 'Industry', 'CompanySize', 'LocationHQ', 'Approved'];
      const rows = filteredCompanies.map(c => [
        `"${c.companyName || ''}"`,
        `"${c.industry || ''}"`,
        `"${c.companySize || ''}"`,
        `"${c.locationHQ || ''}"`,
        `"${c.isApproved ? 'YES' : 'NO'}"`
      ].join(','));
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueLocations = Array.from(new Set([...KENYA_CITIES, ...companies.map(c => c.locationHQ).filter(Boolean)])).sort();

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm || 
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesIndustry = selectedIndustries.length === 0 || 
      (company.industry && selectedIndustries.includes(company.industry));
      
    const matchesSize = selectedSizes.length === 0 || 
      (company.companySize && selectedSizes.includes(company.companySize));
      
    const matchesLocation = locationHQ === 'All' || 
      company.locationHQ === locationHQ;
      
    return matchesSearch && matchesIndustry && matchesSize && matchesLocation;
  });

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3 print:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-12 px-6" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4 text-primary" /> 
                    {isExporting ? 'Exporting...' : 'Export'}
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Download as CSV
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium">
                    <FileText className="mr-2 h-4 w-4" /> Download as PDF
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden print:block mb-8 border-b pb-4">
           <h1 className="text-2xl font-black text-black">KEDevs Ecosystem Report</h1>
           <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Industry</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl max-h-[180px] overflow-y-auto">
                    {INDUSTRIES.map(ind => (
                      <div key={ind} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`ind-${ind}`}
                          checked={selectedIndustries.includes(ind)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIndustries([...selectedIndustries, ind]);
                            } else {
                              setSelectedIndustries(selectedIndustries.filter(i => i !== ind));
                            }
                          }}
                        />
                        <Label htmlFor={`ind-${ind}`} className="text-xs font-medium cursor-pointer truncate">{ind}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Company Size</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl">
                    {COMPANY_SIZES.map(size => (
                      <div key={size.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sz-${size.value}`}
                          checked={selectedSizes.includes(size.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSizes([...selectedSizes, size.value]);
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size.value));
                            }
                          }}
                        />
                        <Label htmlFor={`sz-${size.value}`} className="text-xs font-medium cursor-pointer">{size.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">HQ Location</label>
                  <Select value={locationHQ} onValueChange={setLocationHQ}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Location</SelectItem>
                      {uniqueLocations.map(loc => (
                         <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || selectedIndustries.length > 0 || selectedSizes.length > 0 || locationHQ !== 'All') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-muted-foreground mt-2"
                    onClick={() => {
                      router.push(pathname);
                      setSelectedIndustries([]);
                      setSelectedSizes([]);
                      setLocationHQ('All');
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

                      <div className="flex flex-wrap justify-center items-center gap-1.5 mb-6">
                        {company.industry && (
                          <Badge variant="secondary" className="text-[9px] font-bold py-0 px-2 bg-primary/10 text-primary border-none rounded-md">
                            {company.industry}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] font-bold py-0 px-2 border-border bg-muted/20 text-muted-foreground rounded-md">
                          {formatCompanySize(company.companySize)}
                        </Badge>
                      </div>

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
                  {(searchTerm || selectedIndustries.length > 0 || selectedSizes.length > 0 || locationHQ !== 'All') && (
                    <Button variant="outline" onClick={() => {
                      router.push(pathname);
                      setSelectedIndustries([]);
                      setSelectedSizes([]);
                      setLocationHQ('All');
                    }}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CompaniesPageContent />
    </Suspense>
  );
}
