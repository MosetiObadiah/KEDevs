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
import { paymentService, PlatformSetting } from '@/services/paymentService';
import { toast } from 'sonner';
import { Pin, Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinJobDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export default function PinJobDialog({ open, onClose, jobId, jobTitle, onSuccess }: PinJobDialogProps) {
  const [step, setStep] = useState<'options' | 'payment' | 'processing' | 'success'>('options');
  const [durationType, setDurationType] = useState<'DAY' | '3DAYS' | '7DAYS'>('3DAYS');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isInitiating, setIsInitiating] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('options');
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await paymentService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch pricing settings', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const getPrice = (type: string) => {
    const key = `PINNED_JOB_${type}_FEE`;
    const setting = settings.find(s => s.settingKey === key);
    return setting ? setting.settingValue : '...';
  };

  const handleInitiate = async () => {
    if (!phoneNumber || !phoneNumber.match(/^0[17]\d{8}$/)) {
      toast.error('Invalid M-Pesa number (Format: 07xxxxxxxx)');
      return;
    }
    setIsInitiating(true);
    try {
      const response = await paymentService.initiatePinnedJob({
        jobId,
        durationType,
        phoneNumber
      });
      if (response.success) {
        setCheckoutRequestId(response.data.checkoutRequestId);
        setStep('payment');
        toast.info('STK Push sent to your phone');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsInitiating(false);
    }
  };

  const handleManualConfirm = async () => {
    setStep('processing');
    try {
      const response = await paymentService.confirmPinnedJob();
      if (response.success) {
        setStep('success');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please ensure you have paid.');
      setStep('payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8">
        {step === 'options' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Pin className="h-6 w-6" />
                </div>
                Pin Your Job
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground pt-1">
                Featured listings get 10x more visibility by staying at the top of the search results.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Duration</Label>
                <RadioGroup 
                  value={durationType} 
                  onValueChange={(v: any) => setDurationType(v)}
                  className="grid grid-cols-1 gap-3"
                >
                  {[
                    { id: 'DAY', label: '1 Day', price: getPrice('DAY') },
                    { id: '3DAYS', label: '3 Days', price: getPrice('3DAYS') },
                    { id: '7DAYS', label: '7 Days', price: getPrice('7DAYS') },
                  ].map((opt) => (
                    <Label
                      key={opt.id}
                      htmlFor={opt.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        durationType === opt.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={opt.id} id={opt.id} />
                        <span className="font-bold">{opt.label}</span>
                      </div>
                      <span className="font-black text-primary text-lg">KES {opt.price}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">M-Pesa Phone Number</Label>
                <Input 
                  placeholder="0712345678" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 rounded-xl border-border/50 font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                className="w-full h-12 rounded-xl font-black text-lg shadow-lg shadow-primary/20" 
                onClick={handleInitiate}
                disabled={isInitiating || isLoadingSettings}
              >
                {isInitiating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CreditCard className="h-5 w-5 mr-2" />}
                Pay via M-Pesa
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'payment' && (
          <div className="py-8 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
               <CreditCard className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Waiting for Payment</h2>
              <p className="text-muted-foreground font-medium">
                Please enter your M-Pesa PIN on your phone to complete the payment of <strong>KES {getPrice(durationType)}</strong>.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <Button 
                className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20"
                onClick={handleManualConfirm}
              >
                I have paid
              </Button>
              <Button variant="ghost" className="w-full font-bold" onClick={() => setStep('options')}>
                Back to options
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Verifying...</h2>
              <p className="text-muted-foreground font-medium">Checking your payment status with Safaricom.</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
               <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Job Pinned!</h2>
              <p className="text-muted-foreground font-medium">
                Your job listing is now featured at the top of the feed.
              </p>
            </div>
            <Button className="w-full h-12 rounded-xl font-black mt-4" onClick={onClose}>
              Awesome!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
