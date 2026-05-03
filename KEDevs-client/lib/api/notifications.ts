import apiClient from '@/lib/apiClient';
import type { Notification, NotificationPreference, UnreadCount } from '@/lib/types/notification';
import type { Page } from '@/lib/types/job';

export async function getNotifications(page = 0, size = 20): Promise<Page<Notification>> {
  const res = await apiClient.get<Page<Notification>>('/notifications', {
    params: { page, size },
  });
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<UnreadCount>('/notifications/unread-count');
  return res.data.count;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function getNotificationPreferencesAll(): Promise<NotificationPreference[]> {
  const res = await apiClient.get<NotificationPreference[]>('/notifications/preferences');
  return res.data;
}

export async function updateNotificationPreferences(prefs: Record<string, { inApp: boolean; email: boolean }>): Promise<void> {
  await apiClient.put('/notifications/preferences', prefs);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

// ── Preferences ───────────────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  const res = await apiClient.get<NotificationPreference[]>(
    '/notifications/preferences'
  );
  return res.data;
}

export async function updateNotificationPreference(
  category: string,
  data: { inApp?: boolean; email?: boolean }
): Promise<NotificationPreference> {
  const res = await apiClient.patch<NotificationPreference>(
    `/notifications/preferences/${category}`,
    data
  );
  return res.data;
}
