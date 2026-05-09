'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Settings, 
  MoreVertical, 
  Clock, 
  Briefcase, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Circle,
  Loader2,
  Inbox,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

const categoryConfig: Record<string, { color: string, icon: any }> = {
  'JOB': { color: 'bg-blue-100 text-blue-600', icon: Briefcase },
  'PAYMENT': { color: 'bg-emerald-100 text-emerald-600', icon: Wallet },
  'ADMIN': { color: 'bg-red-100 text-red-600', icon: ShieldCheck },
  'ENDORSEMENT': { color: 'bg-purple-100 text-purple-600', icon: Sparkles },
  'SPOTLIGHT': { color: 'bg-amber-100 text-amber-600', icon: Bell },
  'default': { color: 'bg-slate-100 text-slate-600', icon: Bell },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page + 1 : 0;
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(currentPage, 20);
      if (response.success) {
        const newNotifications = response.data.content;
        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setPage(currentPage);
        } else {
          setNotifications(newNotifications);
          setPage(0);
        }
        setHasMore(!response.data.last);
      }
    } catch (error) {
      toast.error('Failed to sync notifications');
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
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
         <div className="space-y-4">
            <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/5 text-primary border-primary/10 px-3 py-1">
               ACTIVITY FEED
            </Badge>
            <div className="space-y-1">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Notifications</h1>
               <p className="text-slate-500 font-semibold italic">Your platform heartbeat and security updates</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50" onClick={() => router.push('/settings/notifications')}>
               <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl px-6 font-black gap-2 border-slate-100" onClick={handleMarkAllRead} disabled={notifications.every(n => n.isRead)}>
               <CheckCheck className="h-4 w-4" /> Mark All Read
            </Button>
         </div>
      </div>

      <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
         <CardContent className="p-0">
            {loading && notifications.length === 0 ? (
               <div className="py-24 flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing records...</p>
               </div>
            ) : notifications.length === 0 ? (
               <div className="py-24 text-center space-y-6">
                  <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto border-2 border-dashed border-slate-100">
                     <Inbox className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-900">All Caught Up</h3>
                     <p className="text-slate-500 font-medium">You don't have any new activity alerts right now.</p>
                  </div>
               </div>
            ) : (
               <div className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                     const config = categoryConfig[n.category] || categoryConfig.default;
                     const Icon = config.icon;
                     
                     return (
                        <div 
                           key={n.id} 
                           className={cn(
                              "p-8 flex items-start gap-6 transition-all cursor-pointer group",
                              n.isRead ? "bg-white opacity-60" : "bg-primary/[0.02] border-l-4 border-l-primary"
                           )}
                           onClick={() => handleMarkAsRead(n.id)}
                        >
                           <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", config.color)}>
                              <Icon className="h-5 w-5" />
                           </div>
                           
                           <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                 <div className="flex items-center gap-3">
                                    <h3 className={cn("text-lg tracking-tight", n.isRead ? "font-bold text-slate-600" : "font-black text-slate-900")}>
                                       {n.title}
                                    </h3>
                                    {!n.isRead && (
                                       <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-md">NEW</Badge>
                                    )}
                                 </div>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                    <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                 </span>
                              </div>
                              
                              <p className="text-slate-500 font-medium leading-relaxed">
                                 {n.message}
                              </p>
                              
                              <div className="flex items-center gap-3 pt-2">
                                 <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-400 px-2 py-0.5">
                                    {n.category}
                                 </Badge>
                                 <Button variant="ghost" className="h-6 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Take Action <ChevronRight className="h-3 w-3" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
            
            {hasMore && (
               <div className="p-8 bg-slate-50/50 flex justify-center border-t border-slate-50">
                  <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2" onClick={() => fetchNotifications(true)} disabled={loading}>
                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />} Load Older History
                  </Button>
               </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
