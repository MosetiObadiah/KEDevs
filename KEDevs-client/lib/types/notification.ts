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
  id: string;
  userId: string;
  category: NotificationCategory;
  inApp: boolean;
  email: boolean;
}

export interface UnreadCount {
  count: number;
}
