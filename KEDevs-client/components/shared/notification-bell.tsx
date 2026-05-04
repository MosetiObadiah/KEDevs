'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getUnreadCount } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const queryClient = useQueryClient();
  const { data: count = 0, refetch } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
  });

  // Real-time updates via WebSocket
  useWebSocket('/user/queue/notifications', () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    refetch();
  });

  return (
    <Link
      href="/notifications"
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200',
        className
      )}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-40" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-teal items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">
              {count > 9 ? '9+' : count}
            </span>
          </span>
        </span>
      )}
    </Link>
  );
}
