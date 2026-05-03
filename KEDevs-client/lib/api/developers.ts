import apiClient from '@/lib/apiClient';
import type {
  DeveloperProfile,
  DeveloperSkill,
  DeveloperLanguage,
  DeveloperEducation,
  DeveloperCertification,
  DeveloperOssContribution,
  DeveloperAchievement,
  DeveloperProject,
  Endorsement,
} from '@/lib/types/user';
import type { Page } from '@/lib/types/job';

export interface DeveloperFilters {
  keyword?: string;
  skill?: string;
  availability?: string;
  yearsOfExperience?: string;
  locationCountry?: string;
  language?: string;
  isVerified?: boolean;
  preferredWorkType?: string;
  currentLastRole?: string;
  page?: number;
  size?: number;
}

// ── Public listing ────────────────────────────────────────────────────────

export async function getPublicDevelopers(filters: DeveloperFilters = {}): Promise<Page<DeveloperProfile>> {
  const res = await apiClient.get<Page<DeveloperProfile>>('/developers/public', { params: filters });
  return res.data;
}

export async function getDeveloper(id: string): Promise<DeveloperProfile> {
  const res = await apiClient.get<DeveloperProfile>(`/developers/${id}`);
  return res.data;
}

export async function filterDevelopers(criteria: DeveloperFilters): Promise<Page<DeveloperProfile>> {
  const res = await apiClient.post<Page<DeveloperProfile>>('/developers/filter', criteria);
  return res.data;
}

// ── My profile ────────────────────────────────────────────────────────────

export async function getMyDeveloperProfile(): Promise<DeveloperProfile> {
  const res = await apiClient.get<DeveloperProfile>('/developers/profile/me');
  return res.data;
}

export async function createDeveloperProfile(data: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
  const res = await apiClient.post<DeveloperProfile>('/developers/profile', data);
  return res.data;
}

export async function updateDeveloperProfile(data: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
  const res = await apiClient.put<DeveloperProfile>('/developers/profile', data);
  return res.data;
}

export async function updateAvailability(status: string): Promise<void> {
  await apiClient.patch('/developers/profile/availability', { availabilityStatus: status });
}

export async function updateVisibility(visibility: string): Promise<void> {
  await apiClient.patch('/developers/profile/visibility', { profileVisibility: visibility });
}

// ── Skills ────────────────────────────────────────────────────────────────

export async function addSkill(skill: string): Promise<DeveloperSkill> {
  const res = await apiClient.post<DeveloperSkill>('/developers/profile/skills', { skill });
  return res.data;
}

export async function deleteSkill(skill: string): Promise<void> {
  await apiClient.delete(`/developers/profile/skills/${skill}`);
}

// ── Languages ─────────────────────────────────────────────────────────────

export async function addLanguage(language: string): Promise<DeveloperLanguage> {
  const res = await apiClient.post<DeveloperLanguage>('/developers/profile/languages', { language });
  return res.data;
}

export async function deleteLanguage(language: string): Promise<void> {
  await apiClient.delete(`/developers/profile/languages/${language}`);
}

// ── Education ─────────────────────────────────────────────────────────────

export async function addEducation(data: Partial<DeveloperEducation>): Promise<DeveloperEducation> {
  const res = await apiClient.post<DeveloperEducation>('/developers/profile/education', data);
  return res.data;
}

export async function deleteEducation(id: string): Promise<void> {
  await apiClient.delete(`/developers/profile/education/${id}`);
}

// ── Certifications ────────────────────────────────────────────────────────

export async function addCertification(data: Partial<DeveloperCertification>): Promise<DeveloperCertification> {
  const res = await apiClient.post<DeveloperCertification>('/developers/profile/certifications', data);
  return res.data;
}

export async function deleteCertification(id: string): Promise<void> {
  await apiClient.delete(`/developers/profile/certifications/${id}`);
}

// ── OSS Contributions ─────────────────────────────────────────────────────

export async function addOssContribution(data: Partial<DeveloperOssContribution>): Promise<DeveloperOssContribution> {
  const res = await apiClient.post<DeveloperOssContribution>('/developers/profile/oss', data);
  return res.data;
}

export async function deleteOssContribution(id: string): Promise<void> {
  await apiClient.delete(`/developers/profile/oss/${id}`);
}

// ── Achievements ──────────────────────────────────────────────────────────

export async function addAchievement(data: Partial<DeveloperAchievement>): Promise<DeveloperAchievement> {
  const res = await apiClient.post<DeveloperAchievement>('/developers/profile/achievements', data);
  return res.data;
}

export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(`/developers/profile/achievements/${id}`);
}

// ── Projects ──────────────────────────────────────────────────────────────

export async function addProject(data: Partial<DeveloperProject>): Promise<DeveloperProject> {
  const res = await apiClient.post<DeveloperProject>('/developers/profile/projects', data);
  return res.data;
}

export async function updateProject(id: string, data: Partial<DeveloperProject>): Promise<DeveloperProject> {
  const res = await apiClient.put<DeveloperProject>(`/developers/profile/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/developers/profile/projects/${id}`);
}

export async function toggleProjectFeatured(id: string): Promise<void> {
  await apiClient.patch(`/developers/profile/projects/${id}/featured`);
}

// ── Endorsements ──────────────────────────────────────────────────────────

export async function endorseDeveloper(profileId: string, endorsementText: string): Promise<Endorsement> {
  const res = await apiClient.post<Endorsement>(
    `/developers/${profileId}/endorsements`,
    { endorsementText }
  );
  return res.data;
}
