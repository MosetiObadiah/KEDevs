export type NotificationCategory =
  | 'JOB_APPLICATION'
  | 'JOB_STATUS'
  | 'CONTACT_REQUEST'
  | 'ENDORSEMENT'
  | 'SPOTLIGHT'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'ADMIN';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreference {
  emailOnPaymentReceipt: boolean;
  emailOnJobApplication: boolean;
  emailOnJobFlagged: boolean;
  emailOnSubscriptionExpiry: boolean;
  emailOnSpotlightExpired: boolean;
  emailOnSpotlightOverridden: boolean;
  emailOnVerifiedBadge: boolean;
  emailOnProUpgrade: boolean;
  inAppOnJobApplication: boolean;
  inAppOnCommentReply: boolean;
  inAppOnEndorsement: boolean;
  inAppOnFlagReviewed: boolean;
  inAppOnSpotlightExpired: boolean;
}

export interface UnreadCount {
  count: number;
}
