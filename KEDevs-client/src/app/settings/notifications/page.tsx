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
  AtSign
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPreferences();
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

  const handleToggle = (key: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await notificationService.updatePreferences(preferences);
      if (response.success) {
        toast.success('Notification protocols updated');
      }
    } catch (error) {
      toast.error('Failed to synchronize settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuring preferences...</p>
      </div>
    );
  }

  const sections = [
    {
      title: 'Email Protocols',
      description: 'Decide which transmissions reach your official inbox',
      icon: <AtSign className="h-6 w-6 text-primary" />,
      items: [
        { key: 'emailOnPaymentReceipt', label: 'Financial Transactions', desc: 'Detailed receipts for every payment cycle' },
        { key: 'emailOnJobApplication', label: 'Talent Acquisition', desc: 'Instant alerts when candidates apply to your posts' },
        { key: 'emailOnJobFlagged', label: 'Moderation Alerts', desc: 'Critical notifications regarding content policy flags' },
        { key: 'emailOnSubscriptionExpiry', label: 'Ecosystem Access', desc: 'Lifecycle alerts for your subscription tiers' },
        { key: 'emailOnSpotlightExpired', label: 'Spotlight Cycles', desc: 'Alerts when premium visibility windows close' },
        { key: 'emailOnVerifiedBadge', label: 'Identity Status', desc: 'Progress updates on your verification badges' },
      ],
    },
    {
      title: 'Real-time Pulse',
      description: 'Configure in-app alerts and mobile notifications',
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      items: [
        { key: 'inAppOnJobApplication', label: 'Application Pulse', desc: 'Real-time banners for incoming talent' },
        { key: 'inAppOnCommentReply', label: 'Community Sync', desc: 'Instant alerts for forum interaction and replies' },
        { key: 'inAppOnEndorsement', label: 'Social Proof', desc: 'Notify when peers endorse your professional profile' },
        { key: 'inAppOnFlagReviewed', label: 'Decision Trace', desc: 'Updates on administrative content reviews' },
        { key: 'inAppOnSpotlightExpired', label: 'Visibility Status', desc: 'Real-time status of your premium placement' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl animate-in fade-in duration-700">
      <div className="mb-12 space-y-4">
         <Link href="/notifications" className="inline-flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all group">
            <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Inbox
         </Link>
         <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Sync Preferences</h1>
            <p className="text-slate-500 font-semibold italic">Fine-tune how the platform communicates with you</p>
         </div>
      </div>

      <div className="space-y-8 mb-12">
         {sections.map((section, sIdx) => (
            <Card key={sIdx} className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
               <CardHeader className="p-10 pb-6 bg-slate-50/50 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                        {section.icon}
                     </div>
                     <div>
                        <CardTitle className="text-xl font-black">{section.title}</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">{section.description}</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                     {section.items.map((item) => (
                        <div key={item.key} className="p-8 flex items-center justify-between gap-6 group hover:bg-slate-50/30 transition-colors">
                           <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="font-black text-slate-900 text-sm tracking-tight">{item.label}</h3>
                              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-sm">{item.desc}</p>
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
      </div>

      <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
               <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Preferences stored securely</p>
         </div>
         <div className="flex gap-4">
            <Button variant="ghost" className="rounded-2xl h-14 px-8 text-white/50 hover:text-white hover:bg-white/5 font-black" onClick={() => router.back()}>
               Cancel
            </Button>
            <Button className="rounded-2xl h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xl" onClick={handleSave} disabled={saving}>
               {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />} Synchronize
            </Button>
         </div>
      </div>
    </div>
  );
}
