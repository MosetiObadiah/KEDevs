import * as z from 'zod';

export const AvailabilityStatusEnum = z.enum(['AVAILABLE_NOW', 'BUSY', 'OPEN_TO_OFFERS']);
export const ProfileVisibilityEnum = z.enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']);
export const WorkTypeEnum = z.enum(['REMOTE', 'ONSITE', 'HYBRID']);
export const YearsOfExperienceEnum = z.enum([
  'ZERO_TO_ONE',
  'ONE_TO_THREE',
  'THREE_TO_FIVE',
  'FIVE_TO_TEN',
  'TEN_PLUS',
]);
export const CompanySizeEnum = z.enum([
  'ONE_TO_TEN',
  'TEN_TO_FIFTY',
  'FIFTY_TO_TWO_HUNDRED',
  'TWO_HUNDRED_PLUS',
]);

export const developerProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  profilePhoto: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
  currentLastRole: z.string().min(1, 'Current/last role is required').max(100),
  yearsOfExperience: YearsOfExperienceEnum.optional(),
  numberOfProjects: z.coerce.number().min(0).default(0),
  availabilityStatus: AvailabilityStatusEnum.optional().default('OPEN_TO_OFFERS'),
  preferredWorkType: WorkTypeEnum.optional().default('REMOTE'),
  locationCity: z.string().max(100).optional().or(z.literal('')),
  locationCountry: z.string().max(100).optional().or(z.literal('')),
  profileVisibility: ProfileVisibilityEnum.optional().default('PUBLIC'),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  publicEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  publicPhone: z.string().max(20).optional().or(z.literal('')),
});

export type DeveloperProfileFormData = z.infer<typeof developerProfileSchema>;

export const employerProfileSchema = z.object({
  contactPersonName: z.string().min(1, 'Contact person name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(100),
  companyWebsite: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  companySize: CompanySizeEnum.optional(),
  locationHQ: z.string().max(100).optional().or(z.literal('')),
  companyBio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;
