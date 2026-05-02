'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initiatePayment } from '@/lib/api/payments';
import type { PaymentType } from '@/lib/types/payment';
import { toast } from 'sonner';
import { Loader2, Smartphone, CheckCircle2, XCircle } from 'lucide-react';

type PaymentState = 'idle' | 'submitting' | 'sent' | 'done' | 'error';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: PaymentType;
  title: string;
  description?: string;
  amount?: string;
  onSuccess?: (checkoutRequestId: string) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentType,
  title,
  description,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<PaymentState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutId, setCheckoutId] = useState('');

  const { mutate: initiate } = useMutation({
    mutationFn: () =>
      initiatePayment({ phoneNumber: phone.replace(/\s/g, ''), paymentType }),
    onMutate: () => {
      setState('submitting');
      setErrorMsg('');
    },
    onSuccess: (data) => {
      setState('sent');
      setCheckoutId(data.checkoutRequestId);
    },
    onError: (error: Error) => {
      setState('error');
      setErrorMsg(error.message || 'Failed to initiate payment. Please try again.');
    },
  });

  function handleClose() {
    if (state === 'sent' || state === 'done') {
      onSuccess?.(checkoutId);
    }
    setState('idle');
    setPhone('');
    setErrorMsg('');
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Basic Kenyan phone validation: 07XXXXXXXX or +2547XXXXXXXX
    const cleaned = phone.replace(/\s/g, '');
    if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(cleaned)) {
      toast.error('Enter a valid Kenyan phone number (e.g. 0712 345 678)');
      return;
    }
    initiate();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount display */}
          {amount && (
            <div className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">{amount}</span>
            </div>
          )}

          {/* State machine */}
          {state === 'idle' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mpesa-phone"
                    type="tel"
                    placeholder="07XXXXXXXX"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={13}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-teal hover:bg-forest text-white"
              >
                Pay with M-Pesa
              </Button>
            </form>
          )}

          {state === 'submitting' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 text-teal animate-spin" />
              <p className="text-sm text-muted-foreground">Sending STK push...</p>
            </div>
          )}

          {state === 'sent' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-teal" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Check your phone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  An M-Pesa prompt has been sent to <strong>{phone}</strong>. Enter your PIN to complete.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setState('done')}
              >
                I&apos;ve completed the payment
              </Button>
            </div>
          )}

          {state === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-teal" />
              <p className="font-semibold text-foreground">Payment submitted!</p>
              <p className="text-sm text-muted-foreground">
                Your payment is being verified. This may take a moment.
              </p>
              <Button className="w-full bg-teal hover:bg-forest text-white" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <XCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-teal hover:bg-forest text-white"
                  onClick={() => setState('idle')}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
