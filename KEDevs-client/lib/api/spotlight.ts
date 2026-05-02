import apiClient from '@/lib/apiClient';
import type { SpotlightSlot, SpotlightAvailability } from '@/lib/types/spotlight';

export async function getCurrentSpotlight(): Promise<SpotlightSlot[]> {
  const res = await apiClient.get<{ data: SpotlightSlot[] }>('/spotlight/current');
  return res.data.data;
}

export async function getSpotlightAvailability(): Promise<SpotlightAvailability> {
  const res = await apiClient.get<{ data: SpotlightAvailability }>('/spotlight/availability');
  return res.data.data;
}

export async function activateSpotlight(paymentId: string): Promise<SpotlightSlot> {
  const res = await apiClient.post<{ data: SpotlightSlot }>('/spotlight/activate', { paymentId });
  return res.data.data;
}

export async function getSpotlightHistory(): Promise<SpotlightSlot[]> {
  const res = await apiClient.get<{ data: SpotlightSlot[] }>('/spotlight/admin/history');
  return res.data.data;
}

export async function adminOverrideSpotlight(
  slotId: string,
  developerId: string
): Promise<SpotlightSlot> {
  const res = await apiClient.post<{ data: SpotlightSlot }>(
    `/spotlight/admin/override/${slotId}`,
    { developerId }
  );
  return res.data.data;
}
