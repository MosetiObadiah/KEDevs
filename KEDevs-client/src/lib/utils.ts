import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatExperience(level: string | undefined | null) {
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

export function formatWorkType(type: string | undefined | null) {
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

export function formatJobType(type: string | undefined | null) {
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

export function formatExperienceLevel(level: string | undefined | null) {
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

export function formatCompanySize(size: string | undefined | null) {
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

export function formatAvailability(status: string | undefined | null) {
  if (!status) return 'N/A';
  const mapping: Record<string, string> = {
    'NOT_AVAILABLE': 'Not Available',
    'OPEN_TO_OFFERS': 'Open to Offers'
  };
  return mapping[status] || status.replace(/_/g, ' ');
}

export function formatLocation(city: string | undefined | null) {
  if (!city) return 'N/A';
  return toTitleCase(city);
}

export function toTitleCase(str: string) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function formatDateString(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTimeString(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function isJobExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const dateString = typeof deadline === 'string' ? deadline : (deadline as any).toString();
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return false;
  const deadlineDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
}
