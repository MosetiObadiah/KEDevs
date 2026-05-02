import apiClient from '@/lib/apiClient';
import type { Payment, Subscription, SearchToken, PlatformSetting, StkPushRequest, StkPushResponse } from '@/lib/types/payment';

// ── M-Pesa STK Push ───────────────────────────────────────────────────────

export async function initiatePayment(data: StkPushRequest): Promise<StkPushResponse> {
  const res = await apiClient.post<{ data: StkPushResponse }>('/payments/initiate', data);
  return res.data.data;
}

export async function getPaymentStatus(checkoutRequestId: string): Promise<Payment> {
  const res = await apiClient.get<{ data: Payment }>(
    `/payments/status/${checkoutRequestId}`
  );
  return res.data.data;
}

// ── Payment history ───────────────────────────────────────────────────────

export async function getPaymentHistory(): Promise<Payment[]> {
  const res = await apiClient.get<{ data: Payment[] }>('/payments/history');
  return res.data.data;
}

// ── Subscriptions ─────────────────────────────────────────────────────────

export async function getMySubscription(): Promise<Subscription | null> {
  const res = await apiClient.get<{ data: Subscription | null }>('/payments/subscription');
  return res.data.data;
}

// ── Search tokens ─────────────────────────────────────────────────────────

export async function getMySearchTokens(): Promise<SearchToken> {
  const res = await apiClient.get<{ data: SearchToken }>('/payments/search-tokens');
  return res.data.data;
}

// ── Platform settings (public) ────────────────────────────────────────────

export async function getPlatformSettings(): Promise<PlatformSetting[]> {
  const res = await apiClient.get<{ data: PlatformSetting[] }>('/payments/settings');
  return res.data.data;
}
