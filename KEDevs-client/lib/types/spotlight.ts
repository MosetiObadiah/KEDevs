export type SpotlightType = 'FEATURED' | 'STANDARD' | 'PREMIUM';

export interface SpotlightSlot {
  id: string;
  developerId: string;
  developerName: string;
  developerHeadline?: string;
  developerProfileImageUrl?: string;
  developerSkills: string[];
  spotlightType: SpotlightType;
  paymentId: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface SpotlightAvailability {
  available: boolean;
  nextSlotDate?: string;
  priceKes: number;
}
