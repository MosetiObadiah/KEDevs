'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/services/paymentService';
import {
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';

export default function PricingPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleAction = (href: string) => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push(href);
    }
  };

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
      <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading pricing plans...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <PageContainer className="max-w-full px-8 xl:px-16 pt-8 pb-12">
        
        {/* Page Title & Subtitle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pricing Plans</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Simple, upfront pricing. Boost visibility, feature jobs, or verify identity with M-Pesa.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Identity Verification */}
          <Card className="bg-white rounded-2xl border border-slate-100 flex flex-col h-full transition-all duration-300 hover:border-slate-200 relative shadow-none">
            <CardHeader className="p-8 pb-6">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-1">Verified Badge</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                Establish trust with a permanent identity check.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 flex-1">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black tracking-tighter text-slate-900">
                    <span className="text-sm text-slate-500 mr-1 font-medium">KES</span>
                    {getPrice('VERIFICATION_FEE_DEVELOPER', '250')}
                  </div>
                  <div className="text-xs font-medium text-slate-500 pb-1 uppercase tracking-widest">/ Devs</div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black tracking-tighter text-slate-700">
                    <span className="text-xs text-slate-500 mr-1 font-medium">KES</span>
                    {getPrice('VERIFICATION_FEE_EMPLOYER', '500')}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 pb-1 uppercase tracking-widest">/ Employers</div>
                </div>
              </div>
              <ul className="space-y-4 pt-6 border-t border-slate-100/60">
                {[
                  'Permanent Verified Badge profile icon',
                  'Increased trust from employers/talent',
                  'Priority placement in search results',
                  'One-time payment, valid forever'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-azure-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={() => handleAction('/verify')} 
                className="w-full bg-azure-600 hover:bg-azure-700 text-white rounded-2xl font-medium h-14 text-sm uppercase tracking-wider transition-all"
              >
                Get Verified <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Job Pinning */}
          <Card className="bg-white rounded-2xl border border-slate-100 flex flex-col h-full transition-all duration-300 hover:border-slate-200 relative shadow-none">
            <div className="absolute top-8 right-8">
              <Badge className="bg-azure-50 text-azure-600 border-none font-medium uppercase tracking-wider text-[10px] py-1 px-3 rounded-full hover:bg-azure-100">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="p-8 pb-6">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-1">Feature a Job</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                Pin your job to the top of the board for maximum reach.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 flex-1">
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-100/60 pb-3">
                  <div className="text-xs font-medium uppercase tracking-widest text-slate-500">1 Day Boost</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-500 mr-1 font-medium">KES</span>{getPrice('PINNED_JOB_DAY_FEE', '50')}
                  </div>
                </div>
                <div className="flex items-end justify-between border-b border-slate-100/60 pb-3">
                  <div className="text-xs font-medium uppercase tracking-widest text-azure-600">3 Days Featured</div>
                  <div className="text-3xl font-black tracking-tighter text-azure-600">
                    <span className="text-sm text-azure-400 mr-1 font-medium">KES</span>{getPrice('PINNED_JOB_3DAYS_FEE', '125')}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xs font-medium uppercase tracking-widest text-slate-500">7 Days Premium</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-500 mr-1 font-medium">KES</span>{getPrice('PINNED_JOB_7DAYS_FEE', '250')}
                  </div>
                </div>
              </div>
              <ul className="space-y-4 pt-6 border-t border-slate-100/60">
                {[
                  'Pinned to the top of the Jobs feed',
                  'Distinct "Pinned" badge to stand out',
                  'Up to 5x more views and applications',
                  'Only 3 slots available at any time'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-azure-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={() => handleAction('/jobs/post')} 
                className="w-full bg-azure-600 hover:bg-azure-700 text-white rounded-2xl font-medium h-14 text-sm uppercase tracking-wider transition-all"
              >
                Post & Pin a Job <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Developer Spotlight */}
          <Card className="bg-white rounded-2xl border border-slate-100 flex flex-col h-full transition-all duration-300 hover:border-slate-200 relative shadow-none">
            <CardHeader className="p-8 pb-6">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-1">Talent Spotlight</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                Showcase your profile to top hiring companies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 flex-1">
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-100/60 pb-3">
                  <div className="text-xs font-medium uppercase tracking-widest text-slate-500">24 Hour Feature</div>
                  <div className="text-xl font-black tracking-tighter text-slate-900">
                    <span className="text-xs text-slate-500 mr-1 font-medium">KES</span>{getPrice('SPOTLIGHT_DAY_FEE', '50')}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xs font-medium uppercase tracking-widest text-azure-600">7 Day Feature</div>
                  <div className="text-3xl font-black tracking-tighter text-azure-600">
                    {/* DEVELOPER NOTE: Talent Spotlight KES 1 prices are placeholders. Ensure settings are seeded in production. */}
                    <span className="text-sm text-azure-400 mr-1 font-medium">KES</span>{getPrice('SPOTLIGHT_WEEK_FEE', '250')}
                  </div>
                </div>
              </div>
              <ul className="space-y-4 pt-6 border-t border-slate-100/60">
                {[
                  'Featured on the Spotlight page',
                  'Highlighted profile card in search',
                  'Increased profile views from employers',
                  'Limited to 5 slots at any given time'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-azure-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={() => handleAction('/spotlight')} 
                className="w-full bg-azure-600 hover:bg-azure-700 text-white rounded-2xl font-medium h-14 text-sm uppercase tracking-wider transition-all"
              >
                Join Spotlight <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

        </div>
      </PageContainer>
    </div>
  );
}
