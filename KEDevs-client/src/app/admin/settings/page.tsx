'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings2, 
  Save, 
  RotateCcw, 
  Info, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

interface SettingEntry {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

export default function PlatformSettings() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getSettings();
        if (response.success) {
          const entries = Array.isArray(response.data)
            ? response.data.map((item: any) => ({ 
                key: item.settingKey, 
                label: item.description || item.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), 
                value: String(item.settingValue), 
                unit: (item.settingKey.includes('FEE') || item.settingKey.includes('BADGE')) ? 'KES' : '' 
              }))
            : Object.entries(response.data || {}).map(([key, value]) => ({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), value: String(value), unit: '' }));
          setSettings(entries);
        }
      } catch (err: any) {
        setError('Failed to load platform configuration.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((item) => item.key === key ? { ...item, value } : item));
  };

  const handleSave = async (key: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const setting = settings.find((item) => item.key === key);
      if (!setting) return;
      await adminService.updateSetting(key, setting.value);
      toast.success(`${setting.label} updated`);
    } catch (err: any) {
      toast.error('Failed to update setting');
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all(settings.map((item) => adminService.updateSetting(item.key, item.value)));
      toast.success('All configurations synchronized');
    } catch (err) {
      toast.error('Batch update failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">


      <div className="p-6 rounded-[2.5rem] bg-blue-50 border-2 border-blue-100 flex gap-4 shadow-sm">
         <Info className="h-6 w-6 text-blue-500 shrink-0" />
         <div className="space-y-1">
            <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Security Notice</p>
            <p className="text-xs font-medium text-blue-700 leading-relaxed">
               Modifications to platform variables impact real-time transactions, fee structures, and visibility logic. Changes are auditable.
            </p>
         </div>
      </div>

      <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
         <CardHeader className="p-10 pb-6 border-b border-slate-50">
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-2xl font-black">Configuration Matrix</CardTitle>
                  <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Master environment variables</CardDescription>
               </div>
               <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                  LIVE_PROD_ENV
               </Badge>
            </div>
         </CardHeader>

         <CardContent className="p-0">
            {isLoading ? (
               <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing state...</p>
               </div>
            ) : error ? (
               <div className="p-10 text-center text-red-500 font-bold">{error}</div>
            ) : (
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-100">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Parameter Key</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Current Value</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Dimension</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10 text-right">Control</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {settings.map((s) => (
                        <TableRow key={s.key} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                           <TableCell className="py-6 px-10">
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center text-white",
                                    s.key.includes('fee') ? "bg-emerald-500" : s.key.includes('api') ? "bg-blue-500" : "bg-slate-900"
                                 )}>
                                    {s.key.includes('fee') ? <Wallet className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                 </div>
                                 <span className="font-black text-slate-900 text-sm tracking-tight">{s.label}</span>
                              </div>
                           </TableCell>
                           <TableCell className="py-6 px-10">
                              <Input 
                                 className="h-10 rounded-xl bg-slate-50 border-none font-bold text-slate-900 w-32 focus-visible:ring-primary/20" 
                                 value={s.value} 
                                 onChange={(e) => handleChange(s.key, e.target.value)}
                              />
                           </TableCell>
                           <TableCell className="py-6 px-10">
                              <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200">
                                 {s.unit || 'VALUE'}
                              </Badge>
                           </TableCell>
                           <TableCell className="py-6 px-10 text-right">
                              <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary gap-2 h-10 hover:bg-primary/5"
                                 onClick={() => handleSave(s.key)}
                                 disabled={saving[s.key]}
                              >
                                 {saving[s.key] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                 Sync
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            )}

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <Lock className="h-4 w-4" /> Platform logic is protected by multi-layer encryption.
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black border-slate-200" onClick={() => window.location.reload()}>
                     <RotateCcw className="h-4 w-4 mr-2" /> Revert State
                  </Button>
                  <Button className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black bg-slate-900 shadow-xl shadow-slate-900/10" onClick={handleSaveAll}>
                     Apply Global Sync
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
