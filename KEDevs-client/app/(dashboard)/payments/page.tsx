'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as paymentApi from '@/lib/api/payments';
import { useAuth } from '@/lib/auth/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShieldCheck, Zap, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { PaymentModal } from '@/components/shared/payment-modal';
import type { PaymentType } from '@/lib/types/payment';

export default function PaymentsPage() {
  const { user } = useAuth();
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: PaymentType, title: string, amount: string, desc: string } | null>(null);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['payments', 'history'],
    queryFn: paymentApi.getPaymentHistory,
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['payments', 'subscriptions'],
    queryFn: paymentApi.getMySubscriptions,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['payments', 'settings'],
    queryFn: paymentApi.getPaymentSettings,
  });

  if (historyLoading || subsLoading || settingsLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handlePay = (type: PaymentType, title: string, amount: string, desc: string) => {
    setModalConfig({ type, title, amount, desc });
    setPaymentModalOpen(true);
  };

  const getPrice = (key: string) => {
    const setting = settings?.find(s => s.settingKey === key);
    return setting ? `KES ${setting.settingValue}` : 'KES 0';
  };

  const activeSub = subscriptions?.find(s => s.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Payments & Subscriptions</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your membership, upgrades, and billing history</p>
      </div>

      {/* Current Plan Section */}
      <Card className="border-primary bg-primary/5 rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeSub ? activeSub.subscriptionType.replace('_', ' ') : 'Basic Account'}
              </h2>
              {activeSub ? (
                <p className="text-muted-foreground mt-1">
                  Valid until <span className="font-bold text-foreground">{new Date(activeSub.endDate).toLocaleDateString()}</span>
                </p>
              ) : (
                <p className="text-muted-foreground mt-1">You are currently on a limited basic account.</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {!activeSub && (
              <Button 
                onClick={() => handlePay('ANNUAL_MEMBERSHIP', 'Annual Membership', getPrice('PRICE_ANNUAL_MEMBERSHIP'), 'Upgrade to full platform access for 1 year')}
                className="bg-primary hover:bg-[#2a6f4d] text-white font-bold h-12 px-6 rounded-xl"
              >
                Buy Membership
              </Button>
            )}
            {user?.role === 'EMPLOYER' && (!activeSub || activeSub.subscriptionType !== 'PRO') && (
              <Button 
                onClick={() => handlePay('PRO_UPGRADE', 'PRO Upgrade', getPrice('PRICE_PRO_UPGRADE'), 'Upgrade to PRO for unlimited access and priority')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-6 rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" /> Upgrade to PRO
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Verification Badge */}
        {!user?.isApprovedByAdmin && ( // Using isApprovedByAdmin as proxy or we can just show it
          <Card className="border-secondary rounded-3xl shadow-sm hover:border-primary transition-colors flex flex-col">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Verified Badge</CardTitle>
              <CardDescription>Stand out with a blue verified checkmark on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-2xl font-black text-foreground mb-4">{getPrice('PRICE_VERIFIED_BADGE')}<span className="text-sm font-medium text-muted-foreground"> / lifetime</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Increased trust</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Priority in search</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full font-bold border-secondary hover:border-primary hover:bg-primary/5 h-12"
                onClick={() => handlePay('VERIFIED_BADGE', 'Verified Badge', getPrice('PRICE_VERIFIED_BADGE'), 'Lifetime verified badge')}
              >
                Get Verified
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Search Tokens */}
        <Card className="border-secondary rounded-3xl shadow-sm hover:border-primary transition-colors flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Search Tokens</CardTitle>
            <CardDescription>Buy extra tokens to perform deep developer searches.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-2xl font-black text-foreground mb-4">{getPrice('PRICE_SEARCH_TOKEN')}<span className="text-sm font-medium text-muted-foreground"> / token</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Advanced filtering</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Save more searches</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full font-bold border-secondary hover:border-primary hover:bg-primary/5 h-12"
              onClick={() => handlePay('SEARCH_TOKEN', 'Buy Search Token', getPrice('PRICE_SEARCH_TOKEN'), '1 Search Token')}
            >
              Buy Token
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-secondary rounded-3xl shadow-sm mt-12">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past transactions and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!history || history.length === 0) ? (
            <div className="py-12 text-center border-2 border-dashed border-secondary/50 rounded-2xl bg-secondary/5">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-bold">No payments yet</p>
              <p className="text-sm text-muted-foreground mt-1">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Receipt No.</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/50">
                  {history.map((payment) => (
                    <tr key={payment.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="p-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{payment.paymentType.replace('_', ' ')}</td>
                      <td className="p-4 font-bold text-foreground">{payment.currency} {payment.amount}</td>
                      <td className="p-4 text-sm text-muted-foreground font-mono">{payment.mpesaReceiptNo || '-'}</td>
                      <td className="p-4">
                        <Badge className={`
                          ${payment.status === 'COMPLETED' ? 'bg-primary/20 text-primary border-primary/30' : 
                            payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                            'bg-red-100 text-red-700 border-red-200'}
                          px-2 py-0.5 rounded-md font-bold text-[10px] tracking-widest border uppercase
                        `}>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalConfig && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          paymentType={modalConfig.type}
          title={modalConfig.title}
          description={modalConfig.desc}
          amount={modalConfig.amount}
          onSuccess={() => { /* invalidate history after some time or immediately */ }}
        />
      )}
    </div>
  );
}
