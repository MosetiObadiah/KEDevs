import apiClient from '@/lib/apiClient';
import type { SpotlightSlot, SpotlightAvailability } from '@/lib/types/spotlight';

export async function getCurrentSpotlight(): Promise<SpotlightSlot[]> {
  const res = await apiClient.get<SpotlightSlot[]>('/spotlight/current');
  return res.data;
}

export async function getSpotlightAvailability(): Promise<SpotlightAvailability> {
  const res = await apiClient.get<SpotlightAvailability>('/spotlight/availability');
  return res.data;
}

export async function activateSpotlight(paymentId: string): Promise<SpotlightSlot> {
  const res = await apiClient.post<SpotlightSlot>('/spotlight/activate', { paymentId });
  return res.data;
}

export async function getSpotlightHistory(): Promise<SpotlightSlot[]> {
  const res = await apiClient.get<SpotlightSlot[]>('/spotlight/admin/history');
  return res.data;
}

export async function adminOverrideSpotlight(
  slotId: string,
  developerId: string
): Promise<SpotlightSlot> {
  const res = await apiClient.post<SpotlightSlot>(
    `/spotlight/admin/override/${slotId}`,
    { developerId }
  );
  return res.data;
}
