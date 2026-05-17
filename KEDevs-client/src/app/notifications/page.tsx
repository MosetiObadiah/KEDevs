'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ChevronRight,
  FilterX,
  Mail,
  Zap,
  Info,
  UserX,
  User,
  MessageSquare,
  ExternalLink,
  Building2
} from 'lucide-react';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { useNotification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  metadata?: any;
}

const categoryConfig: Record<string, { color: string, icon: any, label: string }> = {
  'JOB': { color: 'text-blue-600 bg-blue-50', icon: Briefcase, label: 'Talent Acquisition' },
  'PAYMENT': { color: 'text-emerald-600 bg-emerald-50', icon: Wallet, label: 'Financial Alerts' },
  'ADMIN': { color: 'text-red-600 bg-red-50', icon: ShieldCheck, label: 'Security & Auth' },
  'ENDORSEMENT': { color: 'text-purple-600 bg-purple-50', icon: Sparkles, label: 'Endorsements' },
  'SPOTLIGHT': { color: 'text-amber-600 bg-amber-50', icon: Bell, label: 'Visibility' },
  'CONTACT': { color: 'text-indigo-600 bg-indigo-50', icon: Mail, label: 'Contact Requests' },
  'default': { color: 'text-slate-600 bg-slate-50', icon: Bell, label: 'System Alerts' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { decrementUnreadCount, refreshUnreadCount, clearUnreadCount, latestNotification } = useNotification();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (latestNotification) {
      setNotifications(prev => {
        if (!prev.find(n => n.id === latestNotification.id)) {
          return [latestNotification, ...prev];
        }
        return prev;
      });
    }
  }, [latestNotification]);

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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshUnreadCount();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user? They will not be able to contact you again.')) return;
    try {
      await userService.blockUser(userId);
      setNotifications(prev => prev.map(n => 
        n.metadata?.senderUserId === userId 
          ? { ...n, metadata: { ...n.metadata, isSenderBlocked: true } } 
          : n
      ));
      toast.success('User blocked');
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await userService.unblockUser(userId);
      setNotifications(prev => prev.map(n => 
        n.metadata?.senderUserId === userId 
          ? { ...n, metadata: { ...n.metadata, isSenderBlocked: false } } 
          : n
      ));
      toast.success('User unblocked');
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Archive this record?')) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
      toast.success('Record archived');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      clearUnreadCount();
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    return n.category === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-6 space-y-4 md:space-y-0 print:hidden">
          <div className="flex gap-3">
             <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 h-11" onClick={handleMarkAllRead} disabled={notifications.every(n => n.isRead)}>
                <CheckCheck className="mr-2 h-4 w-4 text-primary" /> Mark All Read
             </Button>
             <Button className="font-bold h-11 shadow-lg shadow-primary/20 px-6" asChild>
                <Link href="/settings/notifications">
                   <Settings className="mr-2 h-4 w-4" /> Preferences
                </Link>
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Categories</h3>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                <Button 
                  variant={activeFilter === 'ALL' ? 'secondary' : 'ghost'} 
                  className={cn(
                    "w-full justify-between font-bold h-10 gap-3",
                    activeFilter === 'ALL' ? "bg-primary/5 text-primary border-none" : "text-muted-foreground"
                  )}
                  onClick={() => setActiveFilter('ALL')}
                >
                  <div className="flex items-center gap-3">
                    <Inbox className="h-4 w-4" /> All Alerts
                  </div>
                  <Badge variant="secondary" className="bg-muted/50 text-[10px] h-5 px-1.5">{notifications.length}</Badge>
                </Button>

                <Button 
                  variant={activeFilter === 'UNREAD' ? 'secondary' : 'ghost'} 
                  className={cn(
                    "w-full justify-between font-bold h-10 gap-3",
                    activeFilter === 'UNREAD' ? "bg-primary/5 text-primary border-none" : "text-muted-foreground"
                  )}
                  onClick={() => setActiveFilter('UNREAD')}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4" /> Unread
                  </div>
                  {unreadCount > 0 && <Badge className="bg-primary text-white text-[10px] h-5 px-1.5">{unreadCount}</Badge>}
                </Button>

                <Separator className="my-2 bg-border/30" />

                {Object.entries(categoryConfig).filter(([k]) => k !== 'default').map(([key, config]) => {
                  const Icon = config.icon;
                  const count = notifications.filter(n => n.category === key).length;
                  if (count === 0 && activeFilter !== key) return null;

                  return (
                    <Button 
                      key={key}
                      variant={activeFilter === key ? 'secondary' : 'ghost'} 
                      className={cn(
                        "w-full justify-between font-medium h-10 gap-3",
                        activeFilter === key ? "bg-primary/5 text-primary border-none" : "text-muted-foreground"
                      )}
                      onClick={() => setActiveFilter(key)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" /> {config.label}
                      </div>
                      {count > 0 && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/50 text-muted-foreground">{count}</Badge>}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Notifications Main Area */}
          <main className="lg:col-span-3">
            {loading && notifications.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="border-border/50 overflow-hidden bg-white/50">
                    <div className="p-8 flex gap-6 animate-pulse">
                      <div className="h-12 w-12 rounded-2xl bg-muted shrink-0" />
                      <div className="flex-1 space-y-4">
                        <div className="h-4 w-1/4 bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="border-border/50 shadow-sm bg-white rounded-3xl py-20">
                <CardContent className="flex flex-col items-center text-center space-y-6">
                  <div className="h-20 w-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                    <Inbox className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground">Clean Slate</h3>
                    <p className="text-muted-foreground font-medium max-w-xs">No active alerts found for this category. You're all caught up!</p>
                  </div>
                  {activeFilter !== 'ALL' && (
                    <Button variant="outline" onClick={() => setActiveFilter('ALL')} className="font-bold border-primary/20">
                      View All Alerts
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((n) => {
                  const config = categoryConfig[n.category] || categoryConfig.default;
                  const Icon = config.icon;
                  
                  return (
                    <Card 
                      key={n.id} 
                      className={cn(
                        "group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden cursor-pointer",
                        n.isRead ? "bg-white/60" : "bg-white border-l-4 border-l-primary"
                      )}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <CardContent className="p-8 flex items-start gap-6">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", config.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className={cn("text-lg font-bold tracking-tight", n.isRead ? "text-muted-foreground" : "text-foreground")}>
                                {n.title}
                              </h3>
                              {!n.isRead && (
                                <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-md">NEW</Badge>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                              <Clock className="h-3 w-3 text-primary" /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {n.category !== 'CONTACT' && (
                            <p className={cn(
                              "text-sm font-medium leading-relaxed max-w-2xl",
                              n.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
                            )}>
                              {n.message}
                            </p>
                          )}
                          
                          {n.category === 'CONTACT' && n.metadata?.message && (
                            <div className="mt-4 p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <MessageSquare className="h-3 w-3" /> Message Content
                              </div>
                              <p className="text-sm font-medium text-foreground italic">
                                "{n.metadata.message}"
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {n.metadata.senderDeveloperId ? (
                                  <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold text-[10px] uppercase gap-1.5 border-primary/20 hover:bg-primary/5" asChild onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/developers/${n.metadata.senderDeveloperId}`}>
                                      <User className="h-3 w-3" /> View Developer
                                    </Link>
                                  </Button>
                                ) : n.metadata.companyId ? (
                                  <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold text-[10px] uppercase gap-1.5 border-primary/20 hover:bg-primary/5" asChild onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/companies/${n.metadata.companyId}`}>
                                      <Building2 className="h-3 w-3" /> View Employer
                                    </Link>
                                  </Button>
                                ) : null}
                                {!n.metadata.isSenderBlocked ? (
                                  <Button size="sm" variant="ghost" className="h-8 rounded-lg font-bold text-[10px] uppercase gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockUser(n.metadata.senderUserId);
                                  }}>
                                    <UserX className="h-3 w-3" /> Block
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="ghost" className="h-8 rounded-lg font-bold text-[10px] uppercase gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnblockUser(n.metadata.senderUserId);
                                  }}>
                                    <ShieldCheck className="h-3 w-3" /> Unblock
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          
                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="rounded-lg font-bold text-[9px] uppercase tracking-widest bg-muted/30 border-border/50 text-muted-foreground px-2 py-0.5">
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {!n.isRead && (
                                <Button 
                                  variant="ghost" 
                                  className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(n.id);
                                  }}
                                >
                                  Mark as Read
                                </Button>
                              )}
                              <Button variant="ghost" className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Acknowledge <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(n.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {hasMore && (
                  <div className="pt-6 flex justify-center">
                    <Button variant="outline" className="rounded-2xl font-bold h-12 px-8 border-primary/20 hover:bg-primary/5 gap-2" onClick={() => fetchNotifications(true)} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <MoreVertical className="h-4 w-4 text-primary" />} Load Historical Records
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
