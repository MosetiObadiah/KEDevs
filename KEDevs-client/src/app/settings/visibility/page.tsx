'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  Bell,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  MessageSquare,
  Settings,
  Shield,
  Search
} from 'lucide-react';
import { developerService } from '@/services/developerService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { Info } from 'lucide-react';

export default function VisibilitySettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await developerService.getMyProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      toast.error('Failed to load visibility settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReachOut = async () => {
    if (!profile) return;
    const newVal = !profile.canEmployersReachOut;
    setProfile({ ...profile, canEmployersReachOut: newVal });

    try {
      const response = await developerService.updateProfile({ canEmployersReachOut: newVal });
      if (response.success) {
        toast.success(newVal ? 'Other users can now reach out' : 'Direct outreach disabled');
      }
    } catch (error) {
      toast.error('Failed to update preference');
      setProfile(profile);
    }
  };

  const handleVisibilityChange = async (value: string) => {
    setProfile({ ...profile, profileVisibility: value });
    try {
      const response = await developerService.updateVisibility({ profileVisibility: value });
      if (response.success) {
        toast.success(`Profile visibility set to ${value.toLowerCase()}`);
      }
    } catch (error) {
      toast.error('Failed to update visibility');
      setProfile(profile);
    }
  };

  const handleAvailabilityChange = async (value: string) => {
    setProfile({ ...profile, availabilityStatus: value });
    try {
      const response = await developerService.updateAvailability({ availabilityStatus: value });
      if (response.success) {
        toast.success(`Availability status updated`);
      }
    } catch (error) {
      toast.error('Failed to update availability');
      setProfile(profile);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-muted/30">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Configuring visibility...</p>
      </div>
    );
  }

  const visibilityInfo = {
    PUBLIC: "Visible to everyone. Indexed for search and accessible to both guests and members.",
    PRIVATE: "Restricted visibility. Hidden from directory and search. Only accessible via direct link to logged-in users.",
    HIDDEN: "Total invisibility. Removed from search and directory. Even direct links will return 'Not Found'."
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-muted/30">
        <div className="container mx-auto px-6 pt-8 pb-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-end items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex gap-3">
              <Button variant="outline" className="font-medium border-primary/20 hover:bg-primary/5 h-11" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <Card className="border-border/50 shadow-sm sticky top-24">
                <CardHeader className="pb-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Navigation</h3>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground" asChild>
                    <Link href="/settings/notifications">
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                  </Button>
                  <Button variant="secondary" className="w-full justify-start font-medium h-10 gap-3 bg-primary/5 text-primary border-none">
                    <Eye className="h-4 w-4" /> Visibility
                  </Button>
                  <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground opacity-50 cursor-not-allowed">
                    <Settings className="h-4 w-4" /> Account
                  </Button>
                  <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground opacity-50 cursor-not-allowed">
                    <Shield className="h-4 w-4" /> Privacy
                  </Button>
                </CardContent>

              </Card>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 space-y-8">
              <Card className="border-border/50 shadow-sm overflow-hidden bg-white rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-border/50">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium">Visibility & Preferences</CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">Control your accessibility to potential employers and developers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    <div className="p-6 flex items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm tracking-tight">Recruitment Contact</h3>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">Can other users reach out to me directly?</p>
                      </div>
                      <Switch
                        checked={profile?.canEmployersReachOut || false}
                        onCheckedChange={handleToggleReachOut}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <div className="p-6 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm tracking-tight">Availability Status</h3>
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed">Let employers know your current commitment level</p>
                        </div>
                      </div>
                      <Select value={profile?.availabilityStatus} onValueChange={handleAvailabilityChange}>
                        <SelectTrigger className="w-full h-11 rounded-xl border-border/50 font-medium bg-muted/5">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                          <SelectItem value="OPEN_TO_OFFERS">🟡 Open to Offers</SelectItem>
                          <SelectItem value="NOT_AVAILABLE">🔴 Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-6 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground text-sm tracking-tight">Privacy Mode</h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px] p-3 text-xs leading-relaxed" side="right">
                                Hover over the options below to see how each mode impacts your visibility.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed">Control who sees your profile in the ecosystem</p>
                        </div>
                      </div>
                      <Select value={profile?.profileVisibility} onValueChange={handleVisibilityChange}>
                        <SelectTrigger className="w-full h-11 rounded-xl border-border/50 font-medium bg-muted/5">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><SelectItem value="PUBLIC">🌎 Public Search</SelectItem></div>
                            </TooltipTrigger>
                            <TooltipContent side="right">{visibilityInfo.PUBLIC}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><SelectItem value="PRIVATE">🔒 Private Link Only</SelectItem></div>
                            </TooltipTrigger>
                            <TooltipContent side="right">{visibilityInfo.PRIVATE}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><SelectItem value="HIDDEN">👻 Hidden (Ghost mode)</SelectItem></div>
                            </TooltipTrigger>
                            <TooltipContent side="right">{visibilityInfo.HIDDEN}</TooltipContent>
                          </Tooltip>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-primary/5 rounded-2xl border border-primary/10 p-8 flex items-start gap-6">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border/50 flex-shrink-0">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">SEO Search</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    When your profile is set to Public, it will be indexed by our internal search protocols and external search engines.
                    Private profiles are only accessible via direct encrypted links.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

