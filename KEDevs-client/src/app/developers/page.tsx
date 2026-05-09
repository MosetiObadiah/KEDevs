'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Star, 
  Bookmark, 
  MapPin, 
  FilterX,
  ChevronRight,
  ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { DeveloperSummary } from '@/lib/types';
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DevelopersPage() {
  const { isLoggedIn, user } = useAuth();
  const [devs, setDevs] = useState<DeveloperSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('All');

  useEffect(() => {
    const fetchDevs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getPublicDevelopers(0, 50);
        if (response.success) {
          setDevs(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch developers. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevs();
  }, []);

  const filteredDevs = devs.filter(dev => 
    (
      `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dev.currentLastRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ) && (availability === 'All' || dev.availabilityStatus === availability)
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 space-y-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Talent Directory</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Kenyan <span className="text-primary">Developers</span>
          </h1>
          <p className="text-muted-foreground">Discover and connect with top-tier technical talent in Kenya.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Talent</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Name, role, or skill..." 
                      className="pl-10 text-sm border-border/50 focus-visible:ring-primary/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Availability</label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="border-border/50 focus:ring-primary/20">
                      <SelectValue placeholder="Any Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Availability</SelectItem>
                      <SelectItem value="AVAILABLE_NOW">Available Now</SelectItem>
                      <SelectItem value="OPEN_TO_OFFERS">Open to Offers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || availability !== 'All') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-muted-foreground"
                    onClick={() => {
                      setSearchTerm('');
                      setAvailability('All');
                    }}
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" /> Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Results Area */}
          <main className="lg:col-span-3">
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
              ) : filteredDevs.length > 0 ? (
                filteredDevs.map((dev) => (
                  <Card key={dev.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col overflow-hidden">
                    <CardContent className="p-8 text-center flex-1">
                      <Link href={`/developers/${dev.id}`} className="inline-block relative mb-6">
                        <Avatar className="h-20 w-20 border-4 border-muted group-hover:border-primary/20 transition-colors shadow-sm">
                          <AvatarImage src={dev.profilePhoto} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                            {dev.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {dev.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-primary fill-primary text-white" />
                          </div>
                        )}
                      </Link>
                      
                      <div className="mb-4">
                        <Link href={`/developers/${dev.id}`}>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                            {dev.firstName} {dev.lastName}
                          </h3>
                        </Link>
                        <p className="text-sm font-semibold text-muted-foreground">{dev.currentLastRole}</p>
                      </div>

                      <Badge 
                        variant={dev.availabilityStatus === 'AVAILABLE_NOW' ? 'default' : 'secondary'}
                        className={cn(
                          "mb-6 text-[10px] uppercase font-black px-2 shadow-sm",
                          dev.availabilityStatus === 'AVAILABLE_NOW' ? "bg-emerald-500 hover:bg-emerald-500" : ""
                        )}
                      >
                        {dev.availabilityStatus.replace('_', ' ')}
                      </Badge>
                      
                      {isLoggedIn && (user?.role === 'EMPLOYER' || user?.id === dev.id) && (
                        <div className="flex justify-center gap-2 mb-6">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <Mail className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Email</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>LinkedIn Profile</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full border border-border/50">
                                  <Phone className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Phone</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}

                      <div className="flex flex-wrap justify-center gap-1.5">
                        {dev.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-[10px] py-0 px-2 font-medium bg-muted/30 border-muted">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {dev.locationCity}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="h-8 px-3 font-bold group/btn" asChild>
                          <Link href={`/developers/${dev.id}`}>
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
                    <h3 className="text-xl font-bold">No developers found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setAvailability('All'); }}>
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

