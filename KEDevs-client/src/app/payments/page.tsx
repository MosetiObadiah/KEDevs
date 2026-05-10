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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { paymentService } from '@/services/paymentService';
import { spotlightService } from '@/services/spotlightService';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

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
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 space-y-6 md:space-y-0 print:hidden">
           <div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">Financial Ledger</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Payments & <span className="text-primary">Billing</span>
              </h1>
              <p className="text-muted-foreground">Monitor your ecosystem transactions and active service subscriptions.</p>
           </div>
           
           <div className="flex flex-wrap gap-3">
              {!user?.isVerified && (
                <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-11" asChild>
                   <Link href="/verify">
                      <BadgeCheck className="mr-2 h-4 w-4 text-primary" /> Begin Verification
                   </Link>
                </Button>
              )}
              {isDev && !spotlightStatus?.active && (
                <Button className="font-bold h-11 shadow-lg shadow-primary/20" asChild>
                   <Link href="/profile/me?buySpotlight=true">
                      <Star className="mr-2 h-4 w-4 fill-white" /> Purchase Spotlight
                   </Link>
                </Button>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Status Cards */}
          <aside className="lg:col-span-4 space-y-8 print:hidden">
            {/* Verification Status */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity Protocol</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      user?.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Verification</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2",
                    user?.isVerified ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {user?.isVerified ? 'VERIFIED' : 'PENDING'}
                  </Badge>
                </div>
                
                {!user?.isVerified && (
                  <Button asChild variant="outline" className="w-full font-bold h-10 text-xs border-border/50">
                    <Link href="/verify">Execute Verification <ArrowRight className="ml-2 h-3 w-3" /></Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Spotlight Status */}
            {isDev && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visibility Status</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        spotlightStatus?.active ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"
                      )}>
                        <Star className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Spotlight Slot</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profile Rank</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2",
                      spotlightStatus?.active ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {spotlightStatus?.active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>

                  {spotlightStatus?.active && spotlightStatus?.endDate && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-1">Time Remaining</p>
                       <p className="text-lg font-bold text-amber-700 tracking-tight">{formatTimeLeft(spotlightStatus.endDate)}</p>
                    </div>
                  )}

                  {!spotlightStatus?.active && (
                    <div className="space-y-2">
                       <Button asChild className="w-full font-bold h-11 shadow-sm">
                          <Link href="/profile/me?buySpotlight=true">Purchase Spotlight</Link>
                       </Button>
                       <Button 
                          variant="ghost" 
                          className="w-full font-bold text-xs text-primary h-10"
                          onClick={handleConfirmSpotlight}
                          disabled={confirming}
                       >
                          {confirming ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                          Confirm Pending Payment
                       </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Membership Status */}
            {subscriptions && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Membership Plan</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        subscriptions.annualMembershipActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Annual License</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ecosystem Access</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2",
                      subscriptions.annualMembershipActive ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {subscriptions.annualMembershipActive ? 'ACTIVE' : 'EXPIRED'}
                    </Badge>
                  </div>
                  {subscriptions.membershipExpiresAt && (
                    <p className="text-[10px] font-bold text-muted-foreground text-center">Expires on {formatDate(subscriptions.membershipExpiresAt)}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content - Transaction Ledger */}
          <main className="lg:col-span-8">
            <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-border/50 bg-muted/10 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Transaction Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Historical record of all platform activity.</CardDescription>
                </div>
                <History className="h-5 w-5 text-muted-foreground/30" />
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
                                {row.type?.replace(/_/g, ' ').toUpperCase() || 'PLATFORM_SERVICE'}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <span className="font-bold text-primary text-sm">
                                {Number(row.amount || 0).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-right">
                              <Badge className={cn(
                                "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5",
                                row.status === 'COMPLETED' ? "bg-emerald-500 text-white" : row.status === 'PENDING' ? "bg-amber-500 text-white" : "bg-destructive text-white"
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
          </main>
        </div>
      </div>
    </div>
  );
}
