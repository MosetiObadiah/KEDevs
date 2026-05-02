import type { Metadata } from 'next';
import { Rss } from 'lucide-react';

export const metadata: Metadata = { title: 'Feed' };

export default function FeedPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Developer Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">Latest activity from the community</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Rss className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Feed coming soon</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Module 1 will populate this page with job posts, discussions, and community updates.
        </p>
      </div>
    </div>
  );
}
