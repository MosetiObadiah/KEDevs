'use client';

import { useAuth } from '@/lib/auth/hooks';
import { DeveloperProfileView } from '@/components/profile/DeveloperProfileView';
import { EmployerProfileView } from '@/components/profile/EmployerProfileView';
import { Loader2 } from 'lucide-react';

export default function MyProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#52796F]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user?.role === 'EMPLOYER' ? (
        <EmployerProfileView />
      ) : (
        <DeveloperProfileView />
      )}
    </div>
  );
}
