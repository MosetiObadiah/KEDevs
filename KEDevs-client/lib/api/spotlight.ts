import apiClient from '@/lib/apiClient';
import type { SpotlightSlot, SpotlightAvailability, CurrentSpotlightResponse } from '@/lib/types/spotlight';

export async function getCurrentSpotlight(): Promise<CurrentSpotlightResponse> {
  const res = await apiClient.get<CurrentSpotlightResponse>('/spotlight/current');
  return res.data;
}

export async function getSpotlightAvailability(): Promise<SpotlightAvailability> {
  const res = await apiClient.get<SpotlightAvailability>('/spotlight/availability');
  return res.data;
}

export async function getMySpotlightStatus(): Promise<SpotlightSlot | null> {
  const res = await apiClient.get<SpotlightSlot | null>('/spotlight/my-status');
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
