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
  page?: number;
  size?: number;
}

// ── Public listing ────────────────────────────────────────────────────────

export async function getDevelopers(filters: DeveloperFilters = {}): Promise<Page<DeveloperProfile>> {
  const res = await apiClient.get<{ data: Page<DeveloperProfile> }>('/developers/public', {
    params: filters,
  });
  return res.data.data;
}

export async function getDeveloper(id: string): Promise<DeveloperProfile> {
  const res = await apiClient.get<{ data: DeveloperProfile }>(`/developers/${id}`);
  return res.data.data;
}

// ── My profile ────────────────────────────────────────────────────────────

export async function getMyDeveloperProfile(): Promise<DeveloperProfile> {
  const res = await apiClient.get<{ data: DeveloperProfile }>('/developers/me');
  return res.data.data;
}

export async function createDeveloperProfile(
  data: Partial<DeveloperProfile>
): Promise<DeveloperProfile> {
  const res = await apiClient.post<{ data: DeveloperProfile }>('/developers/profile', data);
  return res.data.data;
}

export async function updateDeveloperProfile(
  data: Partial<DeveloperProfile>
): Promise<DeveloperProfile> {
  const res = await apiClient.put<{ data: DeveloperProfile }>('/developers/profile', data);
  return res.data.data;
}

// ── Skills ────────────────────────────────────────────────────────────────

export async function addSkill(data: Partial<DeveloperSkill>): Promise<DeveloperSkill> {
  const res = await apiClient.post<{ data: DeveloperSkill }>('/developers/skills', data);
  return res.data.data;
}

export async function deleteSkill(skillId: string): Promise<void> {
  await apiClient.delete(`/developers/skills/${skillId}`);
}

// ── Languages ─────────────────────────────────────────────────────────────

export async function addLanguage(data: Partial<DeveloperLanguage>): Promise<DeveloperLanguage> {
  const res = await apiClient.post<{ data: DeveloperLanguage }>('/developers/languages', data);
  return res.data.data;
}

export async function deleteLanguage(languageId: string): Promise<void> {
  await apiClient.delete(`/developers/languages/${languageId}`);
}

// ── Education ─────────────────────────────────────────────────────────────

export async function addEducation(data: Partial<DeveloperEducation>): Promise<DeveloperEducation> {
  const res = await apiClient.post<{ data: DeveloperEducation }>('/developers/education', data);
  return res.data.data;
}

export async function deleteEducation(educationId: string): Promise<void> {
  await apiClient.delete(`/developers/education/${educationId}`);
}

// ── Certifications ────────────────────────────────────────────────────────

export async function addCertification(
  data: Partial<DeveloperCertification>
): Promise<DeveloperCertification> {
  const res = await apiClient.post<{ data: DeveloperCertification }>(
    '/developers/certifications',
    data
  );
  return res.data.data;
}

export async function deleteCertification(certId: string): Promise<void> {
  await apiClient.delete(`/developers/certifications/${certId}`);
}

// ── OSS Contributions ─────────────────────────────────────────────────────

export async function addOssContribution(
  data: Partial<DeveloperOssContribution>
): Promise<DeveloperOssContribution> {
  const res = await apiClient.post<{ data: DeveloperOssContribution }>(
    '/developers/oss',
    data
  );
  return res.data.data;
}

export async function deleteOssContribution(ossId: string): Promise<void> {
  await apiClient.delete(`/developers/oss/${ossId}`);
}

// ── Achievements ──────────────────────────────────────────────────────────

export async function addAchievement(
  data: Partial<DeveloperAchievement>
): Promise<DeveloperAchievement> {
  const res = await apiClient.post<{ data: DeveloperAchievement }>(
    '/developers/achievements',
    data
  );
  return res.data.data;
}

export async function deleteAchievement(achievementId: string): Promise<void> {
  await apiClient.delete(`/developers/achievements/${achievementId}`);
}

// ── Projects ──────────────────────────────────────────────────────────────

export async function addProject(data: Partial<DeveloperProject>): Promise<DeveloperProject> {
  const res = await apiClient.post<{ data: DeveloperProject }>('/developers/projects', data);
  return res.data.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/developers/projects/${projectId}`);
}

// ── Endorsements ──────────────────────────────────────────────────────────

export async function endorseSkill(developerId: string, skillName: string): Promise<Endorsement> {
  const res = await apiClient.post<{ data: Endorsement }>(
    `/developers/${developerId}/endorse`,
    { skillName }
  );
  return res.data.data;
}
