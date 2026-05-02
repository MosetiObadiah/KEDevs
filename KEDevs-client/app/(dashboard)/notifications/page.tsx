import type { Metadata } from 'next';
import { Bell } from 'lucide-react';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay up to date with your activity</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Notifications in Module 7</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          In-app and email notifications with preference controls.
        </p>
      </div>
    </div>
  );
}
