import apiClient from '@/lib/apiClient';
import type { Payment, Subscription, PlatformSetting, StkPushResponse } from '@/lib/types/payment';

// ── Payment initiation (M-Pesa STK push) ─────────────────────────────────

export async function payAnnualMembership(phoneNumber: string): Promise<StkPushResponse> {
  const res = await apiClient.post<StkPushResponse>('/payments/annual-membership', { phoneNumber });
  return res.data;
}

export async function payProUpgrade(phoneNumber: string): Promise<StkPushResponse> {
  const res = await apiClient.post<StkPushResponse>('/payments/pro-upgrade', { phoneNumber });
  return res.data;
}

export async function payVerifiedBadge(phoneNumber: string): Promise<StkPushResponse> {
  const res = await apiClient.post<StkPushResponse>('/payments/verified-badge', { phoneNumber });
  return res.data;
}

export async function paySpotlight(type: 'DAY' | 'WEEK', phoneNumber: string): Promise<StkPushResponse> {
  const res = await apiClient.post<StkPushResponse>('/payments/spotlight', { spotlightType: type, phoneNumber });
  return res.data;
}

export async function buySearchToken(phoneNumber: string): Promise<StkPushResponse> {
  const res = await apiClient.post<StkPushResponse>('/payments/search-token', { phoneNumber });
  return res.data;
}

export async function initiatePayment(req: { phoneNumber: string; paymentType: string; amount?: number }): Promise<StkPushResponse> {
  const { phoneNumber, paymentType } = req;
  if (paymentType === 'ANNUAL_MEMBERSHIP') return payAnnualMembership(phoneNumber);
  if (paymentType === 'PRO_UPGRADE') return payProUpgrade(phoneNumber);
  if (paymentType === 'VERIFIED_BADGE') return payVerifiedBadge(phoneNumber);
  if (paymentType === 'SEARCH_TOKEN') return buySearchToken(phoneNumber);
  if (paymentType === 'SPOTLIGHT_DAY') return paySpotlight('DAY', phoneNumber);
  if (paymentType === 'SPOTLIGHT_WEEK') return paySpotlight('WEEK', phoneNumber);
  // Fallback for old generic SPOTLIGHT type
  if (paymentType === 'SPOTLIGHT') return paySpotlight('DAY', phoneNumber);
  
  throw new Error('Unsupported payment type: ' + paymentType);
}

// ── Payment history ───────────────────────────────────────────────────────

export async function getPaymentHistory(): Promise<Payment[]> {
  const res = await apiClient.get<any>('/payments/history');
  // Backend returns a Page object, extract the content array
  return res.data?.content || [];
}

// ── Subscriptions ─────────────────────────────────────────────────────────

export async function getMySubscriptions(): Promise<Subscription[]> {
  const res = await apiClient.get<any>('/payments/subscriptions');
  const status = res.data;
  
  // Transform SubscriptionStatusResponse into array of Subscription objects
  const subscriptions: Subscription[] = [];
  
  if (status.hasAnnualMembership) {
    subscriptions.push({
      subscriptionType: 'ANNUAL_MEMBERSHIP',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(status.membershipExpiresAt)
    } as any);
  }
  
  if (status.isProAccount) {
    subscriptions.push({
      subscriptionType: 'PRO',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(status.proExpiresAt)
    } as any);
  }
  
  return subscriptions;
}

// ── Platform settings (public) ────────────────────────────────────────────

export async function getPaymentSettings(): Promise<PlatformSetting[]> {
  const res = await apiClient.get<PlatformSetting[]>('/payments/settings');
  return res.data;
}
