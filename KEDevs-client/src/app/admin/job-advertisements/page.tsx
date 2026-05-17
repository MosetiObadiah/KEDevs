'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Megaphone,
  Trash2,
  Loader2,
  Clock,
  FileText,
  Download,
  History,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/adminService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const durationLabel = (type: string) => {
  switch (type) {
    case 'PINNED_JOB_DAY':    return '1 Day';
    case 'PINNED_JOB_3DAYS':  return '3 Days';
    case 'PINNED_JOB_7DAYS':  return '7 Days';
    default:                   return type;
  }
};

const durationColor = (type: string) => {
  switch (type) {
    case 'PINNED_JOB_DAY':    return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'PINNED_JOB_3DAYS':  return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'PINNED_JOB_7DAYS':  return 'bg-amber-50 text-amber-700 border-amber-100';
    default:                   return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function timeLeft(endDate: string) {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number | string; accent: string;
}) {
  return (
    <Card className={cn('rounded-[2rem] border-none shadow-lg relative overflow-hidden', accent)}>
      <CardContent className="p-7 flex items-center gap-5">
        <div className="p-3.5 rounded-2xl bg-white/60 shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function JobAdvertisementsPage() {
  // Tabs
  const [tab, setTab] = useState<'active' | 'history'>('active');

  // Active slots
  const [active, setActive] = useState<any[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [loadingActive, setLoadingActive] = useState(true);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Override modal
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [overriding, setOverriding] = useState(false);

  // Export
  const [exporting, setExporting] = useState(false);

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const fetchActive = useCallback(async (page = 0) => {
    setLoadingActive(true);
    try {
      const res = await adminService.getJobAdvertisements(page, 10);
      if (res.success) {
        setActive(res.data.content || []);
        setActiveTotalPages(res.data.totalPages ?? 1);
      }
    } catch {
      toast.error('Failed to fetch active advertisements');
    } finally {
      setLoadingActive(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 0) => {
    setLoadingHistory(true);
    try {
      const res = await adminService.getJobAdvertisementHistory(page, 10);
      if (res.success) {
        setHistory(res.data.content || []);
        setHistoryTotalPages(res.data.totalPages ?? 1);
      }
    } catch {
      toast.error('Failed to fetch advertisement history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchActive(activePage); }, [fetchActive, activePage]);
  useEffect(() => { if (tab === 'history') fetchHistory(historyPage); }, [fetchHistory, tab, historyPage]);

  // ── Override ──────────────────────────────────────────────────────────────

  const handleOverride = async () => {
    if (!reason.trim()) { toast.error('A reason is required'); return; }
    setOverriding(true);
    try {
      await adminService.overrideJobAdvertisement(selectedSlot.id, reason);
      toast.success('Job advertisement removed. The employer has been notified.');
      setSelectedSlot(null);
      setReason('');
      fetchActive(activePage);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove advertisement');
    } finally {
      setOverriding(false);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = async (format: 'pdf' | 'csv') => {
    setExporting(true);
    try {
      const blob = format === 'pdf'
        ? await adminService.exportJobAdvertisementsPdf()
        : await adminService.exportJobAdvertisementsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_advertisements_history.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`History exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // ── Counts ────────────────────────────────────────────────────────────────

  const activeCount = active.filter(s => s.isActive).length;
  const expiringCount = active.filter(s => {
    const diff = new Date(s.endDate).getTime() - Date.now();
    return s.isActive && diff > 0 && diff < 1000 * 60 * 60 * 24;
  }).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Job Advertisements</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Manage pinned job slots and review advertisement history</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 px-5 rounded-xl font-bold gap-2 border-slate-200 shadow-sm"
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export History
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100 p-1">
            <DropdownMenuItem
              onClick={() => handleExport('pdf')}
              className="rounded-lg font-bold gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-red-500" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('csv')}
              className="rounded-lg font-bold gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-emerald-500" /> Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList className="bg-slate-100 rounded-2xl p-1.5 h-12 gap-1">
          <TabsTrigger
            value="active"
            className="rounded-xl font-black text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Megaphone className="h-3.5 w-3.5 mr-2" />
            Active Slots
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-xl font-black text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <History className="h-3.5 w-3.5 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* ── Active Tab ── */}
        <TabsContent value="active" className="mt-6">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
            <CardHeader className="p-10 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-black">Current Pinned Jobs</CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                Paid advertisement placements — max 3 active at once
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingActive ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading…</p>
                </div>
              ) : active.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Megaphone className="h-10 w-10 text-slate-200" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active job advertisements</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Job</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Employer</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Package</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Status</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Expires</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.map((slot) => (
                      <TableRow
                        key={slot.id}
                        className={cn(
                          'border-slate-50 transition-colors',
                          slot.isActive ? 'bg-violet-50/10 hover:bg-violet-50/30' : 'hover:bg-slate-50/50'
                        )}
                      >
                        <TableCell className="py-6 px-10">
                          <div className="flex flex-col gap-0.5">
                            <p className="font-black text-slate-900 text-sm">{slot.jobTitle || 'Unknown Job'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[180px]">{slot.jobId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <p className="font-bold text-slate-700 text-sm">{slot.employerName || '—'}</p>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <Badge
                            variant="outline"
                            className={cn('rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5', durationColor(slot.durationType))}
                          >
                            {durationLabel(slot.durationType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'h-2 w-2 rounded-full',
                              slot.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            )} />
                            <span className={cn(
                              'text-xs font-bold uppercase tracking-tight',
                              slot.isActive ? 'text-emerald-600' : 'text-slate-400'
                            )}>
                              {slot.isActive ? 'Live' : 'Expired'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-bold text-slate-600">{formatDate(slot.endDate)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timeLeft(slot.endDate)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-right">
                          {slot.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all font-bold gap-2 text-xs"
                              onClick={() => { setSelectedSlot(slot); setReason(''); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {activeTotalPages > 1 && (
                <div className="flex items-center justify-between px-10 py-5 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Page {activePage + 1} of {activeTotalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="rounded-xl h-9"
                      disabled={activePage === 0}
                      onClick={() => setActivePage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="rounded-xl h-9"
                      disabled={activePage + 1 >= activeTotalPages}
                      onClick={() => setActivePage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history" className="mt-6">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
            <CardHeader className="p-10 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-black">Advertisement History</CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                All expired organic slot completions (admin-removed excluded)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading history…</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <History className="h-10 w-10 text-slate-200" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No advertisement history yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Job</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Employer</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Package</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Started</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-6">Ended</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((slot) => (
                      <TableRow key={slot.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-6 px-10">
                          <p className="font-black text-slate-900 text-sm">{slot.jobTitle || 'Unknown Job'}</p>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <p className="font-bold text-slate-700 text-sm">{slot.employerName || '—'}</p>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <Badge
                            variant="outline"
                            className={cn('rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5', durationColor(slot.durationType))}
                          >
                            {durationLabel(slot.durationType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-xs font-bold text-slate-500">
                          {formatDate(slot.startDate)}
                        </TableCell>
                        <TableCell className="py-6 px-6 text-xs font-bold text-slate-500">
                          {formatDate(slot.endDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between px-10 py-5 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Page {historyPage + 1} of {historyTotalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="rounded-xl h-9"
                      disabled={historyPage === 0}
                      onClick={() => setHistoryPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="rounded-xl h-9"
                      disabled={historyPage + 1 >= historyTotalPages}
                      onClick={() => setHistoryPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Override Confirmation Dialog ── */}
      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="sm:max-w-[460px] rounded-[2rem]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-50">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="font-black text-xl">Remove Job Advertisement</DialogTitle>
            </div>
            <DialogDescription className="font-medium leading-relaxed">
              You are about to remove the pinned advertisement for{' '}
              <strong className="text-slate-900">{selectedSlot?.jobTitle}</strong>
              {' '}by <strong className="text-slate-900">{selectedSlot?.employerName}</strong>.{' '}
              The employer will be notified via in-app notification and email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Slot info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Package</span>
                <Badge variant="outline" className={cn('rounded-lg font-black text-[9px] px-2', durationColor(selectedSlot?.durationType))}>
                  {durationLabel(selectedSlot?.durationType || '')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Expires</span>
                <span className="text-xs font-bold text-slate-700">{selectedSlot?.endDate ? formatDate(selectedSlot.endDate) : '—'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-reason" className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                Reason for Removal <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="override-reason"
                placeholder="e.g., Job post violates community guidelines…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl border-slate-200 font-medium resize-none min-h-[90px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() => setSelectedSlot(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold gap-2"
              onClick={handleOverride}
              disabled={overriding || !reason.trim()}
            >
              {overriding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove Advertisement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
