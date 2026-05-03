import apiClient from '@/lib/apiClient';
import type { JobPost, JobApplication, JobFilters, Page } from '@/lib/types/job';
import type { VoteType } from '@/lib/types/job';

// ── Job Posts ─────────────────────────────────────────────────────────────

export async function getJobs(filters: JobFilters = {}): Promise<Page<JobPost>> {
  const res = await apiClient.get<Page<JobPost>>('/jobs', { params: filters });
  return res.data;
}

export async function getJob(id: string): Promise<JobPost> {
  const res = await apiClient.get<JobPost>(`/jobs/${id}`);
  return res.data;
}

export async function getExternalJobs(filters: JobFilters = {}): Promise<Page<JobPost>> {
  const res = await apiClient.get<Page<JobPost>>('/jobs/external', { params: filters });
  return res.data;
}

export async function getMyPosts(): Promise<JobPost[]> {
  const res = await apiClient.get<JobPost[]>('/jobs/my-posts');
  return res.data;
}

export async function createJob(data: Partial<JobPost>): Promise<JobPost> {
  const res = await apiClient.post<JobPost>('/jobs', data);
  return res.data;
}

export async function updateJob(id: string, data: Partial<JobPost>): Promise<JobPost> {
  const res = await apiClient.put<JobPost>(`/jobs/${id}`, data);
  return res.data;
}

export async function updateJobStatus(id: string, status: string): Promise<JobPost> {
  const res = await apiClient.patch<JobPost>(`/jobs/${id}/status`, { status });
  return res.data;
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
}

// ── Applications ──────────────────────────────────────────────────────────

export async function applyToJob(
  jobId: string,
  data: { coverLetter?: string; resumeUrl?: string }
): Promise<JobApplication> {
  const res = await apiClient.post<JobApplication>(`/jobs/${jobId}/apply`, data);
  return res.data;
}

export async function getMyApplications(): Promise<JobApplication[]> {
  const res = await apiClient.get<JobApplication[]>('/jobs/my-applications');
  return res.data;
}

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  const res = await apiClient.get<JobApplication[]>(`/jobs/${jobId}/applications`);
  return res.data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<JobApplication> {
  const res = await apiClient.patch<JobApplication>(
    `/jobs/applications/${applicationId}/status`,
    { status }
  );
  return res.data;
}

export async function withdrawApplication(applicationId: string): Promise<void> {
  await apiClient.delete(`/jobs/applications/${applicationId}`);
}

// ── Votes & Flags ─────────────────────────────────────────────────────────

export async function voteJob(jobId: string, voteType: VoteType): Promise<void> {
  await apiClient.post(`/jobs/${jobId}/vote`, { voteType });
}

export async function flagJob(jobId: string, reason: string): Promise<void> {
  await apiClient.post(`/jobs/${jobId}/flag`, { reason });
}
