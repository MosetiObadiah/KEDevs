'use client';

import { useParams } from 'next/navigation';
import { PublicDeveloperProfileView } from '@/components/profile/PublicDeveloperProfileView';

export default function PublicProfilePage() {
  const { profileId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PublicDeveloperProfileView profileId={profileId as string} />
    </div>
  );
}
