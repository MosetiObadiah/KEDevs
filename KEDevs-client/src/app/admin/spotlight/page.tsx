'use client';

import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Briefcase,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

const mockSlots = [
  { id: 's1', name: 'John Smith', role: 'DevOps Engineer', type: 'Week', status: 'Active', expires: '2024-05-15' },
  { id: 's2', name: 'Jane Doe', role: 'Frontend Engineer', type: 'Day', status: 'Active', expires: '2024-05-08' },
  { id: 's3', name: 'Alice W.', role: 'Product Designer', type: 'Day', status: 'Expired', expires: '2024-05-01' },
];

export default function SpotlightManagement() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Star className="h-8 w-8 text-amber-500 fill-amber-500/20" /> Spotlight Desk
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage premium visibility slots and manual overrides</p>
         </div>
         
         <Button className="rounded-xl font-black bg-slate-900 px-6 gap-2 h-12 shadow-xl shadow-slate-900/10">
            <Plus className="h-4 w-4" /> Grant Manual Slot
         </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
         <CardHeader className="p-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
               <CardTitle className="text-2xl font-black">Visibility Registry</CardTitle>
               <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Active and historic premium placement</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">2 Active</Badge>
               <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">1 Expired</Badge>
            </div>
         </CardHeader>

         <CardContent className="p-0">
            <Table>
               <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Professional Identity</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Package Tier</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Lifecycle Status</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Expiration</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10 text-right">Moderation</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {mockSlots.map((slot) => (
                     <TableRow key={slot.id} className={cn(
                        "border-slate-50 transition-colors",
                        slot.status === 'Active' ? "bg-amber-50/20 hover:bg-amber-50/40" : "hover:bg-slate-50/50"
                     )}>
                        <TableCell className="py-6 px-10">
                           <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 rounded-xl border border-slate-100 shadow-sm">
                                 <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                    {slot.name.charAt(0)}
                                 </AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                 <p className="font-black text-slate-900 text-sm tracking-tight">{slot.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slot.role}</p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="py-6 px-10">
                           <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200 bg-white shadow-sm px-2 py-0.5">
                              {slot.type}
                           </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-10">
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                 "h-2 w-2 rounded-full",
                                 slot.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                              )} />
                              <span className={cn("text-xs font-bold uppercase tracking-tight", slot.status === 'Active' ? "text-emerald-600" : "text-slate-400")}>
                                 {slot.status}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="py-6 px-10 text-xs font-bold text-slate-500">
                           {slot.expires}
                        </TableCell>
                        <TableCell className="py-6 px-10 text-right">
                           <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 hover:bg-white hover:text-primary transition-all">
                                 <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
            
            <div className="p-8 bg-slate-900 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/10 opacity-50" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                     <h4 className="text-xl font-black flex items-center justify-center md:justify-start gap-3">
                        <Zap className="h-5 w-5 text-amber-400" /> Spotlight Logic
                     </h4>
                     <p className="text-sm font-medium text-slate-400 max-w-lg leading-relaxed">
                        The spotlight system uses a weighted randomized rotation based on subscription tiers. Manual overrides bypass the priority queue and are recorded for audit.
                     </p>
                  </div>
                  <Button className="rounded-2xl h-14 px-8 font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10 shrink-0">
                     Global Visibility Config
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
