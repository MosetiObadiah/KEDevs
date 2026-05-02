import type { Metadata } from 'next';
import { User } from 'lucide-react';

export const metadata: Metadata = { title: 'My Profile' };

export default function MyProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your developer or employer profile</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Profile editor in Module 4/5</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Edit your skills, education, projects, and more.
        </p>
      </div>
    </div>
  );
}
