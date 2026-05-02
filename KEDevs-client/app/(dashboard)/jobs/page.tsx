import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';

export const metadata: Metadata = { title: 'Jobs' };

export default function JobsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
        <p className="text-muted-foreground text-sm mt-1">Find your next role in Kenya&apos;s tech scene</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Jobs coming in Module 3</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Full job board with filters, applications, and forum discussions.
        </p>
      </div>
    </div>
  );
}
