import apiClient from '@/lib/apiClient';
import type {
  EmployerProfile,
  BookmarkedDeveloper,
  ContactRequest,
  SavedDeveloperSearch,
} from '@/lib/types/user';

// ── My employer profile ───────────────────────────────────────────────────

export async function getMyEmployerProfile(): Promise<EmployerProfile> {
  const res = await apiClient.get<{ data: EmployerProfile }>('/employers/me');
  return res.data.data;
}

export async function createEmployerProfile(
  data: Partial<EmployerProfile>
): Promise<EmployerProfile> {
  const res = await apiClient.post<{ data: EmployerProfile }>('/employers/profile', data);
  return res.data.data;
}

export async function updateEmployerProfile(
  data: Partial<EmployerProfile>
): Promise<EmployerProfile> {
  const res = await apiClient.put<{ data: EmployerProfile }>('/employers/profile', data);
  return res.data.data;
}

// ── Bookmarks ─────────────────────────────────────────────────────────────

export async function getBookmarkedDevelopers(): Promise<BookmarkedDeveloper[]> {
  const res = await apiClient.get<{ data: BookmarkedDeveloper[] }>('/employers/bookmarks');
  return res.data.data;
}

export async function bookmarkDeveloper(developerId: string): Promise<void> {
  await apiClient.post(`/employers/bookmarks/${developerId}`);
}

export async function removeBookmark(developerId: string): Promise<void> {
  await apiClient.delete(`/employers/bookmarks/${developerId}`);
}

// ── Contact requests ──────────────────────────────────────────────────────

export async function sendContactRequest(
  developerId: string,
  message?: string
): Promise<ContactRequest> {
  const res = await apiClient.post<{ data: ContactRequest }>(
    `/employers/contact-requests/${developerId}`,
    { message }
  );
  return res.data.data;
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  const res = await apiClient.get<{ data: ContactRequest[] }>('/employers/contact-requests');
  return res.data.data;
}

export async function respondToContactRequest(
  requestId: string,
  status: 'ACCEPTED' | 'DECLINED'
): Promise<ContactRequest> {
  const res = await apiClient.patch<{ data: ContactRequest }>(
    `/employers/contact-requests/${requestId}`,
    { status }
  );
  return res.data.data;
}

// ── Saved searches ────────────────────────────────────────────────────────

export async function getSavedSearches(): Promise<SavedDeveloperSearch[]> {
  const res = await apiClient.get<{ data: SavedDeveloperSearch[] }>('/employers/saved-searches');
  return res.data.data;
}

export async function saveSearch(
  name: string,
  filterCriteria: Record<string, unknown>
): Promise<SavedDeveloperSearch> {
  const res = await apiClient.post<{ data: SavedDeveloperSearch }>('/employers/saved-searches', {
    name,
    filterCriteria,
  });
  return res.data.data;
}

export async function deleteSavedSearch(searchId: string): Promise<void> {
  await apiClient.delete(`/employers/saved-searches/${searchId}`);
}
