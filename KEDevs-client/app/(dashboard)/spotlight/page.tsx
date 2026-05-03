'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as spotlightApi from '@/lib/api/spotlight';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Zap, Clock, TrendingUp, Calendar } from 'lucide-react';
import { PaymentModal } from '@/components/shared/payment-modal';
import type { SpotlightType } from '@/lib/types/spotlight';
import type { PaymentType } from '@/lib/types/payment';

export default function SpotlightPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSpotlight, setSelectedSpotlight] = useState<{
    type: SpotlightType;
    paymentType: PaymentType;
    title: string;
    price: number;
  } | null>(null);

  const { data: spotlightData, isLoading: currentLoading } = useQuery({
    queryKey: ['spotlight', 'current'],
    queryFn: spotlightApi.getCurrentSpotlight,
  });

  const { data: availability, isLoading: availLoading } = useQuery({
    queryKey: ['spotlight', 'availability'],
    queryFn: spotlightApi.getSpotlightAvailability,
  });

  if (currentLoading || availLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleBuy = (type: 'DAY' | 'WEEK') => {
    setSelectedSpotlight({
      type,
      paymentType: type === 'DAY' ? 'SPOTLIGHT_DAY' : 'SPOTLIGHT_WEEK',
      title: `${type === 'DAY' ? 'Daily' : 'Weekly'} Spotlight`,
      price: type === 'DAY' ? (availability?.dayPriceKes ?? 50) : (availability?.weekPriceKes ?? 250),
    });
    setPaymentModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Developer Spotlight</h1>
          <p className="text-muted-foreground mt-1 font-medium">Get featured on the homepage and boost your visibility in the ecosystem.</p>
        </div>
      </div>

      {/* Current Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusCard 
          title="Daily Spotlight" 
          slot={spotlightData?.daySlot} 
          icon={<Zap className="w-5 h-5" />} 
          description="Refreshes every 24 hours"
          expiresAt={availability?.daySlotExpiresAt}
        />
        <StatusCard 
          title="Weekly Spotlight" 
          slot={spotlightData?.weekSlot} 
          icon={<Calendar className="w-5 h-5" />} 
          description="Top featured dev of the week"
          expiresAt={availability?.weekSlotExpiresAt}
        />
      </div>

      <hr className="border-secondary/30" />

      {/* Purchase Options */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Purchase a Slot</h2>
          <p className="text-sm text-muted-foreground">Secure your spot at the top of KEDevs-Connect.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PurchaseCard 
            title="Daily Spotlight"
            type="DAY"
            price={availability?.dayPriceKes ?? 50}
            isAvailable={availability?.daySlotAvailable ?? false}
            nextDate={availability?.daySlotExpiresAt}
            onBuy={() => handleBuy('DAY')}
            features={[
              "Appear on homepage for 24h",
              "~5x more profile views",
              "Stand out to employers"
            ]}
          />
          <PurchaseCard 
            title="Weekly Spotlight"
            type="WEEK"
            price={availability?.weekPriceKes ?? 250}
            isAvailable={availability?.weekSlotAvailable ?? false}
            nextDate={availability?.weekSlotExpiresAt}
            onBuy={() => handleBuy('WEEK')}
            features={[
              "Appear on homepage for 7 days",
              "Maximum visibility & impact",
              "Featured in weekly newsletter",
              "Premium 'Hall of Fame' badge"
            ]}
          />
        </div>
      </div>

      {selectedSpotlight && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          paymentType={selectedSpotlight.paymentType}
          title={selectedSpotlight.title}
          description={`Secure your spotlight feature. Amount: KES ${selectedSpotlight.price}`}
          amount={`KES ${selectedSpotlight.price}`}
        />
      )}
    </div>
  );
}

function StatusCard({ title, slot, icon, description, expiresAt }: { title: string, slot?: any, icon: React.ReactNode, description: string, expiresAt?: string }) {
  return (
    <Card className="rounded-3xl border-secondary shadow-sm relative overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-amber-500 mb-1">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <CardTitle className="text-lg">Current Resident</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {slot ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{slot.developerName}</h3>
              <p className="text-sm text-muted-foreground truncate">{slot.currentLastRole || 'Developer'}</p>
              {expiresAt && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 self-start px-2 py-0.5 rounded-full w-fit">
                  <Clock className="w-3 h-3" />
                  ENDS {new Date(expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 border-2 border-dashed border-secondary/20 rounded-2xl">
            <Star className="w-10 h-10 text-secondary/30 mb-2" />
            <p className="text-sm font-bold text-foreground/60">Slot is currently open</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to claim it!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PurchaseCard({ title, type, price, isAvailable, nextDate, onBuy, features }: any) {
  return (
    <Card className={`rounded-[32px] overflow-hidden flex flex-col h-full border-2 transition-all ${
      isAvailable ? 'border-amber-200 bg-amber-50/30' : 'border-secondary/20 bg-secondary/5'
    }`}>
      <CardHeader className="relative">
        {isAvailable && (
          <Badge className="absolute top-6 right-6 bg-amber-500 text-white border-0">AVAILABLE</Badge>
        )}
        <CardTitle className="text-2xl font-black">{title}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-black text-foreground">KES {price}</span>
          <span className="text-sm text-muted-foreground ml-2">/ {type === 'DAY' ? '24h' : '7 days'}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        <ul className="space-y-3">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <TrendingUp className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
              <span className="text-foreground/80 font-medium">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          {isAvailable ? (
            <Button 
              onClick={onBuy}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-amber-500/20"
            >
              Get Spotlight
            </Button>
          ) : (
            <div className="space-y-3">
              <Button disabled className="w-full bg-secondary/40 text-muted-foreground font-bold h-14 rounded-2xl">
                Currently Occupied
              </Button>
              {nextDate && (
                <p className="text-center text-xs text-muted-foreground font-medium">
                  Next opening: <span className="text-foreground">{new Date(nextDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
