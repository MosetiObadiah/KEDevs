'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentService } from '@/services/paymentService';
import { 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Building2,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function PricingPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await paymentService.getSettings();
        if (response.success) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch pricing', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getPrice = (key: string, fallback: string) => {
    const setting = settings.find(s => s.settingKey === key);
    return setting ? setting.settingValue : fallback;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      {/* Header Section */}
      <div className="container mx-auto px-4 max-w-4xl text-center mb-20">
        <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
          Transparent Pricing
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
          Simple, upfront <span className="text-primary italic">pricing</span> for everyone.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Pay only for what you need. No hidden fees, no recurring subscriptions. 
          Boost your visibility or verify your identity with one-time payments via M-Pesa.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Identity Verification */}
          <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 hover:border-emerald-200 transition-colors group flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-emerald-500" />
            </div>
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight mb-2">Verified Badge</CardTitle>
              <CardDescription className="text-sm font-semibold text-slate-500">
                Establish trust with a permanent identity check.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black tracking-tighter text-slate-900">
                    <span className="text-lg text-slate-400 mr-1">KES</span>
                    {getPrice('VERIFICATION_FEE_DEVELOPER', '250')}
                  </div>
                  <div className="text-sm font-bold text-slate-400 pb-1 uppercase tracking-widest">/ Devs</div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black tracking-tighter text-slate-700">
                    <span className="text-base text-slate-400 mr-1">KES</span>
                    {getPrice('VERIFICATION_FEE_EMPLOYER', '500')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase tracking-widest">/ Employers</div>
                </div>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-100">
                {[
                  'Permanent Verified Badge profile icon',
                  'Increased trust from employers/talent',
                  'Priority placement in search results',
                  'One-time payment, valid forever'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-600 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button asChild className="w-full h-14 rounded-2xl font-black text-base shadow-lg bg-slate-900 hover:bg-slate-800 text-white">
                <Link href="/verify">
                  Get Verified <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Job Pinning */}
          <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10 bg-gradient-to-b from-white to-primary/[0.02] flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-primary" />
            <div className="absolute top-6 right-6">
              <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[10px] py-1 px-3">Most Popular</Badge>
            </div>
            <CardHeader className="p-8 pb-4 mt-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <TrendingUp className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight mb-2">Feature a Job</CardTitle>
              <CardDescription className="text-sm font-semibold text-slate-500">
                Pin your job to the top of the board for maximum reach.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-primary/10 pb-3">
                  <div className="text-sm font-black uppercase tracking-widest text-slate-500">1 Day Boost</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-400 mr-1">KES</span>{getPrice('PINNED_JOB_DAY_FEE', '50')}
                  </div>
                </div>
                <div className="flex items-end justify-between border-b border-primary/10 pb-3">
                  <div className="text-sm font-black uppercase tracking-widest text-primary">3 Days Featured</div>
                  <div className="text-2xl font-black tracking-tighter text-primary">
                    <span className="text-sm text-primary/60 mr-1">KES</span>{getPrice('PINNED_JOB_3DAYS_FEE', '125')}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-sm font-black uppercase tracking-widest text-slate-500">7 Days Premium</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-400 mr-1">KES</span>{getPrice('PINNED_JOB_7DAYS_FEE', '250')}
                  </div>
                </div>
              </div>
              <ul className="space-y-3 pt-4">
                {[
                  'Pinned to the top of the Jobs feed',
                  'Distinct "Pinned" badge to stand out',
                  'Up to 5x more views and applications',
                  'Only 3 slots available at any time'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-600 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button asChild className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]">
                <Link href="/jobs">
                  Post & Pin a Job <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Developer Spotlight */}
          <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 hover:border-violet-200 transition-colors group flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-32 h-32 text-violet-500" />
            </div>
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight mb-2">Talent Spotlight</CardTitle>
              <CardDescription className="text-sm font-semibold text-slate-500">
                Showcase your profile to top hiring companies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                  <div className="text-sm font-black uppercase tracking-widest text-slate-500">24 Hour Feature</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-400 mr-1">KES</span>{getPrice('SPOTLIGHT_DAY_FEE', '50')}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-sm font-black uppercase tracking-widest text-violet-600">7 Day Feature</div>
                  <div className="text-2xl font-black tracking-tighter text-violet-600">
                    <span className="text-sm text-violet-400 mr-1">KES</span>{getPrice('SPOTLIGHT_WEEK_FEE', '250')}
                  </div>
                </div>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-100">
                {[
                  'Featured on the Spotlight page',
                  'Highlighted profile card in search',
                  'Increased profile views from employers',
                  'Limited to 5 slots at any given time'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-600 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-black text-base border-2 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200">
                <Link href="/spotlight">
                  Join Spotlight <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
