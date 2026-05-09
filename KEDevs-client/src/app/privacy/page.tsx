'use client';

import React from 'react';
import { Shield, Eye, Users, Share2, Mail, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-32 animate-in fade-in duration-700">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1">
              DATA SOVEREIGNTY
           </Badge>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Last Updated: May 7, 2026</p>
        </div>

        <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardContent className="p-12 md:p-20 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">1. Introduction</h2>
              </div>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Welcome to KEDevs-Connect. We are committed to protecting your personal information and your right to privacy.
                If you have any questions or concerns about our policy, or our practices with regards to your personal information,
                please contact us at <span className="text-primary font-bold">privacy@kedevs.com</span>.
              </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Eye className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">2. Information We Collect</h2>
              </div>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                We collect personal information that you voluntarily provide to us when registering at the Services,
                expressing an interest in obtaining information about us or our products and services.
              </p>
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                 <p className="text-sm font-bold text-slate-500 italic">
                    The personal information that we collect depends on the context of your interactions with us and the choices you make.
                 </p>
              </div>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Users className="h-5 w-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">3. How We Use Your Data</h2>
              </div>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                We use personal information collected via our Services for a variety of business purposes described below:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                    'Facilitate account creation',
                    'Marketing and promotional intent',
                    'Administrative updates',
                    'Fulfill and manage orders',
                    'Post public testimonials'
                 ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" /> {item}
                    </li>
                 ))}
              </ul>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                     <Share2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">4. Data Sharing</h2>
               </div>
               <p className="text-lg text-slate-600 font-medium leading-relaxed">
                 We only share information with your consent, to comply with laws, to provide you with services,
                 to protect your rights, or to fulfill business obligations.
               </p>
            </section>

            <Separator className="bg-slate-50" />

            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                     <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">5. Contact Us</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Official Correspondence</p>
                     <p className="text-sm font-medium leading-relaxed italic">
                        KEDevs Connect Ltd.<br />
                        P.O. Box 12345-00100<br />
                        Nairobi, Kenya
                     </p>
                  </div>
                  <div className="flex flex-col justify-center">
                     <p className="text-sm text-slate-500 font-medium">
                        For immediate privacy requests or data deletion, please email our Data Protection Officer at:
                     </p>
                     <p className="text-lg font-black text-primary mt-2">dpo@kedevs.com</p>
                  </div>
               </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
