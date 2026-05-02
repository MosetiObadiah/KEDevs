import type { Metadata } from 'next';
import { CreditCard } from 'lucide-react';

export const metadata: Metadata = { title: 'Payments' };

export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payments & Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your membership and M-Pesa payments</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Payments in Module 6</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Annual membership, Pro upgrades, and verified badge via M-Pesa.
        </p>
      </div>
    </div>
  );
}
