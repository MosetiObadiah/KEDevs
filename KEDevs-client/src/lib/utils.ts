import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatExperience(level: string) {
  if (!level) return 'N/A';
  const mapping: Record<string, string> = {
    'ZERO_TO_ONE': 'Zero to one years of experience',
    'ONE_TO_THREE': 'One to three years of experience',
    'THREE_TO_FIVE': 'Three to five years of experience',
    'FIVE_TO_TEN': 'Five to ten years of experience',
    'TEN_PLUS': 'Ten plus years of experience'
  };
  return mapping[level] || level.replace(/_/g, ' ');
}

export function formatWorkType(type: string) {
  if (!type) return 'N/A';
  const mapping: Record<string, string> = {
    'REMOTE': 'Remote',
    'ONSITE': 'On-site',
    'HYBRID': 'Hybrid',
    'CONTRACT': 'Contract',
    'FULLTIME': 'Full-time'
  };
  return mapping[type] || type;
}

export function formatJobType(type: string) {
  if (!type) return 'N/A';
  const mapping: Record<string, string> = {
    'FULL_TIME': 'Full-time',
    'PART_TIME': 'Part-time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship',
    'FREELANCE': 'Freelance'
  };
  return mapping[type] || type.replace(/_/g, ' ');
}

export function formatExperienceLevel(level: string) {
  if (!level) return 'N/A';
  const mapping: Record<string, string> = {
    'ENTRY': 'Entry Level',
    'MID': 'Mid-Level',
    'SENIOR': 'Senior Level',
    'LEAD': 'Lead / Principal',
    'EXECUTIVE': 'Executive Level'
  };
  return mapping[level] || level.replace(/_/g, ' ');
}

export function formatCompanySize(size: string) {
  if (!size) return 'N/A';
  const mapping: Record<string, string> = {
    'ONE_TO_TEN': '1-10 employees',
    'ELEVEN_TO_FIFTY': '11-50 employees',
    'FIFTY_ONE_TO_TWO_HUNDRED': '51-200 employees',
    'TWO_HUNDRED_PLUS': '200+ employees'
  };
  return mapping[size] || size.replace(/_/g, ' ');
}

export function formatAvailability(status: string) {
  if (!status) return 'N/A';
  const mapping: Record<string, string> = {
    'NOT_AVAILABLE': 'Not Available',
    'OPEN_TO_OFFERS': 'Open to Offers'
  };
  return mapping[status] || status.replace(/_/g, ' ');
}
