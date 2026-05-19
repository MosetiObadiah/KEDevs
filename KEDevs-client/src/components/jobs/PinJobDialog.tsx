'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { paymentService } from '@/services/paymentService';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { toast } from 'sonner';
import { 
  Pin, 
  Loader2, 
  CreditCard, 
  CheckCircle2, 
  Smartphone, 
  Info, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PinJobDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export default function PinJobDialog({ open, onClose, jobId, jobTitle, onSuccess }: PinJobDialogProps) {
  const { getPrice, loading: loadingSettings } = usePlatformSettings();
  const [step, setStep] = useState<'SELECT' | 'PAYING' | 'SUCCESS'>('SELECT');
  const [durationType, setDurationType] = useState<'DAY' | '3DAYS' | '7DAYS'>('3DAYS');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [slots, setSlots] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('SELECT');
      setError(null);
      setCheckoutRequestId(null);
      setIsInitiating(false);
      fetchSlots();
    }
  }, [open]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const { jobService } = await import('@/services/jobService');
      const response = await jobService.getPinnedSlotAvailability();
      if (response.success) {
        setSlots(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch slot availability', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (checkoutRequestId && open) {
      interval = setInterval(async () => {
        try {
          const response = await paymentService.getPaymentStatus(checkoutRequestId);
          if (response.success) {
            const status = response.data.status;
            if (status === 'COMPLETED') {
              toast.success('Job Featured Successfully!');
              setCheckoutRequestId(null);
              setIsInitiating(false);
              onSuccess();
              onClose();
            } else if (status === 'FAILED' || status === 'CANCELLED') {
              const reason = response.data.failReason || 'Transaction failed or cancelled';
              toast.error('Payment Failed', { description: reason });
              setError(reason);
              setCheckoutRequestId(null);
              setIsInitiating(false);
            }
          }
        } catch (err: any) {
          console.error('Error polling status', err);
        }
      }, 3000); // Poll every 3 seconds

      // 2-minute timeout
      timeoutId = setTimeout(() => {
        if (checkoutRequestId) {
          clearInterval(interval);
          toast.error('Transaction Timeout', {
            description: 'The payment verification is taking longer than usual. Please try again later.'
          });
          setError('Verification timed out. Please try again.');
          setCheckoutRequestId(null);
          setIsInitiating(false);
        }
      }, 120000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkoutRequestId, open, onSuccess, onClose]);

  const handleInitiate = async () => {
    if (!phoneNumber || !phoneNumber.match(/^07\d{8}$/)) {
      setError('Invalid M-Pesa number (Format: 07xxxxxxxx)');
      return;
    }
    
    setIsInitiating(true);
    setError(null);
    try {
      const response = await paymentService.initiatePinnedJob({
        jobId,
        durationType,
        phoneNumber
      });
      if (response.success) {
        toast.info('STK Push sent!', {
          description: 'Please enter your M-Pesa PIN on your phone...'
        });
        setCheckoutRequestId(response.data.checkoutRequestId);
        // We do NOT set isInitiating to false here; it stays true while polling
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      toast.error(err.message || 'Failed to initiate payment');
      setIsInitiating(false);
    }
  };


  const currentPrice = getPrice(`PINNED_JOB_${durationType}_FEE`, '...');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-xl-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Feature Your Job</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">
              Boost visibility • {jobTitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
          {step === 'SELECT' && (
            <div className="space-y-8">
              {/* Slot Availability */}
              {slotsLoading ? (
                <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-muted/30 border border-border/30">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checking slot availability...</span>
                </div>
              ) : slots && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Featured Slots</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => {
                      const slot = slots.activeSlots?.[i];
                      return (
                        <div
                          key={i}
                          className={cn(
                            "rounded-xl p-3 border text-center transition-all",
                            slot
                              ? "border-azure-200 bg-azure-50/50"
                              : "border-emerald-200 bg-cyan-50/50"
                          )}
                        >
                          <div className={cn(
                            "text-[9px] font-black uppercase tracking-widest mb-1",
                            slot ? "text-azure-500" : "text-cyan-600"
                          )}>
                            Slot {i + 1}
                          </div>
                          {slot ? (
                            <p className="text-[10px] font-medium text-azure-700 leading-tight line-clamp-1" title={slot.jobTitle}>
                              {slot.jobTitle}
                            </p>
                          ) : (
                            <p className="text-[10px] font-medium text-cyan-800">Available</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {slots.freeSlots === 0 && (
                    <div className="flex gap-3 p-4 rounded-2xl bg-danger-50 border border-danger-100 text-danger-900 text-xs font-semibold animate-in fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 text-danger-500" />
                      <p>All 3 featured slots are currently occupied. Try again when one expires.</p>
                    </div>
                  )}
                </div>
              )}

              {(!slots || slots.freeSlots > 0) && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Duration</Label>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase">Most Popular</Badge>
                    </div>
                    <RadioGroup 
                      value={durationType} 
                      onValueChange={(v: any) => setDurationType(v)}
                      className="grid grid-cols-1 gap-3"
                    >
                      {[
                        { id: 'DAY', label: '1 Day Boost', price: getPrice('PINNED_JOB_DAY_FEE', '50'), desc: 'Perfect for quick hires' },
                        { id: '3DAYS', label: '3 Days Featured', price: getPrice('PINNED_JOB_3DAYS_FEE', '125'), desc: 'Get maximum reach' },
                        { id: '7DAYS', label: '7 Days Premium', price: getPrice('PINNED_JOB_7DAYS_FEE', '250'), desc: 'Long-term visibility' },
                      ].map((opt) => (
                        <Label
                          key={opt.id}
                          htmlFor={opt.id}
                          className={cn(
                            "flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative group overflow-hidden",
                            durationType === opt.id 
                              ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
                              : "border-border/40 hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <RadioGroupItem value={opt.id} id={opt.id} className="border-primary/30 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-black text-foreground">{opt.label}</span>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{opt.desc}</span>
                            </div>
                          </div>
                          <div className="text-right relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Price</span>
                            <span className="font-black text-primary text-xl tracking-tight">KES {opt.price}</span>
                          </div>
                          {durationType === opt.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
                          )}
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">M-Pesa Number</Label>
                      <div className="relative group">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="07xxxxxxxx" 
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (/^[0-9]+$/.test(val) && val.length <= 10)) {
                              setPhoneNumber(val);
                            }
                          }}
                          className="h-14 pl-12 rounded-2xl border-slate-200 font-black text-lg focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="flex gap-3 p-4 rounded-2xl bg-danger-50 border border-danger-100 text-danger-900 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-danger-500" />
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-azure-50 border border-azure-100 text-[10px] font-black text-azure-700 uppercase tracking-widest">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>You will receive an M-Pesa STK push for KES {currentPrice}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50 p-8 flex flex-row justify-between items-center gap-4">
          <Button variant="ghost" size="lg" className="rounded-2xl font-black h-14 px-8" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="lg" 
            className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            onClick={handleInitiate}
            disabled={isInitiating || loadingSettings || (slots && slots.freeSlots === 0)}
          >
            {isInitiating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {checkoutRequestId ? "Confirming on mobile..." : "Initiating STK Push..."}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Feature Listing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
