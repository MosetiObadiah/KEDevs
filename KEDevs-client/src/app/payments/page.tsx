'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BadgeCheck, 
  Zap, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  Star,
  Loader2,
  Receipt,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { paymentService } from '@/services/paymentService';
import { spotlightService } from '@/services/spotlightService';
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
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { getPrice } = usePlatformSettings();
  const isDev = user?.role === 'DEVELOPER';

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [spotlightStatus, setSpotlightStatus] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Payment history — this is the main data, let it fail loudly (propagates to outer catch)
        const historyRes = await paymentService.getHistory();
        if (historyRes.success) {
          setPaymentHistory(historyRes.data?.content || historyRes.data || []);
        }

        // Spotlight availability — optional, don't block page if it fails
        try {
          const availRes = await spotlightService.getAvailability();
          if (availRes.success) setAvailability(availRes.data);
        } catch (availErr) {
          console.log('Spotlight availability fetch skipped/failed');
        }

        // Spotlight status — optional, don't block the page if it fails
        if (isDev) {
          try {
            const slRes = await spotlightService.getMyStatus();
            if (slRes.success) setSpotlightStatus(slRes.data);
          } catch (slErr) {
            console.log('No spotlight status available');
          }
        }
      } catch (err) {
        console.error('Failed to load payment data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isDev]);

  const handleConfirmSpotlight = async () => {
    setConfirming(true);
    try {
      const res = await paymentService.confirmSpotlight();
      if (res.success) {
        toast.success('Spotlight activated!');
        const slRes = await spotlightService.getMyStatus();
        if (slRes.success) setSpotlightStatus(slRes.data);
      }
    } catch (err: any) {
      toast.error('No pending spotlight payment found.');
    } finally {
      setConfirming(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/v1/payments/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Payment history exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Export failed", err);
      toast.error('Failed to export payment history.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeLeft = (endDate: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
    return `${h}h ${m}m remaining`;
  };

  const stats = {
    total: paymentHistory.length,
    pending: paymentHistory.filter(p => p.status === 'PENDING').length,
    completed: paymentHistory.filter(p => p.status === 'COMPLETED').length,
    failed: paymentHistory.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length,
    totalVolume: paymentHistory.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.amount || 0), 0)
  };

  // Check if any slot is available
  const hasSpotlightAvailability = availability ? (availability.daySlotAvailable || availability.weekSlotAvailable) : false;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing ledger...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/10 text-primary border-none px-3 py-1 mb-2">
              Financials
            </Badge>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ledger history</h1>
          </div>
          <div className="flex flex-wrap gap-3 print:hidden">
              {!user?.isVerified && (
                <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-11" asChild>
                   <Link href="/verify">
                      <BadgeCheck className="mr-2 h-4 w-4 text-primary" /> Begin Verification
                   </Link>
                </Button>
              )}
              
              {isDev && !spotlightStatus?.active && (
                <>
                  {hasSpotlightAvailability ? (
                    <Button className="font-bold h-11 shadow-lg shadow-primary/20" asChild>
                       <Link href="/profile/me?buySpotlight=true">
                          <Star className="mr-2 h-4 w-4 fill-white" /> Get Spotlight
                       </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="font-bold h-11 border-dashed opacity-70">
                       <ShieldAlert className="mr-2 h-4 w-4" /> Spotlight Not Available
                    </Button>
                  )}
                </>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-12 space-y-8">
            
            {spotlightStatus?.active && (
              <Card className="border-border/50 shadow-sm bg-amber-50/30 border-amber-100">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70">Spotlight Time Remaining</p>
                        <p className="text-xl font-bold text-amber-700">{formatTimeLeft(spotlightStatus.endDate)}</p>
                    </div>
                  </CardContent>
              </Card>
            )}

            <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-border/50 bg-muted/10 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Transaction Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Historical record of all platform activity.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                   {isDev && !spotlightStatus?.active && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-8"
                        onClick={handleConfirmSpotlight}
                        disabled={confirming}
                      >
                         {confirming ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                         Sync Payment
                      </Button>
                   )}
                   
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" size="sm" className="font-bold gap-2 border-primary/20 hover:bg-primary/5 h-9" disabled={isExporting}>
                            <Download className="h-4 w-4 text-primary" /> {isExporting ? 'Exporting...' : 'Export'}
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl">
                         <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium py-2">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" /> Download as CSV
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium py-2">
                            <FileText className="mr-2 h-4 w-4 text-primary" /> Download as PDF
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>

                   <History className="h-5 w-5 text-muted-foreground/30" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {paymentHistory.length === 0 ? (
                  <div className="py-32 text-center space-y-6">
                    <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                      <Receipt className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">No transactions detected in current cycle</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/50">
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Timestamp</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Service Type</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6 text-center">Amount (KES)</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Phone</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Receipt / Note</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6 text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((row) => (
                          <TableRow key={row.id} className="border-border/50 hover:bg-muted/20 transition-colors">
                            <TableCell className="py-5 px-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Clock className="h-3 w-3" /> {formatDate(row.paidAt || row.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="font-bold text-foreground text-sm tracking-tight">
                                {row.type?.split('_').map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') || 'Platform Service'}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <span className="font-bold text-primary text-sm">
                                {Number(row.amount || 0).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="text-xs text-muted-foreground font-medium">
                                {row.phoneNumber || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6 max-w-[200px]">
                              {row.status === 'COMPLETED' && row.mpesaReceiptNo ? (
                                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {row.mpesaReceiptNo}
                                </span>
                              ) : row.failReason ? (
                                <span className="text-xs text-destructive/70 truncate block" title={row.failReason}>
                                  {row.failReason}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6 text-right">
                              <Badge className={cn(
                                "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5 text-white",
                                row.status === 'COMPLETED' ? "bg-emerald-500" 
                                  : row.status === 'PENDING' ? "bg-amber-500"
                                  : row.status === 'CANCELLED' ? "bg-slate-400"
                                  : "bg-destructive"
                              )}>
                                {row.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="p-6 bg-muted/20 border-t border-border/50 flex items-center gap-3">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">All transactions are processed via secure encrypted channels</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview Card below the Ledger */}
            <Card className="border-border/50 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="p-6 pb-2">
                 <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-bold">Financial Overview</CardTitle>
                 </div>
                 <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comprehensive payment statistics from the database</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Volume</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-foreground">KES {stats.totalVolume.toLocaleString()}</span>
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 border-l border-border/50 pl-6">
                       <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black">
                          {stats.total}
                       </div>
                       <div>
                          <p className="text-sm font-bold">Total Events</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">All Statuses</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-border/50 pl-6">
                       <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black">
                          {stats.completed}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-emerald-600">Approved</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-border/50 pl-6">
                       <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black">
                          {stats.pending}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-amber-600">Pending</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processing</p>
                       </div>
                    </div>
                 </div>

                 {stats.failed > 0 && (
                   <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <AlertTriangle className="h-5 w-5 text-red-500" />
                         <div>
                            <p className="text-sm font-bold text-red-700">Failed Transactions Detected</p>
                            <p className="text-xs text-red-600/70">{stats.failed} transaction(s) were cancelled or failed the protocol.</p>
                         </div>
                      </div>
                      <Badge className="bg-red-500 text-white border-none font-black">{stats.failed}</Badge>
                   </div>
                 )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
