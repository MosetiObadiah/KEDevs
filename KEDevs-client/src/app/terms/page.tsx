'use client';

import React from 'react';
import { Shield, Scale, Info, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-32 animate-in fade-in duration-700">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
           <Badge variant="outline" className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-3 py-1">
              LEGAL FRAMEWORK
           </Badge>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
           <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Effective Date: May 7, 2026</p>
        </div>

        <Card className="rounded-xl-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardContent className="p-12 md:p-20 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Scale className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">1. Agreement to Terms</h2>
              </div>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms,
                then you may not access the Services.
              </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">2. User Accounts</h2>
              </div>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Info className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">3. Content</h2>
              </div>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.
                You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
              </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">4. Limitation of Liability</h2>
              </div>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                In no event shall KEDevs-Connect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect,
                incidental, special, consequential or punitive damages resulting from your access to or use of the Service.
              </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">5. Governing Law</h2>
              </div>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of Kenya,
                without regard to its conflict of law provisions.
              </p>
            </section>
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center">
           <p className="text-sm font-medium text-slate-500">Questions about our terms? <a href="/contact" className="text-primary hover:underline">Contact Legal Team</a></p>
        </div>
      </div>
    </div>
  );
}
