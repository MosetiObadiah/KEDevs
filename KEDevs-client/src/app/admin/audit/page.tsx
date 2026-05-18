'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Printer,
  Clock,
  User,
  Activity,
  Target,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_TYPES = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'APPROVE_EMPLOYER', label: 'Approve Employer' },
  { value: 'REJECT_EMPLOYER', label: 'Reject Employer' },
  { value: 'SUSPEND_USER', label: 'Suspend User' },
  { value: 'BAN_USER', label: 'Ban User' },
  { value: 'REACTIVATE_USER', label: 'Reactivate User' },
  { value: 'REVIEW_JOB_FLAG', label: 'Review Job Flag' },
  { value: 'REVIEW_USER_FLAG', label: 'Review User Flag' },
  { value: 'REVIEW_COMMENT_FLAG', label: 'Review Comment Flag' },
  { value: 'GRANT_VERIFIED_BADGE', label: 'Grant Verified Badge' },
  { value: 'REVOKE_VERIFIED_BADGE', label: 'Revoke Verified Badge' },
  { value: 'APPROVE_VERIFICATION', label: 'Approve Verification' },
  { value: 'REJECT_VERIFICATION', label: 'Reject Verification' },
  { value: 'UPDATE_PLATFORM_SETTING', label: 'Update Setting' },
  { value: 'OVERRIDE_SPOTLIGHT', label: 'Override Spotlight' },
];

const ACTION_COLORS: Record<string, string> = {
  APPROVE_EMPLOYER: 'bg-cyan-50 text-cyan-800',
  REJECT_EMPLOYER: 'bg-danger-50 text-danger-700',
  APPROVE_VERIFICATION: 'bg-cyan-50 text-cyan-800',
  REJECT_VERIFICATION: 'bg-danger-50 text-danger-700',
  SUSPEND_USER: 'bg-azure-50 text-azure-700',
  BAN_USER: 'bg-danger-50 text-danger-700',
  REACTIVATE_USER: 'bg-azure-100 text-azure-700',
  GRANT_VERIFIED_BADGE: 'bg-violet-100 text-violet-700',
  REVOKE_VERIFIED_BADGE: 'bg-slate-100 text-slate-700',
  REVIEW_JOB_FLAG: 'bg-orange-100 text-orange-700',
  REVIEW_USER_FLAG: 'bg-orange-100 text-orange-700',
  REVIEW_COMMENT_FLAG: 'bg-orange-100 text-orange-700',
  UPDATE_PLATFORM_SETTING: 'bg-azure-100 text-azure-700',
  OVERRIDE_SPOTLIGHT: 'bg-indigo-100 text-indigo-700',
};

const OUTCOME_COLORS: Record<string, string> = {
  APPROVED: 'bg-cyan-600',
  REJECTED: 'bg-danger-500',
  SUSPENDED: 'bg-azure-500',
  BANNED: 'bg-danger-500',
  ACTIVE: 'bg-azure-500',
  GRANT: 'bg-violet-500',
  REVOKE: 'bg-slate-500',
  UPDATED: 'bg-azure-500',
  LEGITIMATE: 'bg-slate-500',
  REMOVE: 'bg-danger-500',
  REMOVED: 'bg-danger-500',
  KEPT: 'bg-emerald-400',
  CLEARED: 'bg-emerald-400',
  WARNED: 'bg-warning-400',
};

function formatActionLabel(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAuditLog({
        page,
        size: 25,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
      });
      if (res.success && res.data) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      setError('Failed to load audit log');
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search filter
  const filtered = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.adminName?.toLowerCase().includes(q) ||
      log.actionType?.toLowerCase().includes(q) ||
      log.targetType?.toLowerCase().includes(q) ||
      log.targetId?.toLowerCase().includes(q) ||
      log.notes?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <ShieldAlert className="h-4 w-4" />
          <span>{totalElements.toLocaleString()} total entries</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-black gap-2 border-slate-100 h-9"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" className="rounded-xl font-black bg-slate-900 h-9 px-4 gap-2">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-xl-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
        <CardContent className="p-10 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by admin, action, or target ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-slate-50 border-none font-medium text-sm"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v || 'ALL'); setPage(0); }}>
              <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-medium text-sm min-w-[200px]">
                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ACTION_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="font-medium">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl-[2rem] border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Timestamp</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Admin Actor</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Action</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Target</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Outcome</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading audit trail...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-danger-300" />
                        <p className="text-sm font-medium text-danger-400">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchLogs} className="mt-2 rounded-xl font-medium">
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="h-8 w-8 text-slate-200" />
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                          {search || actionFilter ? 'No matching entries' : 'No audit entries yet'}
                        </p>
                        <p className="text-xs text-slate-300 font-medium">Admin actions will appear here as they occur</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                            <span className="whitespace-nowrap">{formatDate(log.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{log.adminName || 'Admin'}</p>
                              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">ADMIN</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className={cn(
                            "rounded-xl font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5",
                            ACTION_COLORS[log.actionType] || 'bg-slate-100 text-slate-700'
                          )}>
                            {formatActionLabel(log.actionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Target className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-slate-700 uppercase">{log.targetType}</p>
                              <p className="text-[10px] font-medium text-slate-500 font-mono truncate max-w-[120px]">
                                {log.targetId ? log.targetId.substring(0, 8) + '...' : '—'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {log.outcome ? (
                            <Badge className={cn(
                              "rounded-xl font-black text-[9px] uppercase tracking-widest border-none text-white px-2 py-0.5",
                              OUTCOME_COLORS[log.outcome] || 'bg-slate-500'
                            )}>
                              {log.outcome}
                            </Badge>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100">
                            {expandedRow === log.id
                              ? <ChevronUp className="h-4 w-4 text-slate-500" />
                              : <ChevronDown className="h-4 w-4 text-slate-500" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRow === log.id && (
                        <TableRow className="border-slate-50 bg-slate-50/30">
                          <TableCell colSpan={6} className="py-4 px-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Full Target ID</p>
                                <code className="text-xs font-mono text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded-xl block">{log.targetId || '—'}</code>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Admin ID</p>
                                <code className="text-xs font-mono text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded-xl block">{log.adminId || '—'}</code>
                              </div>
                              {log.notes && (
                                <div className="md:col-span-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Notes / Reason</p>
                                  <p className="text-sm font-medium text-slate-700 bg-white border border-slate-100 px-3 py-2 rounded-xl">{log.notes}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" />
              {filtered.length} of {totalElements.toLocaleString()} entries shown
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-slate-100"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-slate-500 px-2">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-slate-100"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
