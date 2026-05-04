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
  postedById: string;
  posterName?: string;
  employerId?: string; // Legacy/Compat
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  summary?: string;
  description: string;
  locationCity?: string;
  locationCountry?: string;
  salary?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  salaryCurrency?: string;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  minQualification?: string;
  minExperienceYears?: number;
  status: JobStatus;
  visibility: JobVisibility;
  tags?: JobTag[] | string[];
  upvoteCount: number;
  isFlagged: boolean;
  currentUserVote?: VoteType | null;
  hasApplied?: boolean;
  applicationCount: number;
  sourceUrl?: string;
  isPeerSourced: boolean;
  createdAt: string;
  updatedAt?: string;
  applicationDeadline?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantProfileImage?: string;
  coverLetter?: string;
  status: ApplicationStatus;
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
