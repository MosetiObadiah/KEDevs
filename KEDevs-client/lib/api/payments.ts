import apiClient from '@/lib/apiClient';
import type { Payment, Subscription, PlatformSetting } from '@/lib/types/payment';

// ── Payment initiation (M-Pesa STK push) ─────────────────────────────────

export async function payAnnualMembership(phoneNumber: string): Promise<void> {
  await apiClient.post('/payments/annual-membership', { phoneNumber });
}

export async function payProUpgrade(phoneNumber: string): Promise<void> {
  await apiClient.post('/payments/pro-upgrade', { phoneNumber });
}

export async function payVerifiedBadge(phoneNumber: string): Promise<void> {
  await apiClient.post('/payments/verified-badge', { phoneNumber });
}

export async function paySpotlight(type: 'DAY' | 'WEEK', phoneNumber: string): Promise<void> {
  await apiClient.post('/payments/spotlight', { type, phoneNumber });
}

export async function buySearchToken(phoneNumber: string): Promise<void> {
  await apiClient.post('/payments/search-token', { phoneNumber });
}

export async function initiatePayment(req: { phoneNumber: string; paymentType: string; amount?: number }): Promise<any> {
  const { phoneNumber, paymentType } = req;
  if (paymentType === 'ANNUAL_MEMBERSHIP') return payAnnualMembership(phoneNumber);
  if (paymentType === 'PRO_UPGRADE') return payProUpgrade(phoneNumber);
  if (paymentType === 'VERIFIED_BADGE') return payVerifiedBadge(phoneNumber);
  if (paymentType === 'SEARCH_TOKEN') return buySearchToken(phoneNumber);
  if (paymentType === 'SPOTLIGHT') return paySpotlight('DAY', phoneNumber); // Default to DAY for generic call
  throw new Error('Unsupported payment type');
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
