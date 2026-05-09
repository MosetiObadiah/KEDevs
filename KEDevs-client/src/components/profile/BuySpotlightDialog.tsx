'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Info, 
  Loader2, 
  Smartphone, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { spotlightService } from '@/services/spotlightService';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BuySpotlightDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isVerified: boolean;
  hasFeaturedProject: boolean;
}

export default function BuySpotlightDialog({ open, onClose, onSuccess, isVerified, hasFeaturedProject }: BuySpotlightDialogProps) {
  const { getPrice } = usePlatformSettings();
  const [type, setType] = useState<'DAY' | 'WEEK'>('DAY');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'SELECT' | 'PAYING' | 'SUCCESS'>('SELECT');
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'PAYING' && open) {
      interval = setInterval(async () => {
        try {
          const response = await paymentService.confirmSpotlight();
          if (response.success) {
            setStep('SUCCESS');
            onSuccess();
          }
        } catch (err) {
          // Not confirmed yet
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, open, onSuccess]);

  useEffect(() => {
    if (open) {
      fetchAvailability();
      setStep('SELECT');
      setError(null);
    }
  }, [open]);

  const fetchAvailability = async () => {
    setFetchingAvailability(true);
    try {
      const response = await spotlightService.getAvailability();
      if (response.success) {
        setAvailability(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch availability', err);
    } finally {
      setFetchingAvailability(false);
    }
  };

  const handleInitiate = async () => {
    if (!phoneNumber.match(/^(254|0)(7|1)\d{8}$/)) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.initiateSpotlight({
        phoneNumber,
        spotlightType: type
      });

      if (response.success) {
        setStep('PAYING');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Is the slot already taken?');
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified || !hasFeaturedProject) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Requirements Missing</DialogTitle>
            <DialogDescription>
              To maintain quality, featured developers must meet certain criteria.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!isVerified && (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>You must be a <strong>Verified Developer</strong> to buy a spotlight slot.</p>
              </div>
            )}
            {!hasFeaturedProject && (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>You must have at least one <strong>Featured Project</strong> (with a screenshot and live URL).</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between gap-3">
            <Button variant="ghost" onClick={onClose} className="font-bold">Close</Button>
            <Button className="font-bold" asChild>
              <Link href={!isVerified ? "/verify" : "/profile/me"}>
                {!isVerified ? "Get Verified" : "Add Project"}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {step === 'SELECT' ? 'Boost Your Visibility' : step === 'PAYING' ? 'Completing Payment' : 'Success!'}
          </DialogTitle>
          {step === 'SELECT' && (
            <DialogDescription className="font-medium">
              Get featured on the public landing page and attract more employers.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-2">
          {step === 'SELECT' && (
            <div className="space-y-8">
              <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="space-y-3">
                <div 
                  className={cn(
                    "flex items-center space-x-3 space-y-0 rounded-2xl border p-4 cursor-pointer transition-all",
                    type === 'DAY' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"
                  )}
                  onClick={() => setType('DAY')}
                >
                  <RadioGroupItem value="DAY" id="day" className="mt-1" />
                  <Label htmlFor="day" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-bold block mb-0.5">Developer of the Day</span>
                        <span className="text-xs text-muted-foreground font-medium block">
                          KES {getPrice('SPOTLIGHT_DAY_FEE', '50')} • Active for 24 hours
                        </span>
                      </div>
                      {!availability?.daySlotAvailable && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-2 font-bold uppercase">Taken</Badge>
                      )}
                    </div>
                  </Label>
                </div>

                <div 
                  className={cn(
                    "flex items-center space-x-3 space-y-0 rounded-2xl border p-4 cursor-pointer transition-all",
                    type === 'WEEK' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"
                  )}
                  onClick={() => setType('WEEK')}
                >
                  <RadioGroupItem value="WEEK" id="week" className="mt-1" />
                  <Label htmlFor="week" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-bold block mb-0.5">Developer of the Week</span>
                        <span className="text-xs text-muted-foreground font-medium block">
                          KES {getPrice('SPOTLIGHT_WEEK_FEE', '250')} • Active for 7 days
                        </span>
                      </div>
                      {!availability?.weekSlotAvailable && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-2 font-bold uppercase">Taken</Badge>
                      )}
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">M-Pesa Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. 0712345678" 
                      className="pl-10 h-12 text-base border-border/50 focus-visible:ring-primary/20"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                    <span>You will receive an STK push on your phone.</span>
                  </div>
                </div>

                {error && (
                  <div className="flex gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'PAYING' && (
            <div className="py-10 text-center flex flex-col items-center space-y-6">
              <div className="relative h-20 w-20">
                <Loader2 className="h-20 w-20 text-primary animate-spin" />
                <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Waiting for Payment...</h3>
                <p className="text-sm text-muted-foreground max-w-sm font-medium">
                  Check your phone for the M-Pesa PIN prompt. Once you enter your PIN, the spotlight will activate automatically.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="font-bold h-11 px-6 rounded-xl border-border/50 group"
                onClick={async () => { 
                  try {
                    const response = await paymentService.confirmSpotlight();
                    if (response.success) {
                      setStep('SUCCESS');
                      onSuccess();
                    } else {
                      setError('Payment not yet confirmed. Please wait a moment.');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Payment not yet confirmed.');
                  }
                }}
              >
                I Have Paid — Confirm Now <CheckCircle2 className="ml-2 h-4 w-4 group-hover:text-emerald-500 transition-colors" />
              </Button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="py-10 text-center flex flex-col items-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap className="h-12 w-12 text-emerald-500 fill-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Spotlight Active!</h3>
                <p className="text-sm text-muted-foreground max-w-sm font-medium">
                  You are now featured on the landing page. Good luck with your opportunities!
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between gap-3 pt-4 border-t border-border/50">
          {step === 'SELECT' ? (
            <>
              <Button variant="ghost" onClick={onClose} className="font-bold">Cancel</Button>
              <Button 
                className="font-black h-12 px-8 rounded-xl shadow-xl shadow-primary/20"
                disabled={
                  loading || 
                  fetchingAvailability ||
                  !availability ||
                  !phoneNumber.match(/^(254|0)(7|1)\d{8}$/) ||
                  (type === 'DAY' && !availability?.daySlotAvailable) || 
                  (type === 'WEEK' && !availability?.weekSlotAvailable)
                } 
                onClick={handleInitiate}
              >
                {loading || fetchingAvailability ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-white" />}
                Buy Slot
              </Button>
            </>
          ) : (
            <Button className="font-bold w-full h-12 rounded-xl" onClick={onClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

