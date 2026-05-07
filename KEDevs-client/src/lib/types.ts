// src/lib/types.ts

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
export type WorkType = 'REMOTE' | 'ON_SITE' | 'HYBRID';
export type ExperienceLevel = 'INTERN' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD';
export type JobStatus = 'OPEN' | 'CLOSED' | 'FILLED' | 'CANCELLED';
export type JobVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';
export type AvailabilityStatus = 'AVAILABLE_NOW' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE' | 'HIRED';
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
  visibility: JobVisibility;
  status: JobStatus;
  upvoteCount: number;
  isPeerSourced: boolean;
  sourceUrl: string;
  tags: string[];
  createdAt: string;
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
    techStack: string;
    projectUrl: string;
    repoUrl: string;
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
  role: 'DEVELOPER' | 'EMPLOYER' | 'ADMIN';
  isEmailVerified: boolean;
  isApproved: boolean;
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
}


