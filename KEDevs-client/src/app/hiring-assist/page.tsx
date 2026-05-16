'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Filter, 
  Search, 
  Send, 
  Clock, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  MapPin, 
  Briefcase,
  ChevronRight,
  Loader2,
  Lock,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Info
} from 'lucide-react';
import { developers } from '@/data/mockData';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

export default function HiringAssist() {
  const { getPrice } = usePlatformSettings();
  const [isActive, setIsActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDev, setSelectedDev] = useState<any>(null);

  const handleActivate = () => {
    setIsActive(true);
    toast.success('Hiring Assist protocols activated');
  };

  if (!isActive) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-5xl animate-in fade-in duration-700">
        <Card className="rounded-[4rem] border-none shadow-3xl shadow-slate-200/50 overflow-hidden bg-white">
           <CardContent className="p-12 md:p-24 text-center space-y-12">
              <div className="h-24 w-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto relative group">
                 <Zap className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                 <div className="absolute -top-2 -right-2 bg-white rounded-xl p-2 shadow-lg">
                    <Lock className="h-5 w-5 text-slate-300" />
                 </div>
              </div>

              <div className="space-y-4">
                 <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-4 py-1.5">
                    RECRUITMENT ENGINE
                 </Badge>
                 <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Hiring <span className="text-primary italic">Assist</span></h1>
                 <p className="text-lg text-slate-500 font-semibold max-w-xl mx-auto italic leading-relaxed">
                    Accelerate your hiring cycle with advanced discovery tools and direct outreach protocols.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 {[
                    { title: 'Advanced Filtering', desc: 'Precision discovery by experience, tech stacks, and availability.', icon: Filter },
                    { title: 'Direct Outreach', desc: 'Personalized requests sent directly to verified talent.', icon: Send },
                    { title: 'Pipeline Ops', desc: 'Manage and track your active outreach operations.', icon: Briefcase },
                 ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 space-y-3 group hover:border-primary/20 transition-all">
                       <feature.icon className="h-6 w-6 text-primary" />
                       <h3 className="text-lg font-black text-slate-900 tracking-tight">{feature.title}</h3>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                 ))}
              </div>

              <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[60px] -mr-32 -mt-32" />
                 <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className="space-y-1">
                       <p className="text-5xl font-black text-white">KES {getPrice('SPOTLIGHT_DAY_FEE', '50')}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Full Access / 24 Cycle</p>
                    </div>
                    <Button 
                       className="h-16 rounded-[2rem] px-16 font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 text-lg group"
                       onClick={handleActivate}
                    >
                       Activate Engine <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
         <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               Hiring <span className="text-primary italic">Assist</span>
               <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[10px] tracking-widest px-3 py-1 animate-pulse">LIVE_SESSION</Badge>
            </h1>
            <p className="text-slate-500 font-semibold italic">Advanced talent discovery and direct outreach active.</p>
         </div>
         
         <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-col px-4 border-r border-white/10">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Remaining</span>
               <span className="text-sm font-black text-amber-400">23:54:12</span>
            </div>
            <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white px-4 h-10">Extend Access</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Modern Sidebar Filters */}
        <div className="lg:col-span-3">
           <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 bg-white sticky top-24 overflow-hidden">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-xl font-black flex items-center gap-3">
                    <Filter className="h-5 w-5 text-primary" /> Filters
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tech Stack</p>
                       <Input placeholder="React, Python, AWS" className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Experience Tier</p>
                       <Select defaultValue="3-5 years">
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-slate-600">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100">
                             <SelectItem value="0-1 years" className="font-bold">0-1 Years</SelectItem>
                             <SelectItem value="1-3 years" className="font-bold">1-3 Years</SelectItem>
                             <SelectItem value="3-5 years" className="font-bold">3-5 Years</SelectItem>
                             <SelectItem value="5+ years" className="font-bold">5+ Years</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50">
                       <Checkbox id="verified" defaultChecked className="data-[state=checked]:bg-primary rounded-md" />
                       <label htmlFor="verified" className="text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer">Verified Only</label>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4">
                    <Button className="w-full h-14 rounded-2xl bg-slate-900 font-black shadow-lg">Scan Ecosystem</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Results List */}
        <div className="lg:col-span-9 space-y-6">
           {developers.filter(d => d.role === 'DEVELOPER').map((dev) => (
              <Card key={dev.id} className="rounded-[3rem] border-none shadow-xl shadow-slate-200/40 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                 <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                       <div className="relative shrink-0">
                          <Avatar className="h-24 w-24 rounded-[2rem] border-2 border-slate-50 shadow-sm group-hover:border-primary/20 transition-all">
                             <AvatarFallback className="bg-slate-900 text-white font-black text-2xl uppercase">
                                {dev.name.charAt(0)}
                             </AvatarFallback>
                          </Avatar>
                          {dev.isVerified && (
                             <div className="absolute -bottom-1 -right-1 bg-white rounded-xl p-1 shadow-md">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                             </div>
                          )}
                       </div>

                       <div className="flex-1 text-center md:text-left space-y-3">
                          <div className="space-y-1">
                             <Link href={`/developers/${dev.id}`} className="text-2xl font-black text-slate-900 hover:text-primary transition-colors tracking-tight">{dev.name}</Link>
                             <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {dev.role}</span>
                                <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {dev.city}</span>
                             </div>
                          </div>
                          
                          <div className="flex flex-wrap justify-center md:justify-start gap-2">
                             {dev.skills.map(s => (
                                <Badge key={s} variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-500">
                                   {s}
                                </Badge>
                             ))}
                          </div>
                       </div>

                       <div className="flex gap-2">
                          <Dialog open={isModalOpen && selectedDev?.id === dev.id} onOpenChange={(open) => { setIsModalOpen(open); if(!open) setSelectedDev(null); }}>
                             <DialogTrigger asChild>
                                <Button 
                                   className="h-12 rounded-2xl px-6 font-black bg-slate-900 gap-2 group-hover:bg-primary transition-colors"
                                   onClick={() => setSelectedDev(dev)}
                                >
                                   <Send className="h-4 w-4" /> Job Request
                                </Button>
                             </DialogTrigger>
                             <DialogContent className="rounded-[3rem] p-12 max-w-xl border-none shadow-3xl">
                                <DialogHeader className="space-y-4 mb-6">
                                   <div className="h-16 w-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center">
                                      <Send className="h-8 w-8 text-primary" />
                                   </div>
                                   <div className="space-y-1 text-left">
                                      <DialogTitle className="text-3xl font-black tracking-tight">Direct Outreach</DialogTitle>
                                      <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Inviting {selectedDev?.name || 'talent'} to collaborate</DialogDescription>
                                   </div>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                   <div className="space-y-2">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Position</p>
                                      <Select defaultValue="1">
                                         <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                                            <SelectValue />
                                         </SelectTrigger>
                                         <SelectContent className="rounded-xl">
                                            <SelectItem value="1" className="font-bold">Senior Full Stack Engineer</SelectItem>
                                            <SelectItem value="2" className="font-bold">Junior React Developer</SelectItem>
                                         </SelectContent>
                                      </Select>
                                   </div>

                                   <div className="space-y-2">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Personalized Transmission</p>
                                      <Textarea 
                                         className="min-h-[150px] rounded-3xl bg-slate-50 border-none p-6 font-medium leading-relaxed"
                                         defaultValue={`Hi ${selectedDev?.name.split(' ')[0]}, I discovered your profile through Hiring Assist. Your background in ${selectedDev?.skills[0]} is impressive. I'd love for you to check out this opening.`}
                                      />
                                   </div>

                                   <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                                      <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                      <p className="text-xs font-medium text-blue-700 leading-relaxed">Your contact node will be shared once the developer acknowledges the request.</p>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                      <Button variant="ghost" className="h-14 rounded-2xl font-black text-slate-400" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                      <Button className="h-14 rounded-2xl font-black bg-slate-900 shadow-xl" onClick={() => { toast.success('Outreach transmitted'); setIsModalOpen(false); }}>Dispatch Request</Button>
                                   </div>
                                </div>
                             </DialogContent>
                          </Dialog>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
