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
  Star
} from 'lucide-react';
import { developerService } from '@/services/developerService';
import SpotlightSection from '@/components/home/SpotlightSection';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SpotlightPage() {
  const [dayDev, setDayDev] = useState<any>(null);
  const [weekDev, setWeekDev] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Illuminating talent...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 space-y-4 md:space-y-0">
           <div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Talent Spotlight</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
                Developer <span className="text-primary">Spotlight</span>
              </h1>
              <p className="text-muted-foreground mt-2">Exceptional engineering talent featured for their specialized skills and verified contributions.</p>
           </div>
        </div>

        {/* Spotlight Grid */}
        <div className="-mx-6">
          <SpotlightSection dayDev={dayDev} weekDev={weekDev} loading={false} hideTitle={true} />
        </div>

      </div>
    </div>
  );
}
