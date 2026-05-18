'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Users,
  Globe,
  Loader2,
  Star,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Award
} from 'lucide-react';
import { developerService } from '@/services/developerService';
import SpotlightSection from '@/components/home/SpotlightSection';
import { cn, formatDateString } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SpotlightPage() {
  const [dayDev, setDayDev] = useState<any>(null);
  const [weekDev, setWeekDev] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pastDevs, setPastDevs] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchSpotlights = async () => {
      try {
        const response = await developerService.getCurrentSpotlight();
        if (response.success) {
          setDayDev(response.data.daySlot);
          setWeekDev(response.data.weekSlot);
        }
      } catch (err) {
        console.error('Failed to fetch spotlights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlights();

    const fetchPastSpotlights = async () => {
      setLoadingPast(true);
      try {
        const response = await developerService.getPastSpotlights(0, 20);
        if (response.success) {
          setPastDevs(response.data.content);
        }
      } catch (err) {
        console.error('Failed to fetch past spotlights', err);
      } finally {
        setLoadingPast(false);
      }
    };
    fetchPastSpotlights();
  }, []);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/v1/spotlight/past/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `past_spotlights.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Illuminating talent...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">

        {/* Spotlight Grid */}
        <div className="-mx-6">
          <SpotlightSection dayDev={dayDev} weekDev={weekDev} loading={false} hideTitle={true} />
        </div>

        {/* Past Spotlights Section */}
        <div className="mt-16 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-medium tracking-tight">History</h2>
              </div>
              <p className="text-sm text-muted-foreground">Past featured developers on KEDevs</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-medium gap-2 border-primary/20 hover:bg-primary/5" disabled={isExporting}>
                  <Download className="h-4 w-4 text-primary" /> {isExporting ? 'Exporting...' : 'Export History'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium py-2">
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-cyan-600" /> Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium py-2">
                  <FileText className="mr-2 h-4 w-4 text-primary" /> Download as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card className="border-border/50 overflow-hidden shadow-xl shadow-primary/5 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-muted-foreground">Developer</th>
                    <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-muted-foreground">Spotlight Type</th>
                    <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-muted-foreground text-right">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loadingPast ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-xl" /></td>
                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-32 ml-auto" /></td>
                      </tr>
                    ))
                  ) : pastDevs.length > 0 ? (
                    pastDevs.map((spot) => (
                      <tr key={spot.slotId} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/developers/${spot.developerId}`} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover:border-primary/20 transition-all">
                              <AvatarImage src={spot.profilePhoto} />
                              <AvatarFallback className="text-xs font-black bg-primary text-primary-foreground">
                                {spot.developerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors text-slate-900">{spot.developerName}</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{spot.currentLastRole}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">
                            {spot.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Calendar className="h-3 w-3 text-primary" />
                            {formatDateString(spot.startDate)} — {formatDateString(spot.endDate)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center flex flex-col items-center">
                        <Award className="h-12 w-12 text-muted/20 mb-4" />
                        <p className="text-sm text-muted-foreground font-medium italic">No past spotlights recorded yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
