'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Mail,
  AppWindow,
  Save,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Zap,
  Globe,
  Sparkles,
  Smartphone,
  AtSign,
  Settings,
  Shield,
  Eye,
  ArrowRight
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const router = useRouter();

  useEffect(() => {
    fetchPreferences();
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await notificationService.getPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updatedPreferences);

    try {
      const response = await notificationService.updatePreferences(updatedPreferences);
      if (response.success) {
        toast.success('Preferences updated');
      }
    } catch (error) {
      toast.error('Failed to synchronize');
      // Rollback on error
      setPreferences(preferences);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success('System notifications synchronized with desktop!');
        new Notification('KEDevs-Connect', {
          body: 'You have successfully enabled desktop alerts.',
          icon: '/favicon.ico'
        });
      } else if (result === 'denied') {
        toast.error('Notification access was blocked by the browser.');
      }
    } catch (err) {
      console.error('Failed to request permission', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-muted/30">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Configuring preferences...</p>
      </div>
    );
  }

  const sections = [
    {
      title: 'Communication Hub',
      description: 'Define your preferred interaction protocols',
      icon: <Bell className="h-5 w-5 text-primary" />,
      items: [
        { key: 'emailOnPaymentReceipt', label: 'Financial Alerts', desc: 'Critical receipts and payment cycle notifications' },
        { key: 'emailOnJobApplication', label: 'Talent Acquisition', desc: 'Alerts for incoming talent and recruitment notifications' },
        { key: 'inAppOnJobApplication', label: 'Application Status', desc: 'Real-time status updates on active job cycles' },
        { key: 'inAppOnCommentReply', label: 'Community Sync', desc: 'Instant alerts for forum interaction and replies' },
        { key: 'inAppOnEndorsement', label: 'Endorsements', desc: 'Notify when peers endorse your professional profile' },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex gap-3">
            <Button variant="outline" className="font-medium border-primary/20 hover:bg-primary/5 h-11" asChild>
              <Link href="/notifications">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Inbox
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Navigation</h3>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                <Button variant="secondary" className="w-full justify-start font-medium h-10 gap-3 bg-primary/5 text-primary border-none">
                  <Bell className="h-4 w-4" /> Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground" asChild>
                  <Link href="/settings/visibility">
                    <Eye className="h-4 w-4" /> Visibility
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground opacity-50 cursor-not-allowed">
                  <Settings className="h-4 w-4" /> Account
                </Button>
                <Button variant="ghost" className="w-full justify-start font-medium h-10 gap-3 text-muted-foreground opacity-50 cursor-not-allowed">
                  <Shield className="h-4 w-4" /> Privacy
                </Button>
              </CardContent>
              <Separator className="bg-border/50" />
              <CardFooter className="p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3 text-cyan-600" /> Secure Protocol
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">Preferences are encrypted and stored according to our privacy policy.</p>
              </CardFooter>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 space-y-8">
            {sections.map((section, sIdx) => (
              <Card key={sIdx} className="border-border/50 shadow-sm overflow-hidden bg-white rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-border/50">
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {section.items.map((item) => (
                      <div key={item.key} className="p-6 flex items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm tracking-tight">{item.label}</h3>
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                        <Switch
                          checked={preferences?.[item.key] || false}
                          onCheckedChange={() => handleToggle(item.key)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="bg-primary/5 rounded-2xl border border-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Push Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    {permission === 'granted'
                      ? 'Your terminal is currently synchronized with desktop alerts.'
                      : 'Enable desktop alerts for the most critical ecosystem notifications.'}
                  </p>
                </div>
              </div>
              <Button
                className={cn(
                  "font-medium gap-2 transition-all",
                  permission === 'granted' ? "bg-cyan-600 hover:bg-cyan-600 shadow-emerald-500/20" : ""
                )}
                onClick={requestPermission}
                disabled={permission === 'granted'}
              >
                {permission === 'granted' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Notifications Active
                  </>
                ) : (
                  <>
                    Enable Browser Alerts <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
