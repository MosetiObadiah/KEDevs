// ── Enums (mirrors Spring Boot shared/enums/) ─────────────────────────────

export type Role = 'DEVELOPER' | 'EMPLOYER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'OPEN_TO_OFFERS';
export type ProfileVisibility = 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
export type YearsOfExperience =
  | 'LESS_THAN_ONE'
  | 'ONE_TO_TWO'
  | 'TWO_TO_FIVE'
  | 'FIVE_TO_TEN'
  | 'MORE_THAN_TEN';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
export type ContactRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

// ── Auth / User ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  provider: AuthProvider;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  isApprovedByAdmin: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresApproval: boolean;
  inGracePeriod: boolean;
}

// ── Developer Profile ─────────────────────────────────────────────────────

export interface DeveloperSkill {
  id: string;
  name: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

export interface DeveloperLanguage {
  id: string;
  language: string;
  proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
}

export interface DeveloperEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  current: boolean;
}

export interface DeveloperCertification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface DeveloperOssContribution {
  id: string;
  projectName: string;
  repoUrl: string;
  description: string;
  role: string;
}

export interface DeveloperAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  url?: string;
}

export interface DeveloperProject {
  id: string;
  title: string;
  description: string;
  techStack: string;
  projectUrl?: string;
  repoUrl?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Endorsement {
  id: string;
  skillName: string;
  endorserId: string;
  endorserName: string;
  endorserProfileImageUrl?: string;
  createdAt: string;
}

export interface DeveloperProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio?: string;
  headline?: string;
  locationCity?: string;
  locationCountry?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileImageUrl?: string;
  availability: AvailabilityStatus;
  visibility: ProfileVisibility;
  yearsOfExperience?: YearsOfExperience;
  isVerified: boolean;
  isProAccount: boolean;
  skills: DeveloperSkill[];
  languages: DeveloperLanguage[];
  education: DeveloperEducation[];
  certifications: DeveloperCertification[];
  ossContributions: DeveloperOssContribution[];
  achievements: DeveloperAchievement[];
  projects: DeveloperProject[];
  endorsements: Endorsement[];
  createdAt: string;
  updatedAt: string;
}

// ── Employer Profile ──────────────────────────────────────────────────────

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  industrySector?: string;
  companySize?: CompanySize;
  locationHQ?: string;
  about?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isVerified: boolean;
  isApproved: boolean;
  isProAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkedDeveloper {
  id: string;
  developerId: string;
  developerName: string;
  developerProfileImageUrl?: string;
  developerHeadline?: string;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: ContactRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDeveloperSearch {
  id: string;
  name: string;
  filterCriteria: Record<string, unknown>;
  createdAt: string;
}
