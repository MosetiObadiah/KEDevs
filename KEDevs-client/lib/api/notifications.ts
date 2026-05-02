import apiClient from '@/lib/apiClient';
import type { Notification, NotificationPreference, UnreadCount } from '@/lib/types/notification';
import type { Page } from '@/lib/types/job';

export async function getNotifications(page = 0, size = 20): Promise<Page<Notification>> {
  const res = await apiClient.get<{ data: Page<Notification> }>('/notifications', {
    params: { page, size },
  });
  return res.data.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ data: UnreadCount }>('/notifications/unread-count');
  return res.data.data.count;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

// ── Preferences ───────────────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  const res = await apiClient.get<{ data: NotificationPreference[] }>(
    '/notifications/preferences'
  );
  return res.data.data;
}

export async function updateNotificationPreference(
  category: string,
  data: { inApp?: boolean; email?: boolean }
): Promise<NotificationPreference> {
  const res = await apiClient.patch<{ data: NotificationPreference }>(
    `/notifications/preferences/${category}`,
    data
  );
  return res.data.data;
}
