import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';

export const metadata: Metadata = { title: 'Employers' };

export default function EmployersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Employer Directory</h1>
        <p className="text-muted-foreground text-sm mt-1">Companies hiring in the Kenyan tech ecosystem</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Employer profiles in Module 5</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Browse company profiles, bookmarks, and contact requests.
        </p>
      </div>
    </div>
  );
}
