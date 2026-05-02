import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
  variant?: 'line' | 'card' | 'avatar';
}

export function SkeletonLoader({
  rows = 3,
  className,
  variant = 'line',
}: SkeletonLoaderProps) {
  if (variant === 'avatar') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
          <div className="h-3 bg-muted animate-pulse rounded-md w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border border-border p-5 space-y-3', className)}>
        <div className="h-5 bg-muted animate-pulse rounded-md w-2/3" />
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-muted animate-pulse rounded-md"
              style={{ width: `${100 - i * 15}%` }}
            />
          ))}
        </div>
        <div className="h-8 bg-muted animate-pulse rounded-lg w-28 mt-2" />
      </div>
    );
  }

  // Default: lines
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted animate-pulse rounded-md"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
