import type { Metadata } from 'next';
import { Settings } from 'lucide-react';

export const metadata: Metadata = { title: 'Platform Settings' };

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure platform-wide settings and pricing</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Settings management in Module 8</h2>
      </div>
    </div>
  );
}
