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
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-32 animate-in fade-in duration-1000">
      <div className="container mx-auto px-4 xl:max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-6">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-amber-50 text-amber-600 border-amber-100 px-4 py-1.5">
              ELITE DISCOVERY
           </Badge>
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter">
              Developer <span className="text-primary italic">Spotlight</span>
           </h1>
           <p className="text-xl text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
              Exceptional engineering talent, featured for their specialized skills, unique perspectives, and verified contributions to the ecosystem.
           </p>
        </div>

        {/* Existing Component - assuming it will be styled with shadcn later or is already compliant */}
        <SpotlightSection dayDev={dayDev} weekDev={weekDev} loading={false} />

        {/* Educational Section */}
        <Card className="mt-32 rounded-[4rem] border-none shadow-3xl shadow-slate-200/50 overflow-hidden bg-slate-900 text-white relative">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-80 -mt-80" />
           
           <CardContent className="p-12 md:p-24 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Want to claim your <span className="text-amber-400">Spotlight?</span></h2>
                       <p className="text-slate-400 font-medium text-lg max-w-md">
                          Standalone from the crowd. Featured developers receive <span className="text-white font-bold italic">10x more engagement</span> and priority placement in search results.
                       </p>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                       <StepItem number="01" title="Protocol Verification" desc="Undergo our security audit to ensure code quality and trust." />
                       <StepItem number="02" title="Portfolio Sync" desc="Showcase your elite projects with high-fidelity assets." />
                       <StepItem number="03" title="Slot Activation" desc="Deploy your profile to the daily or weekly spotlight grid." />
                    </div>

                    <Button asChild className="h-16 rounded-[2rem] px-10 font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 transition-all text-lg group">
                       <Link href="/profile/me?buySpotlight=true">
                          Go to Dashboard <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                       </Link>
                    </Button>
                 </div>

                 <div className="hidden lg:block relative">
                    <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 p-12 flex flex-col justify-center gap-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/10" />
                       
                       <div className="space-y-2 relative z-10">
                          <Badge className="bg-amber-400 text-slate-900 font-black text-[10px] uppercase rounded-lg">LIVE METRIC</Badge>
                          <h3 className="text-6xl font-black">10.4x</h3>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Engagement Multiplier</p>
                       </div>
                       
                       <Separator className="bg-white/10" />
                       
                       <div className="grid grid-cols-2 gap-8 relative z-10">
                          <div className="space-y-1">
                             <p className="text-2xl font-black text-emerald-400">92%</p>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Interview Rate</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-2xl font-black text-primary">50k+</p>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ecosystem Views</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary rounded-full blur-[80px]" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-amber-400 rounded-full blur-[80px]" />
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <span className="text-4xl font-black text-white/10 group-hover:text-primary/40 transition-colors leading-none">{number}</span>
      <div className="space-y-1">
         <h4 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">{title}</h4>
         <p className="text-sm font-medium text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
