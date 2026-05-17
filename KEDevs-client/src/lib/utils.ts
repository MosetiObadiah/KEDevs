import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatExperience(level: string) {
  if (!level) return 'N/A';
  const mapping: Record<string, string> = {
    'ZERO_TO_ONE': '0–1 Years',
    'ONE_TO_THREE': '1–3 Years',
    'THREE_TO_FIVE': '3–5 Years',
    'FIVE_TO_TEN': '5–10 Years',
    'TEN_PLUS': '10+ Years'
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
  const cleanSize = size.toUpperCase().replace(/\s+/g, '_');
  const mapping: Record<string, string> = {
    'ONE_TO_TEN': '1–10 Employees',
    'TEN_TO_FIFTY': '10–50 Employees',
    'FIFTY_TO_TWO_HUNDRED': '50–200 Employees',
    'TWO_HUNDRED_PLUS': '200+ Employees'
  };
  return mapping[cleanSize] || size;
}

export function formatAvailability(status: string) {
  if (!status) return 'N/A';
  const mapping: Record<string, string> = {
    'NOT_AVAILABLE': 'Not Available',
    'OPEN_TO_OFFERS': 'Open to Offers'
  };
  return mapping[status] || status.replace(/_/g, ' ');
}

export function formatLocation(city: string) {
  if (!city) return 'N/A';
  return toTitleCase(city);
}

export function toTitleCase(str: string) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
