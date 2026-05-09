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
  AlertCircle
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

export default function PaymentsPage() {
  const { user } = useAuth();
  const { getPrice } = usePlatformSettings();
  const isDev = user?.role === 'DEVELOPER';

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [spotlightStatus, setSpotlightStatus] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [historyRes, subRes] = await Promise.all([
          paymentService.getHistory(),
          paymentService.getSubscriptions(),
        ]);
        if (historyRes.success) setPaymentHistory(historyRes.data?.content || historyRes.data || []);
        if (subRes.success) setSubscriptions(subRes.data);

        if (isDev) {
          const slRes = await spotlightService.getMyStatus();
          if (slRes.success) setSpotlightStatus(slRes.data);
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

  return (
    <div className="container mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="mb-12 space-y-4">
         <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-3 py-1">
            FINANCIAL LEDGER
         </Badge>
         <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Payments & Billing</h1>
         <p className="text-slate-500 font-semibold italic">Monitor your ecosystem transactions and active service subscriptions</p>
      </div>

      {loading ? (
         <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing ledger...</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Status Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               {/* Verification Status */}
               <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardContent className="p-8 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <BadgeCheck className="h-5 w-5" />
                           </div>
                           <h3 className="font-black text-slate-900 tracking-tight">Verification</h3>
                        </div>
                        <Badge className={cn(
                           "rounded-lg font-black text-[9px] uppercase tracking-widest border-none",
                           user?.isVerified ? "bg-emerald-500" : "bg-slate-200 text-slate-400"
                        )}>
                           {user?.isVerified ? 'AUTHENTICATED' : 'UNVERIFIED'}
                        </Badge>
                     </div>
                     <Separator className="bg-slate-50" />
                     {!user?.isVerified && (
                        <Button asChild variant="outline" className="w-full h-12 rounded-xl font-black border-slate-100 hover:bg-slate-50 text-[10px] uppercase tracking-widest">
                           <Link href="/verify">Begin Verification Protocol</Link>
                        </Button>
                     )}
                  </CardContent>
               </Card>

               {/* Spotlight Status */}
               {isDev && (
                  <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
                     <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                 <Star className="h-5 w-5" />
                              </div>
                              <h3 className="font-black text-slate-900 tracking-tight">Spotlight</h3>
                           </div>
                           <Badge className={cn(
                              "rounded-lg font-black text-[9px] uppercase tracking-widest border-none",
                              spotlightStatus?.active ? "bg-amber-400" : "bg-slate-200 text-slate-400"
                           )}>
                              {spotlightStatus?.active ? 'LIVE_NOW' : 'INACTIVE'}
                           </Badge>
                        </div>

                        {spotlightStatus?.active && spotlightStatus?.endDate && (
                           <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 opacity-60">Temporal Remaining</p>
                              <p className="text-2xl font-black text-amber-700 tracking-tight">{formatTimeLeft(spotlightStatus.endDate)}</p>
                           </div>
                        )}

                        <Separator className="bg-slate-50" />
                        
                        {!spotlightStatus?.active && (
                           <div className="space-y-4">
                              <Button asChild className="w-full h-14 rounded-2xl font-black bg-slate-900 shadow-xl shadow-slate-900/10">
                                 <Link href="/profile/me?buySpotlight=true">Purchase Visibility Slot</Link>
                              </Button>
                              <Button 
                                 variant="ghost" 
                                 className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary gap-2"
                                 onClick={handleConfirmSpotlight}
                                 disabled={confirming}
                              >
                                 {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                 Sync Pending Payment
                              </Button>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               )}

               {/* Membership Subscription */}
               {subscriptions && (
                  <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
                     <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <ShieldCheck className="h-5 w-5" />
                           </div>
                           <h3 className="font-black text-slate-900 tracking-tight">Annual Membership</h3>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                           <Badge className={cn(
                              "rounded-lg font-black text-[9px] uppercase tracking-widest border-none",
                              subscriptions.annualMembershipActive ? "bg-indigo-500" : "bg-slate-200 text-slate-400"
                           )}>
                              {subscriptions.annualMembershipActive ? 'AUTHORIZED' : 'LOCKED'}
                           </Badge>
                        </div>
                        {subscriptions.membershipExpiresAt && (
                           <p className="text-[10px] font-bold text-slate-400 italic">Term expires {formatDate(subscriptions.membershipExpiresAt)}</p>
                        )}
                     </CardContent>
                  </Card>
               )}
            </div>

            {/* History Table */}
            <div className="lg:col-span-8">
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="p-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
                     <div className="space-y-1">
                        <CardTitle className="text-2xl font-black">Transaction Ledger</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived financial activity</CardDescription>
                     </div>
                     <History className="h-6 w-6 text-slate-200" />
                  </CardHeader>
                  <CardContent className="p-0">
                     {paymentHistory.length === 0 ? (
                        <div className="py-24 text-center space-y-6">
                           <Receipt className="h-16 w-16 text-slate-100 mx-auto" />
                           <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No transactions detected in current cycle</p>
                        </div>
                     ) : (
                        <Table>
                           <TableHeader className="bg-slate-50/50">
                              <TableRow className="border-slate-100">
                                 <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Timestamp</TableHead>
                                 <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Service Node</TableHead>
                                 <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10">Amount (KES)</TableHead>
                                 <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-10 text-right">Protocol Status</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {paymentHistory.map((row) => (
                                 <TableRow key={row.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="py-6 px-10">
                                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                          <Clock className="h-3.5 w-3.5 text-slate-300" /> {formatDate(row.paidAt || row.createdAt)}
                                       </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-10">
                                       <span className="font-black text-slate-900 text-sm tracking-tight">
                                          {row.type?.replace(/_/g, ' ').toUpperCase() || 'PLATFORM_SERVICE'}
                                       </span>
                                    </TableCell>
                                    <TableCell className="py-6 px-10">
                                       <span className="font-black text-primary text-sm">
                                          {Number(row.amount || 0).toLocaleString()}
                                       </span>
                                    </TableCell>
                                    <TableCell className="py-6 px-10 text-right">
                                       <Badge className={cn(
                                          "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5",
                                          row.status === 'COMPLETED' ? "bg-emerald-500" : row.status === 'PENDING' ? "bg-amber-500" : "bg-red-500"
                                       )}>
                                          {row.status}
                                       </Badge>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     )}
                     
                     <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All transactions are processed via secure encrypted channels</p>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      )}
    </div>
  );
}
