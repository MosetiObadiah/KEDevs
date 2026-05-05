'use client';

import { Suspense } from 'react';
import { DashboardContent, DashboardSkeleton } from '@/app/(dashboard)/dashboard/page';

export default function FeedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
