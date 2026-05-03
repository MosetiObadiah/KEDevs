export type SpotlightType = 'DAY' | 'WEEK';

export interface DeveloperSpotlightCard {
  developerId: string;
  developerName: string;
  profilePhoto?: string;
  bio?: string;
  currentLastRole?: string;
  locationCity?: string;
  locationCountry?: string;
  isVerified: boolean;
  featuredProjects: any[];
}

export interface SpotlightSlot {
  id: string;
  developerId: string;
  developerName: string;
  type: SpotlightType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  overriddenByAdmin: boolean;
  paymentId: string;
  createdAt: string;
}

export interface CurrentSpotlightResponse {
  daySlot?: DeveloperSpotlightCard;
  weekSlot?: DeveloperSpotlightCard;
}

export interface SpotlightAvailability {
  daySlotAvailable: boolean;
  weekSlotAvailable: boolean;
  daySlotExpiresAt?: string;
  weekSlotExpiresAt?: string;
  dayPriceKes?: number;
  weekPriceKes?: number;
}
