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
import { toast } from 'react-hot-toast';
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
  { value: 'TEN_TO_FIFTY', label: '10-50 employees' },
  { value: 'FIFTY_TO_TWO_HUNDRED', label: '50-200 employees' },
  { value: 'TWO_HUNDRED_PLUS', label: '200+ employees' }
];

const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'];
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
  
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [country, setCountry] = useState('All');
  const [city, setCity] = useState('All');
  const [hasOpenJobs, setHasOpenJobs] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (selectedIndustries.length > 0) filters.industries = selectedIndustries;
      if (selectedSizes.length > 0) filters.sizes = selectedSizes;
      if (country !== 'All') filters.country = country;
      if (city !== 'All') filters.city = city;
      if (hasOpenJobs) filters.hasOpenJobs = true;

      const response = await companyService.getPublicCompanies(0, 100, filters);
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

  useEffect(() => {
    fetchCompanies();
  }, [selectedIndustries, selectedSizes, country, city, hasOpenJobs]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
        const filters: any = {};
        if (selectedIndustries.length > 0) filters.industries = selectedIndustries;
        if (selectedSizes.length > 0) filters.sizes = selectedSizes;
        if (country !== 'All') filters.country = country;
        if (city !== 'All') filters.city = city;
        if (hasOpenJobs) filters.hasOpenJobs = true;

        if (format === 'pdf') {
            const blob = await companyService.exportCompanies(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `companies_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('PDF Report generated successfully');
        } else {
            // CSV generation remains frontend-side for now or could be backend
            const headers = ['CompanyName', 'Industry', 'CompanySize', 'LocationHQ', 'OpenJobs'];
            const rows = companies.map(c => [
              `"${c.companyName || ''}"`,
              `"${c.industry || ''}"`,
              `"${formatCompanySize(c.companySize)}"`,
              `"${c.locationHQ || ''}"`,
              `"${c.openJobsCount || 0}"`
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
            toast.success('CSV Exported successfully');
        }
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Explore Ecosystem</h1>
            <p className="text-muted-foreground font-medium">Discover top tech companies and startups in Kenya.</p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8 print:hidden">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filters</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="open-jobs" className="text-xs font-bold text-primary uppercase">Hiring Now</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Show only companies with open roles</p>
                  </div>
                  <Checkbox 
                    id="open-jobs"
                    checked={hasOpenJobs}
                    onCheckedChange={(checked) => setHasOpenJobs(!!checked)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Industry</label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-xl max-h-[220px] overflow-y-auto">
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Country</label>
                    <Select value={country} onValueChange={(val) => { setCountry(val); setCity('All'); }}>
                      <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                        <SelectValue placeholder="Any Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">Any Country</SelectItem>
                        {COUNTRIES.map(c => (
                           <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {country === 'Kenya' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">City</label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="border-border/50 focus:ring-primary/20 text-xs h-9 rounded-lg">
                          <SelectValue placeholder="Any City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">Any City</SelectItem>
                          {KENYA_CITIES.map(loc => (
                             <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {(selectedIndustries.length > 0 || selectedSizes.length > 0 || country !== 'All' || city !== 'All' || hasOpenJobs) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-muted-foreground mt-2"
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedSizes([]);
                      setCountry('All');
                      setCity('All');
                      setHasOpenJobs(false);
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
                  <Card key={i} className="p-8 flex flex-col items-center border-border/50 shadow-sm animate-pulse">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </Card>
                ))
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <Card key={company.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden bg-background">
                    <CardContent className="p-8 text-center flex-1 relative">
                      {company.openJobsCount > 0 && (
                        <div className="absolute top-4 right-4">
                           <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {company.openJobsCount} Open Roles
                           </Badge>
                        </div>
                      )}
                      
                      <Link href={`/companies/${company.id}`} className="inline-block relative mb-6">
                        <Avatar className="h-24 w-24 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm bg-white">
                          <AvatarImage src={company.logoUrl} className="object-contain p-3" />
                          <AvatarFallback className="bg-slate-900 text-white font-black text-2xl uppercase">
                             {company.companyName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      
                      <div className="mb-4">
                        <Link href={`/companies/${company.id}`} className="flex items-center justify-center gap-2 group/title">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {company.companyName}
                          </h3>
                          {company.companyWebsite && (
                            <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                               <Layers className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </Link>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          {company.industry || 'Tech Ecosystem'}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-3 border-border bg-muted/20 text-muted-foreground rounded-full">
                          {formatCompanySize(company.companySize)}
                        </Badge>
                      </div>

                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-muted/5 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        {company.locationHQ}
                      </div>
                      <Button size="sm" className="h-8 px-4 font-bold group/btn rounded-full" asChild>
                        <Link href={`/companies/${company.id}`}>
                          Profile <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">No companies found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => {
                    setSelectedIndustries([]);
                    setSelectedSizes([]);
                    setCountry('All');
                    setCity('All');
                    setHasOpenJobs(false);
                  }}>
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
