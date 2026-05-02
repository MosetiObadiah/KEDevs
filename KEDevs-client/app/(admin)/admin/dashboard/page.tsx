import type { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and analytics</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Admin dashboard in Module 8</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Revenue charts, user stats, and platform health metrics.
        </p>
      </div>
    </div>
  );
}
