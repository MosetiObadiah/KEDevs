'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Loader2,
  Zap,
  Star
} from 'lucide-react';
import { cn, formatDateString } from '@/lib/utils';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { spotlightService } from '@/services/spotlightService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SpotlightManagement() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [overrideSlot, setOverrideSlot] = useState<any>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriding, setOverriding] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await spotlightService.getSlotHistory();
      if (res.success) {
        setSlots(res.data.content || res.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch spotlight history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOverride = async () => {
    if (!overrideReason.trim()) {
      toast.error('A reason is required to clear a slot');
      return;
    }

    setOverriding(true);
    try {
      const res = await spotlightService.adminOverride(overrideSlot.id, overrideReason);
      if (res.success) {
        toast.success('Slot successfully cleared');
        setOverrideSlot(null);
        setOverrideReason('');
        fetchSlots(); // refresh list
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear slot');
    } finally {
      setOverriding(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('KEDevs', 14, 16);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text('SPOTLIGHT REGISTRY EXPORT', doc.internal.pageSize.width - 14, 16, { align: 'right' });
      
      const tableData = slots.map(slot => [
        slot.developerName || 'Unknown',
        slot.type,
        slot.isActive ? 'Active' : (slot.overriddenByAdmin ? 'Cleared' : 'Expired'),
        formatDateString(slot.endDate)
      ]);

      (doc as any).autoTable({
        startY: 30,
        head: [['Developer', 'Package Tier', 'Status', 'Expiration']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
      });

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("KEDevs — Kenya's Premier Tech Talent Network", 14, doc.internal.pageSize.height - 10);
      
      doc.save(`kedevs-spotlight-export-${new Date().getTime()}.pdf`);
      toast.success('PDF generated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  const activeSlots = slots.filter(s => s.isActive).length;
  const activeDaySlot = slots.find(s => s.isActive && s.type === 'DAY');
  const activeWeekSlot = slots.find(s => s.isActive && s.type === 'WEEK');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl-[2.5rem] border-none shadow-xl shadow-amber-500/10 bg-azure-50/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Star className="w-32 h-32 text-azure-500" />
           </div>
           <CardHeader className="p-8 pb-4 relative z-10">
              <Badge className="w-fit bg-azure-50 text-azure-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 mb-2">Dev of the Day</Badge>
              <CardTitle className="text-2xl font-black text-warning-950">Current Active</CardTitle>
           </CardHeader>
           <CardContent className="p-8 pt-0 relative z-10">
              {activeDaySlot ? (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <Avatar className="h-16 w-16 rounded-2xl border-4 border-white shadow-md">
                          <AvatarFallback className="bg-warning-900 text-white font-black text-xl uppercase">
                             {activeDaySlot.developerName?.charAt(0) || 'D'}
                          </AvatarFallback>
                       </Avatar>
                       <div className="space-y-1">
                          <p className="font-black text-warning-950 text-xl tracking-tight">{activeDaySlot.developerName}</p>
                          <p className="text-[10px] font-medium text-azure-700/70 uppercase tracking-widest text-ellipsis overflow-hidden max-w-[200px]">{activeDaySlot.developerId}</p>
                       </div>
                    </div>
                    <Button 
                       variant="outline" 
                       className="w-full h-12 rounded-xl border-azure-200 bg-white hover:bg-danger-50 hover:text-danger-500 transition-all font-medium gap-2 text-xs"
                       onClick={() => setOverrideSlot(activeDaySlot)}
                    >
                       <Trash2 className="h-4 w-4" /> Clear Day Slot
                    </Button>
                 </div>
              ) : (
                 <div className="py-8 text-center bg-white/50 rounded-2xl border border-azure-100/50">
                    <p className="text-[10px] font-medium text-azure-700/50 uppercase tracking-widest">No active day slot</p>
                 </div>
              )}
           </CardContent>
        </Card>

        <Card className="rounded-xl-[2.5rem] border-none shadow-xl shadow-primary/10 bg-primary/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32 text-primary" />
           </div>
           <CardHeader className="p-8 pb-4 relative z-10">
              <Badge className="w-fit bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 mb-2">Dev of the Week</Badge>
              <CardTitle className="text-2xl font-black text-slate-900">Current Active</CardTitle>
           </CardHeader>
           <CardContent className="p-8 pt-0 relative z-10">
              {activeWeekSlot ? (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <Avatar className="h-16 w-16 rounded-2xl border-4 border-white shadow-md">
                          <AvatarFallback className="bg-primary text-white font-black text-xl uppercase">
                             {activeWeekSlot.developerName?.charAt(0) || 'D'}
                          </AvatarFallback>
                       </Avatar>
                       <div className="space-y-1">
                          <p className="font-black text-slate-900 text-xl tracking-tight">{activeWeekSlot.developerName}</p>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-ellipsis overflow-hidden max-w-[200px]">{activeWeekSlot.developerId}</p>
                       </div>
                    </div>
                    <Button 
                       variant="outline" 
                       className="w-full h-12 rounded-xl border-primary/20 bg-white hover:bg-danger-50 hover:text-danger-500 transition-all font-medium gap-2 text-xs"
                       onClick={() => setOverrideSlot(activeWeekSlot)}
                    >
                       <Trash2 className="h-4 w-4" /> Clear Week Slot
                    </Button>
                 </div>
              ) : (
                 <div className="py-8 text-center bg-white/50 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-medium text-primary/50 uppercase tracking-widest">No active week slot</p>
                 </div>
              )}
           </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
         <CardHeader className="p-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
               <CardTitle className="text-2xl font-black">Visibility Registry</CardTitle>
               <CardDescription className="font-medium text-slate-500 uppercase text-[10px] tracking-widest">Active and historic premium placement</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">{activeSlots} Active</Badge>
               <Button size="sm" variant="outline" className="h-8 rounded-xl font-medium text-xs px-3" onClick={handleExportPDF}>Export PDF</Button>
            </div>
         </CardHeader>

         <CardContent className="p-0">
            {loading ? (
               <div className="py-16 text-center flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-slate-300 animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading history...</p>
               </div>
            ) : (
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-100">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-10">Professional Identity</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-10">Package Tier</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-10">Lifecycle Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-10">Expiration</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-10 text-right">Moderation</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {slots.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={5} className="py-16 text-center">
                              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">No spotlight subscriptions found</p>
                           </TableCell>
                        </TableRow>
                     ) : slots.map((slot) => (
                        <TableRow key={slot.id} className={cn(
                           "border-slate-50 transition-colors",
                           slot.isActive ? "bg-azure-50/20 hover:bg-azure-50/40" : "hover:bg-slate-50/50"
                        )}>
                           <TableCell className="py-6 px-10">
                              <div className="flex items-center gap-4">
                                 <Avatar className="h-10 w-10 rounded-xl border border-slate-100 shadow-sm">
                                    <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                       {slot.developerName?.charAt(0) || 'D'}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div className="space-y-0.5">
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{slot.developerName}</p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-ellipsis overflow-hidden max-w-[120px]">{slot.developerId}</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-10">
                              <Badge variant="outline" className="rounded-xl font-black text-[9px] uppercase tracking-widest border-slate-200 bg-white shadow-sm px-2 py-0.5">
                                 {slot.type}
                              </Badge>
                           </TableCell>
                           <TableCell className="py-6 px-10">
                              <div className="flex items-center gap-2">
                                 <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    slot.isActive ? "bg-cyan-600 animate-pulse" : (slot.overriddenByAdmin ? "bg-danger-500" : "bg-slate-300")
                                 )} />
                                 <span className={cn("text-xs font-medium uppercase tracking-tight", slot.isActive ? "text-cyan-600" : (slot.overriddenByAdmin ? "text-danger-500" : "text-slate-500"))}>
                                    {slot.isActive ? 'Active' : (slot.overriddenByAdmin ? 'Cleared' : 'Expired')}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-10 text-xs font-medium text-slate-500">
                              {formatDateString(slot.endDate)}
                           </TableCell>
                           <TableCell className="py-6 px-10 text-right">
                              <div className="flex justify-end gap-2">
                                 {slot.isActive && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-10 px-3 rounded-xl border-slate-100 hover:bg-danger-50 hover:text-danger-500 transition-all font-medium gap-2 text-xs"
                                      onClick={() => setOverrideSlot(slot)}
                                    >
                                       <Trash2 className="h-4 w-4" /> Clear Slot
                                    </Button>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            )}
            
         </CardContent>
      </Card>

      <Dialog open={!!overrideSlot} onOpenChange={(open) => !open && setOverrideSlot(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-xl-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Clear Spotlight Slot</DialogTitle>
            <DialogDescription className="font-medium">
              You are about to manually revoke the spotlight for <strong className="text-slate-900">{overrideSlot?.developerName}</strong>. This will notify them via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-black text-[10px] uppercase tracking-widest text-slate-500">
                Reason for Revocation
              </Label>
              <Input
                id="reason"
                placeholder="e.g., Terms of service violation..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="h-12 rounded-xl border-slate-200 font-medium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl font-medium" onClick={() => setOverrideSlot(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl font-medium gap-2" onClick={handleOverride} disabled={overriding || !overrideReason.trim()}>
              {overriding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

