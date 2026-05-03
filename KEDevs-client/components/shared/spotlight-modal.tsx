'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Loader2, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';

interface SpotlightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SpotlightModal({ open, onOpenChange, onSuccess }: SpotlightModalProps) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const handleSpotlightPurchase = async () => {
    if (!phone || phone.length < 9) {
      toast.error('Please enter a valid M-Pesa phone number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/payments/spotlight', { phoneNumber: phone });
      
      toast.success('M-Pesa STK push sent! Check your phone.');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate Spotlight payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-3xl border-secondary">
        <DialogHeader>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 border border-amber-200">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Get Spotlighted
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Boost your profile visibility to the top of the directory for 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-secondary/20 p-4 rounded-2xl flex items-center gap-4">
            <Calendar className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Available Immediately</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your spotlight will begin as soon as payment is confirmed.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-primary">M-Pesa Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="254700000000" 
                className="pl-9 h-12 rounded-xl bg-white focus:border-primary focus:ring-primary/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">Amount: KES 1,000</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleSpotlightPurchase} 
            disabled={loading}
            className="bg-primary hover:bg-[#2a6f4d] text-white rounded-xl font-bold"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Pay with M-Pesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
