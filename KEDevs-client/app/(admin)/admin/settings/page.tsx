'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Settings2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminApi.getPlatformSettings,
  });

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      settings.forEach(s => { initial[s.settingKey] = s.settingValue; });
      setLocalSettings(initial);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string, value: string }) => adminApi.updatePlatformSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Setting updated successfully');
    },
    onError: () => toast.error('Failed to update setting')
  });

  const handleSave = (key: string) => {
    updateMutation.mutate({ key, value: localSettings[key] });
  };

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading || !settings) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage global configuration and pricing</p>
        </div>
      </div>

      <Card className="rounded-3xl border-secondary shadow-sm">
        <CardHeader>
          <CardTitle>Pricing & Configuration</CardTitle>
          <CardDescription>Adjust the pricing values (in KES) and other platform variables. Changes take effect immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-secondary rounded-2xl bg-secondary/5">
              <div className="flex-1">
                <h4 className="font-bold text-foreground font-mono text-sm">{setting.settingKey}</h4>
                <p className="text-sm text-muted-foreground mt-1">{setting.description || 'No description provided.'}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input 
                  value={localSettings[setting.settingKey] || ''} 
                  onChange={(e) => handleChange(setting.settingKey, e.target.value)}
                  className="w-32 font-mono text-right"
                />
                <Button 
                  onClick={() => handleSave(setting.settingKey)} 
                  disabled={updateMutation.isPending || localSettings[setting.settingKey] === setting.settingValue}
                  className="shrink-0"
                >
                  {updateMutation.isPending && localSettings[setting.settingKey] !== setting.settingValue ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="sr-only">Save</span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
