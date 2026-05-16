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

  useEffect(() => {
    if (open) {
      setStep('SELECT');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (step === 'PAYING' && open) {
      // Start polling
      interval = setInterval(async () => {
        try {
          const response = await paymentService.confirmPinnedJob();
          if (response.success) {
            setStep('SUCCESS');
            onSuccess();
          }
        } catch (err: any) {
          const msg = err.message || '';
          if (msg.includes('FAILED') || msg.includes('CANCELLED') || msg.includes('not successful')) {
            const isCancelled = msg.includes('CANCELLED');
            toast.error(isCancelled ? 'Payment Cancelled' : 'Payment Failed', {
              description: isCancelled 
                ? 'You cancelled the transaction on your phone.' 
                : (msg || 'Your M-Pesa transaction was not successful.')
            });
            setStep('SELECT');
            setError(msg);
          }
        }
      }, 5000);

      // 2-minute timeout
      timeoutId = setTimeout(() => {
        if (step === 'PAYING') {
          clearInterval(interval);
          toast.error('Transaction Timeout', {
            description: 'The payment verification is taking longer than usual. Please try again or contact support if you have already been charged.'
          });
          setStep('SELECT');
          setError('Verification timed out. Please try again.');
        }
      }, 120000); // 120 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [step, open, onSuccess]);

  const handleInitiate = async () => {
    if (!phoneNumber || !phoneNumber.match(/^0[17]\d{8}$/)) {
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
        setStep('PAYING');
        toast.info('STK Push sent to your phone');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsInitiating(false);
    }
  };

  const currentPrice = getPrice(`PINNED_JOB_${durationType}_FEE`, '...');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/5 via-background to-background p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {step === 'SELECT' ? 'Feature Your Job' : step === 'PAYING' ? 'Completing Payment' : 'Success!'}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">
                  {jobTitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-[300px] flex flex-col">
            {step === 'SELECT' && (
              <div className="space-y-8 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Select Duration</Label>
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
                          "flex items-center justify-between p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative group overflow-hidden",
                          durationType === opt.id 
                            ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
                            : "border-border/40 hover:border-primary/30 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <RadioGroupItem value={opt.id} id={opt.id} className="border-primary/30 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-black text-foreground">{opt.label}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{opt.desc}</span>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <span className="text-[10px] font-black text-muted-foreground uppercase block mb-0.5">Price</span>
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
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">M-Pesa Number</Label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="0712 345 678" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-14 pl-12 rounded-2xl border-border/50 font-black text-lg focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-xs font-bold animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>You will receive an M-Pesa STK push for KES {currentPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 'PAYING' && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping duration-[2000ms]" />
                  <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-2xl">
                    <Loader2 className="h-12 w-12 animate-spin-slow" />
                    <Smartphone className="absolute h-6 w-6" />
                  </div>
                </div>
                <div className="text-center space-y-3 max-w-xs">
                  <h2 className="text-2xl font-black tracking-tight">Waiting for PIN</h2>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Please check your phone and enter your M-Pesa PIN to complete the payment of <span className="text-primary font-black">KES {currentPrice}</span>.
                  </p>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress duration-[120000ms]" />
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10">
                  <CheckCircle2 className="h-14 w-14 fill-emerald-500/10" />
                </div>
                <div className="text-center space-y-3 max-w-xs">
                  <h2 className="text-3xl font-black tracking-tight">Job Featured!</h2>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Your job listing is now pinned at the top of the feed and will get maximum visibility.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 pt-6 border-t border-border/50">
            {step === 'SELECT' ? (
              <div className="flex w-full gap-3">
                <Button variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold hover:bg-muted/50 transition-colors">
                  Cancel
                </Button>
                <Button 
                  className="flex-[2] h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  onClick={handleInitiate}
                  disabled={isInitiating || loadingSettings}
                >
                  {isInitiating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CreditCard className="h-5 w-5 mr-2" />}
                  Feature Listing
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/10" 
                onClick={onClose}
              >
                Awesome!
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
