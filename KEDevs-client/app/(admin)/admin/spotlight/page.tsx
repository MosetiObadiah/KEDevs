'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Calendar, UserX } from 'lucide-react';
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
      toast.success('Spotlight slot overridden');
    },
    onError: () => toast.error('Failed to override slot')
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
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Spotlight Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage developer spotlight slots and handle overrides</p>
        </div>
      </div>

      <Card className="rounded-3xl border-amber-200 bg-amber-50 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> Current Spotlight
          </CardTitle>
          <CardDescription className="text-amber-800/70">The developer currently featured on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {activeSlot ? (
            <div className="bg-white/80 backdrop-blur border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">{activeSlot.developerName}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  ID: <span className="font-mono">{activeSlot.developerId}</span>
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-amber-900 bg-amber-100 px-3 py-1 rounded-full font-medium">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(activeSlot.startDate).toLocaleDateString()} - {new Date(activeSlot.endDate).toLocaleDateString()}
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px]">{activeSlot.type}</Badge>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => handleOverrideClick(activeSlot.id)}
                className="shrink-0 bg-red-600 hover:bg-red-700"
              >
                <UserX className="w-4 h-4 mr-2" /> Force Override
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center bg-white/50 backdrop-blur border border-amber-200/50 rounded-2xl border-dashed">
              <Star className="w-10 h-10 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-900 font-bold">No active spotlight</p>
              <p className="text-sm text-amber-800/70 mt-1">The spotlight slot is currently available for purchase.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-secondary shadow-sm mt-12">
        <CardHeader>
          <CardTitle>Spotlight History</CardTitle>
          <CardDescription>Past spotlight slots and their statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {pastSlots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No past spotlight slots.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Developer</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Duration</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/50">
                  {pastSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{slot.developerName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{slot.developerId}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">{slot.type}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(slot.startDate).toLocaleDateString()} - {new Date(slot.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {slot.overriddenByAdmin ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]" title={slot.reason}>OVERRIDDEN</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">COMPLETED</Badge>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Force Override Spotlight</DialogTitle>
            <DialogDescription>
              This will immediately end the current spotlight. The developer will NOT be automatically refunded. This action is logged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for override..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
            <Button onClick={submitOverride} disabled={!reason.trim() || overrideMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
              {overrideMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
