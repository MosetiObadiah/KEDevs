'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Calendar, UserX, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminSpotlightPage() {
  const queryClient = useQueryClient();
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: slots, isLoading } = useQuery({
    queryKey: ['admin', 'spotlight'],
    queryFn: adminApi.getAdminSpotlightSlots,
  });

  const overrideMutation = useMutation({
    mutationFn: ({ slotId, reason }: { slotId: string, reason: string }) => adminApi.overrideSpotlightSlot(slotId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'spotlight'] });
      setOverrideModalOpen(false);
      setReason('');
      toast.success('Spotlight slot cleared successfully');
    },
    onError: () => toast.error('Failed to clear spotlight slot')
  });

  const handleOverrideClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    setOverrideModalOpen(true);
  };

  const submitOverride = () => {
    if (selectedSlotId) {
      overrideMutation.mutate({ slotId: selectedSlotId, reason });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const activeSlot = slots?.find(s => s.isActive);
  const pastSlots = slots?.filter(s => !s.isActive) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Spotlight Management</h1>
            <p className="text-muted-foreground mt-1 font-medium">Manage developer spotlight slots and handle overrides</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[32px] border-amber-200 bg-amber-50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> Current Spotlight
            </CardTitle>
            <CardDescription className="text-amber-800/70">The developer currently featured on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            {activeSlot ? (
              <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-[24px] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-[#2F3E46]">{activeSlot.developerName}</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-tight">ID: {activeSlot.developerId}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-100/50 px-4 py-2 rounded-xl font-bold border border-amber-200/50">
                        <Calendar className="w-4 h-4" /> 
                        {new Date(activeSlot.startDate).toLocaleDateString()} — {new Date(activeSlot.endDate).toLocaleDateString()}
                      </div>
                      <Badge className="bg-[#2F3E46] text-white border-transparent px-4 py-2 rounded-xl uppercase tracking-widest text-[10px] font-black">
                        {activeSlot.type}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    variant="destructive" 
                    onClick={() => handleOverrideClick(activeSlot.id)}
                    className="shrink-0 bg-red-600 hover:bg-red-700 h-14 px-8 rounded-2xl shadow-lg shadow-red-600/20 font-black uppercase tracking-widest text-xs"
                  >
                    <UserX className="w-4 h-4 mr-2" /> Clear Spotlight
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center bg-white/50 backdrop-blur border border-amber-200/50 rounded-[24px] border-dashed">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-500 opacity-40" />
                </div>
                <p className="text-amber-900 font-black text-xl">No active spotlight</p>
                <p className="text-sm text-amber-800/70 mt-2 max-w-xs mx-auto font-medium">The spotlight slot is currently empty and available for purchase by developers.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-secondary bg-white shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Spotlight Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <p>Overrides are immediately effective and remove the user from the homepage.</p>
            </div>
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p>Clearing a slot does not trigger an automatic refund. Refunds must be handled manually via M-Pesa portal.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-secondary shadow-sm mt-12 overflow-hidden">
        <CardHeader className="bg-secondary/5 border-b border-secondary/50">
          <CardTitle>Spotlight History</CardTitle>
          <CardDescription>Records of past spotlight slots and administrative actions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pastSlots.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No past spotlight slots recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-secondary/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    <th className="p-6">Developer</th>
                    <th className="p-6">Type</th>
                    <th className="p-6">Duration</th>
                    <th className="p-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/50">
                  {pastSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-secondary/5 transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{slot.developerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1">{slot.developerId}</div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className="text-[10px] font-black border-secondary">{slot.type}</Badge>
                      </td>
                      <td className="p-6 text-sm text-muted-foreground font-medium">
                        {new Date(slot.startDate).toLocaleDateString()} — {new Date(slot.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right">
                        {slot.overriddenByAdmin ? (
                          <div className="flex flex-col items-end">
                            <Badge className="bg-red-50 text-red-700 border-red-100 text-[10px] font-black">OVERRIDDEN</Badge>
                            {slot.reason && <p className="text-[10px] text-red-500 mt-1 max-w-[200px] italic">"{slot.reason}"</p>}
                          </div>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-black">COMPLETED</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2F3E46]">Clear Spotlight Slot</DialogTitle>
            <DialogDescription className="font-medium">
              Are you sure you want to remove this developer from the spotlight? This action will be logged in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Reason for Removal</label>
            <Textarea
              placeholder="e.g. Inappropriate profile content, policy violation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] rounded-2xl bg-secondary/5 border-secondary/30 focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setOverrideModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              onClick={submitOverride} 
              disabled={!reason.trim() || overrideMutation.isPending} 
              className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 rounded-xl font-black shadow-lg shadow-red-600/10"
            >
              {overrideMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Clear & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
