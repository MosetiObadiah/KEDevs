'use client';

import React from 'react';
import { 
  Hourglass, 
  LogOut, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-azure-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -ml-40 -mb-40" />

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="rounded-xl-[3rem] border-none shadow-2xl shadow-amber-500/10 overflow-hidden bg-white">
          <CardContent className="p-12 text-center">
            <div className="h-24 w-24 bg-azure-50 rounded-xl-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
               <Hourglass className="h-12 w-12 text-azure-500 animate-pulse" />
               <div className="absolute -top-2 -right-2 bg-white rounded-xl p-1.5 shadow-lg">
                  <ShieldCheck className="h-6 w-6 text-cyan-600" />
               </div>
            </div>

            <div className="space-y-4 mb-10">
               <Badge variant="outline" className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-azure-50 text-azure-500 border-azure-100 px-3 py-1">
                  SECURITY PROTOCOL
               </Badge>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Under Review</h1>
               <p className="text-lg font-medium text-slate-500">{user?.fullName || 'Valued Partner'}</p>
            </div>

            <div className="space-y-6 text-slate-500 font-medium leading-relaxed mb-10">
               <p>
                  Thank you for joining KEDevs! Our moderation team is currently verifying your company profile for authenticity and security.
               </p>
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                     <Calendar className="h-4 w-4 text-primary" /> ETA: Less than 24 hours
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                     <Mail className="h-4 w-4 text-primary" /> Notification sent to your email
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <Button variant="outline" className="w-full h-14 rounded-2xl font-black gap-2 border-slate-100 hover:bg-slate-50" onClick={logout}>
                  <LogOut className="h-5 w-5" /> Logout for now
               </Button>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Full ecosystem access granted upon approval
               </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trusted by Kenyan Tech</span>
           <div className="flex gap-4">
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
