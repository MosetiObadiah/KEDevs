'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { format } from 'date-fns';
import { AdminPaymentResponse } from '@/lib/types';
import {
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [page, setPage] = useState(0);
  const size = 20;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, roleFilter, startDate, endDate]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = { page, size };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.endDate = end.toISOString();
      }

      const res = await adminService.getPayments(params);
      if (res.data?.success) {
        setPayments(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.endDate = end.toISOString();
      }

      const blob = await adminService.exportPayments(format, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Total {totalElements} transactions found
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="font-medium bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl h-10 px-4" disabled={isExporting || totalElements === 0}>
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-xl border-slate-100">
            <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs py-2.5 rounded-lg flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs py-2.5 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Status</label>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">User Type</label>
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(0); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="DEVELOPER">Developer</SelectItem>
                <SelectItem value="EMPLOYER">Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {(statusFilter !== 'all' || roleFilter !== 'all' || startDate || endDate) && (
          <Button variant="ghost" onClick={clearFilters} className="h-10 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 whitespace-nowrap">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-900">User</th>
                <th className="px-6 py-4 font-bold text-slate-900">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-900">Service Type</th>
                <th className="px-6 py-4 font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 font-bold text-slate-900">Receipt</th>
                <th className="px-6 py-4 font-bold text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-sm">Loading payments...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm">No payments found matching the criteria.</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{payment.userName}</div>
                      <div className="text-xs text-slate-500">{payment.userEmail}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{payment.userRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">{payment.currency} {payment.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
                        {payment.type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'COMPLETED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>}
                      {payment.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                      {payment.status === 'FAILED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100"><XCircle className="w-3.5 h-3.5" /> Failed</span>}
                      {payment.status === 'CANCELLED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200"><AlertTriangle className="w-3.5 h-3.5" /> Cancelled</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-slate-600">
                        {payment.mpesaReceiptNo || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="rounded-xl font-semibold"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="rounded-xl font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
