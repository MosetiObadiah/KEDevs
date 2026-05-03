'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as spotlightApi from '@/lib/api/spotlight';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Zap, Clock, TrendingUp } from 'lucide-react';
import { PaymentModal } from '@/components/shared/payment-modal';

export default function SpotlightPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const { data: currentSpotlight, isLoading: currentLoading } = useQuery({
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

  const activeSlot = currentSpotlight?.[0]; // Assuming one active spotlight at a time

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Developer Spotlight</h1>
          <p className="text-muted-foreground mt-1 font-medium">Get featured on the homepage and boost your visibility</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Status Card */}
        <Card className="rounded-3xl border-secondary shadow-sm relative overflow-hidden h-full">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>See who is currently featured.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSlot ? (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                  <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{activeSlot.developerName}</h3>
                <p className="text-sm text-muted-foreground mt-1">is currently in the spotlight</p>
                <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                  <div className="flex items-center justify-between text-sm bg-secondary/10 px-4 py-2 rounded-lg">
                    <span className="text-muted-foreground"><Clock className="w-4 h-4 inline mr-1" /> Ends</span>
                    <span className="font-bold">{new Date(activeSlot.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Star className="w-16 h-16 text-amber-200 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Spotlight is open</h3>
                <p className="text-sm text-muted-foreground mt-1">No one is currently featured.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Card */}
        <Card className="rounded-3xl border-amber-200 bg-amber-50 shadow-sm relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl -mr-24 -mt-24" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Buy Spotlight
            </CardTitle>
            <CardDescription className="text-amber-800/70">Secure your spot at the top of KEDevs-Connect.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex-1 flex flex-col justify-between">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">1</div>
                <p className="text-sm text-amber-900 font-medium">Appear on the homepage</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">2</div>
                <p className="text-sm text-amber-900 font-medium"><TrendingUp className="w-4 h-4 inline mr-1"/> ~5x more profile views</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">3</div>
                <p className="text-sm text-amber-900 font-medium">Stand out to top employers</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-amber-200 text-center">
              {availability?.available ? (
                <>
                  <p className="text-sm text-amber-700 font-bold mb-3 uppercase tracking-wider">Spotlight is Available</p>
                  <Button 
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 shadow-lg shadow-amber-500/20"
                  >
                    Buy 24H Spotlight
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-amber-700 font-bold mb-3 uppercase tracking-wider">Currently Occupied</p>
                  <Button 
                    disabled
                    className="w-full bg-secondary text-muted-foreground font-bold h-12"
                  >
                    Check back later
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        paymentType="SPOTLIGHT"
        title="Purchase Spotlight"
        description="Feature your profile on the homepage for 24 hours."
      />
    </div>
  );
}
