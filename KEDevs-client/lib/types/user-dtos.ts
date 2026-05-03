import type { 
  AvailabilityStatus, 
  ProfileVisibility, 
  WorkType, 
  YearsOfExperience, 
  CompanySize,
  ContactRequestStatus
} from './user';

export namespace UserDtos {
  // REQUEST DTOs
  export interface CreateDeveloperProfileRequest {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    bio?: string;
    currentLastRole?: string;
    yearsOfExperience?: YearsOfExperience;
    numberOfProjects: number;
    availabilityStatus?: AvailabilityStatus;
    preferredWorkType?: WorkType;
    locationCity?: string;
    locationCountry?: string;
    profileVisibility?: ProfileVisibility;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    publicEmail?: string;
    publicPhone?: string;
  }

  export interface UpdateDeveloperProfileRequest {
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
    bio?: string;
    currentLastRole?: string;
    yearsOfExperience?: YearsOfExperience;
    numberOfProjects: number;
    preferredWorkType?: WorkType;
    locationCity?: string;
    locationCountry?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    publicEmail?: string;
    publicPhone?: string;
  }

  export interface CreateEmployerProfileRequest {
    contactPersonName: string;
    companyName: string;
    companyWebsite?: string;
    industry?: string;
    companySize?: CompanySize;
    locationHQ?: string;
    companyBio?: string;
    logoUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }

  // RESPONSE DTOs
  export interface DeveloperProfileResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    bio?: string;
    currentLastRole?: string;
    yearsOfExperience: YearsOfExperience;
    numberOfProjects: number;
    availabilityStatus: AvailabilityStatus;
    preferredWorkType: WorkType;
    locationCity?: string;
    locationCountry?: string;
    profileVisibility: ProfileVisibility;
    isVerified: boolean;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    publicEmail?: string;
    publicPhone?: string;
    skills: string[];
    languages: string[];
    education: EducationResponse[];
    certifications: CertificationResponse[];
    ossContributions: OssContributionResponse[];
    achievements: AchievementResponse[];
    projects: DeveloperProjectResponse[];
    createdAt: string;
  }

  export interface EmployerProfileResponse {
    id: string;
    userId: string;
    contactPersonName: string;
    companyName: string;
    companyWebsite?: string;
    industry?: string;
    companySize?: CompanySize;
    locationHQ?: string;
    companyBio?: string;
    logoUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    isApproved: boolean;
    isProAccount: boolean;
    createdAt: string;
  }

  export interface EducationResponse {
    id: string;
    institution: string;
    qualification: string;
    yearCompleted: number;
    isCertification: boolean;
  }

  export interface CertificationResponse {
    id: string;
    name: string;
    issuedBy: string;
    yearIssued: number;
    certUrl?: string;
  }

  export interface OssContributionResponse {
    id: string;
    projectName: string;
    contributionUrl?: string;
    description?: string;
  }

  export interface AchievementResponse {
    id: string;
    title: string;
    description?: string;
    year: number;
  }

  export interface DeveloperProjectResponse {
    id: string;
    title: string;
    description?: string;
    techStack?: string;
    projectUrl?: string;
    repoUrl?: string;
    isFeatured: boolean;
    createdAt: string;
  }

  export interface DeveloperSummaryResponse {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    currentLastRole?: string;
    skills: string[];
    availabilityStatus: AvailabilityStatus;
    isVerified: boolean;
    locationCity?: string;
    locationCountry?: string;
    isSpotlighted?: boolean;
  }
}
