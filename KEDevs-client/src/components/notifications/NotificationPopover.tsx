'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Inbox, 
  Loader2, 
  ChevronRight,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notificationService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPopoverProps {
  children: React.ReactNode;
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  children,
  unreadCount = 0,
  onMarkAllAsRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(0, 5);
      if (response.success) {
        setNotifications(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onMarkAllAsRead) onMarkAllAsRead();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onMarkAllAsRead) onMarkAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer group">
          {children}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96 rounded-[2.5rem] p-0 border-none shadow-3xl shadow-slate-200/50 overflow-hidden bg-white mt-4 mr-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="p-6 pb-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-50">
           <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              <h3 className="font-black text-slate-900 tracking-tight text-sm">Notifications</h3>
           </div>
           <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 rounded-lg font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5 px-3"
              onClick={handleMarkAllRead}
           >
              <CheckCheck className="h-3 w-3 mr-1" /> Mark All Read
           </Button>
        </div>

        <ScrollArea className="h-[400px]">
           {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 className="h-8 w-8 text-primary animate-spin" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Polling feed...</p>
              </div>
           ) : notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-24 gap-6 px-12 text-center">
                 <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center">
                    <Inbox className="h-8 w-8 text-slate-200" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-black text-slate-900 text-sm">Clear Horizon</p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">No new transmissions detected in your local notification sphere.</p>
                 </div>
              </div>
           ) : (
              <div className="divide-y divide-slate-50">
                 {notifications.map((n) => (
                    <div 
                       key={n.id}
                       onClick={() => handleMarkAsRead(n.id)}
                       className={cn(
                          "p-6 flex gap-4 cursor-pointer transition-all hover:bg-slate-50/50 group",
                          !n.isRead && "bg-primary/[0.02]"
                       )}
                    >
                       <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 rounded-xl border border-slate-100 shadow-sm">
                             <AvatarFallback className={cn(
                                "font-black text-[10px] transition-colors",
                                !n.isRead ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                             )}>
                                <Bell className="h-4 w-4" />
                             </AvatarFallback>
                          </Avatar>
                          {!n.isRead && (
                             <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white animate-pulse" />
                          )}
                       </div>
                       
                       <div className="space-y-1 flex-1">
                          <div className="flex items-start justify-between gap-2">
                             <h4 className={cn(
                                "text-sm font-black leading-tight tracking-tight",
                                !n.isRead ? "text-slate-900" : "text-slate-500"
                             )}>
                                {n.title}
                             </h4>
                             <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap mt-0.5">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                             </span>
                          </div>
                          <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">
                             {n.message}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </ScrollArea>

        <div className="p-3 bg-slate-900">
           <Button 
              className="w-full h-12 rounded-2xl font-black bg-white text-slate-900 hover:bg-slate-100 text-xs tracking-tight shadow-xl group"
              onClick={() => {
                 router.push('/notifications');
                 setIsOpen(false);
              }}
           >
              Open Full Inbox <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationPopover;
