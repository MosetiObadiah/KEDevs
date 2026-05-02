// ── Enums ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentType =
  | 'ANNUAL_MEMBERSHIP'
  | 'PRO_UPGRADE'
  | 'VERIFIED_BADGE'
  | 'SEARCH_TOKEN'
  | 'SPOTLIGHT';
export type SubscriptionType = 'ANNUAL_MEMBERSHIP' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// ── Entities ──────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  mpesaReceiptNo?: string;
  phoneNumber?: string;
  checkoutRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  subscriptionType: SubscriptionType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchToken {
  id: string;
  userId: string;
  tokensRemaining: number;
  updatedAt: string;
}

export interface PlatformSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  updatedAt: string;
}

// ── Daraja / M-Pesa ───────────────────────────────────────────────────────

export interface StkPushRequest {
  phoneNumber: string;
  paymentType: PaymentType;
}

export interface StkPushResponse {
  checkoutRequestId: string;
  responseDescription: string;
}
