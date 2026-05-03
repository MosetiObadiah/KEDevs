// ── Enums ─────────────────────────────────────────────────────────────────

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT' | 'FILLED';
export type JobVisibility = 'EXTERNAL' | 'INTERNAL';
export type WorkType = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type VoteType = 'UPVOTE' | 'DOWNVOTE';
export type FlagStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';
export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'OFFERED'
  | 'WITHDRAWN';

// ── Entities ──────────────────────────────────────────────────────────────

export interface JobTag {
  id: string;
  tag: string;
}

export interface JobPost {
  id: string;
  employerId?: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  description?: string;
  locationCity?: string;
  locationCountry?: string;
  salary?: string;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  status: JobStatus;
  visibility: JobVisibility;
  tags?: JobTag[] | string[];
  upvotes?: number;
  upvoteCount?: number;
  downvotes?: number;
  applicationCount?: number;
  userVote?: VoteType | null;
  currentUserVote?: VoteType | null;
  hasApplied?: boolean;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  developerId: string;
  developerName: string;
  developerEmail: string;
  developerProfileImageUrl?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobVote {
  id: string;
  jobId: string;
  userId: string;
  voteType: VoteType;
  createdAt: string;
}

export interface JobFlag {
  id: string;
  jobId: string;
  userId: string;
  reason: string;
  status: FlagStatus;
  createdAt: string;
}

// ── Filter / Pagination ───────────────────────────────────────────────────

export interface JobFilters {
  keyword?: string;
  workType?: WorkType;
  experienceLevel?: ExperienceLevel;
  jobType?: JobType;
  locationCountry?: string;
  tag?: string;
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
