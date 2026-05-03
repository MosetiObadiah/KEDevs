'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  title = "Unlock Advanced Features",
  description = "You've reached a Pro feature. Upgrade your account or purchase search tokens to continue."
}: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-secondary sm:rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-3xl -ml-16 -mb-16" />
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm relative z-10">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-black text-foreground text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mt-2 font-medium">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-background/50">
          <Link href="/payments" className="block" onClick={() => onOpenChange(false)}>
            <div className="group border border-secondary hover:border-primary bg-white rounded-2xl p-4 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">Upgrade to Pro (Annual)</h4>
                <p className="text-xs text-muted-foreground font-medium">Unlimited filters, direct contacts & badges.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/payments" className="block" onClick={() => onOpenChange(false)}>
            <div className="group border border-secondary hover:border-primary bg-white rounded-2xl p-4 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground group-hover:text-blue-600 transition-colors">Buy Search Tokens</h4>
                <p className="text-xs text-muted-foreground font-medium">Pack of 10 tokens for occasional searches.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <div className="pt-2 text-center">
            <Link href="/payments" onClick={() => onOpenChange(false)}>
              <Button variant="link" className="text-muted-foreground hover:text-primary font-bold">
                Learn more about Pro features
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
