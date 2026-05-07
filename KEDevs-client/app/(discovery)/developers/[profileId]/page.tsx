'use client';

import { PublicDeveloperProfileView } from '@/components/profile/PublicDeveloperProfileView';

export default function DeveloperProfilePage({ params }: { params: { profileId: string } }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PublicDeveloperProfileView profileId={params.profileId} />
    </div>
  );
}
