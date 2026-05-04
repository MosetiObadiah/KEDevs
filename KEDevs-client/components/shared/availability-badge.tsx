import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AvailabilityStatus } from '@/lib/types/user';

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; className: string }
> = {
  AVAILABLE_NOW: {
    label: 'Available',
    className: 'bg-teal/15 text-teal border-teal/30 hover:bg-teal/20',
  },
  BUSY: {
    label: 'Busy',
    className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20',
  },
  OPEN_TO_OFFERS: {
    label: 'Open to Offers',
    className: 'bg-fern/15 text-fern border-fern/30 hover:bg-fern/20',
  },
};

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  className?: string;
}

export function AvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.BUSY;
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium border', config.className, className)}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </Badge>
  );
}
