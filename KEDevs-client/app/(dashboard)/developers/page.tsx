import type { Metadata } from 'next';
import { Users } from 'lucide-react';

export const metadata: Metadata = { title: 'Developers' };

export default function DevelopersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Developer Directory</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover skilled Kenyan developers</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Developer profiles in Module 4</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Browse, filter, and contact developers with full profile cards.
        </p>
      </div>
    </div>
  );
}
