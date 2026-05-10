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
