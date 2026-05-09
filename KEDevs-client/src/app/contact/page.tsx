'use client';

import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Globe, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Transmission received. We will respond shortly.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-32 animate-in fade-in duration-700">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-4 py-1.5">
              COMMUNICATIONS HUB
           </Badge>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">Connect with <span className="text-primary italic">KEDevs</span></h1>
           <p className="text-slate-500 font-semibold text-lg max-w-xl mx-auto italic leading-relaxed">
              Have a question about the ecosystem? Our team is ready to synchronize.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           {/* Contact Form */}
           <div className="lg:col-span-7">
              <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                 <CardContent className="p-12 md:p-16">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                          <MessageSquare className="h-6 w-6" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-slate-900">Send Transmission</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct channel to our core team</p>
                       </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Name</p>
                             <Input placeholder="John Doe" className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" required />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Official Email</p>
                             <Input placeholder="john@company.com" type="email" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" required />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject Matter</p>
                          <Input placeholder="Platform Inquiry / Partnership" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" required />
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message Payload</p>
                          <Textarea 
                             placeholder="Detail your inquiry here..." 
                             className="min-h-[200px] rounded-[2rem] bg-slate-50 border-none p-6 font-bold leading-relaxed focus-visible:ring-primary/20"
                             required
                          />
                       </div>

                       <Button className="w-full h-16 rounded-[2rem] font-black bg-slate-900 text-white shadow-xl shadow-slate-900/10 gap-3 text-lg group">
                          <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          Transmit Message
                       </Button>
                    </form>
                 </CardContent>
              </Card>
           </div>

           {/* Contact Info */}
           <div className="lg:col-span-5 space-y-6">
              {[
                 { 
                    icon: Mail, 
                    label: 'Digital Correspondence', 
                    value: 'support@kedevelopers.com', 
                    color: 'text-primary',
                    bg: 'bg-primary/5'
                 },
                 { 
                    icon: Phone, 
                    label: 'Voice Channel', 
                    value: '+254 (0) 700 000 000', 
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50'
                 },
                 { 
                    icon: MapPin, 
                    label: 'Physical Coordinates', 
                    value: 'Nairobi Garage, 8th Floor, Pinetree Plaza, Ngong Road', 
                    color: 'text-amber-500',
                    bg: 'bg-amber-50'
                 }
              ].map((item, i) => (
                 <Card key={i} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white group hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-8 flex items-start gap-6">
                       <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", item.bg)}>
                          <item.icon className={cn("h-6 w-6", item.color)} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                          <p className="text-sm font-black text-slate-900 leading-relaxed">{item.value}</p>
                       </div>
                    </CardContent>
                 </Card>
              ))}

              <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group mt-12">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16" />
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <Zap className="h-5 w-5 text-amber-400" />
                       <h3 className="font-black tracking-tight uppercase text-xs">Operational Sync</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                       Our engineering and support teams maintain high-availability during business hours <span className="text-white font-bold">(08:00 - 18:00 EAT)</span>.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                          ))}
                       </div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Support Tier</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}