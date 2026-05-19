// src/lib/types.ts

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type WorkType = 'REMOTE' | 'ONSITE' | 'HYBRID' | 'CONTRACT' | 'FULLTIME';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
export type JobStatus = 'OPEN' | 'CLOSED' | 'FILLED' | 'CANCELLED';
export type JobVisibility = 'PUBLIC' | 'PRIVATE';
export type AvailabilityStatus = 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE';
export type YearsOfExperience = 'ZERO_TO_ONE' | 'ONE_TO_THREE' | 'THREE_TO_FIVE' | 'FIVE_TO_TEN' | 'TEN_PLUS';

export interface JobSummary {
  id: string;
  title: string;
  companyName: string;
  locationCity: string;
  locationCountry: string;
  jobType: JobType;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  salaryRangeMin?: number | null;
  salaryRangeMax?: number | null;
  visibility: JobVisibility;
  status: JobStatus;
  upvoteCount: number;
  isPeerSourced: boolean;
  sourceUrl: string;
  tags: string[];
  createdAt: string;
  applicationDeadline?: string | null;
  postedById?: string;
  postedByName?: string;
  postedByRole?: 'EMPLOYER' | 'DEVELOPER' | 'ADMIN';
  isFlagged?: boolean;
  isPinned?: boolean;
  flagStatus?: 'NONE' | 'PENDING' | 'REVIEWED_KEPT' | 'REVIEWED_REMOVED';
}

export interface DeveloperSummary {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  currentLastRole: string;
  skills: string[];
  availabilityStatus: AvailabilityStatus;
  isVerified: boolean;
  locationCity: string;
  locationCountry: string;
  publicEmail?: string;
  publicPhone?: string;
  yearsOfExperience?: YearsOfExperience;
  preferredWorkType?: WorkType;
  numberOfProjects: number;
  endorsementCount: number;
  languages: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DeveloperSpotlightCard {
  developerId: string;
  developerName: string;
  profilePhoto: string;
  bio: string;
  currentLastRole: string;
  locationCity: string;
  locationCountry: string;
  isVerified: boolean;
  featuredProjects: {
    title: string;
    description: string;
    techStack: string[];
    projectUrl: string;
    repoUrl: string;
    screenshotUrl?: string;
  }[];
}

export interface CurrentSpotlightResponse {
  daySlot: DeveloperSpotlightCard | null;
  weekSlot: DeveloperSpotlightCard | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  avatar?: string;
  role: 'DEVELOPER' | 'EMPLOYER' | 'ADMIN';
  isEmailVerified: boolean;
  isApproved: boolean;
  isVerified: boolean;
  spotlightStatus?: {
    isActive: boolean;
    expiresAt?: string;
    type?: "Day" | "Week";
  };
  accountStatus?: string;
  skills?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'DEVELOPER' | 'EMPLOYER' | 'ADMIN';
  emailVerified: boolean;
  requiresApproval: boolean;
  onboarded: boolean;
  isVerified: boolean;
  accountStatus?: string;
}

export interface PublicStats {
  developerCount: number;
  companyCount: number;
  jobCount: number;
}


