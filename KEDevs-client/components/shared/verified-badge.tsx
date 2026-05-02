import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ className, size = 'sm' }: VerifiedBadgeProps) {
  return (
    <span
      title="Verified"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-teal text-white',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
        className
      )}
    >
      <Check className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={3} />
    </span>
  );
}
