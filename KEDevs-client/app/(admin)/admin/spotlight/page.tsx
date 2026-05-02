import type { Metadata } from 'next';
import { Star } from 'lucide-react';

export const metadata: Metadata = { title: 'Spotlight Management' };

export default function AdminSpotlightPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Spotlight Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Override and manage developer spotlight slots</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Spotlight admin in Module 8</h2>
      </div>
    </div>
  );
}
