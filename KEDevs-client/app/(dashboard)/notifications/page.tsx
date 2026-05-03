'use client';

import { useState } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, getNotificationPreferences, updateNotificationPreference } from '@/lib/api/notifications';
import { profileApi } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Check, 
  MessageSquare, 
  Briefcase, 
  Star, 
  CreditCard, 
  Shield, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, CONTACT_REQUEST, JOB_APPLICATION, etc.
  const [showPreferences, setShowPreferences] = useState(false);

  const { data: preferences } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: getNotificationPreferences,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['notifications', 'all'],
    queryFn: ({ pageParam = 0 }) => getNotifications(pageParam, 50),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const updatePrefMutation = useMutation({
    mutationFn: ({ category, data }: { category: string, data: any }) => updateNotificationPreference(category, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      toast.success('Preferences updated');
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'DECLINED' }) => 
      profileApi.respondToContactRequest(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Contact request ${variables.status.toLowerCase()}`);
    },
  });

  const allNotifications = data?.pages.flatMap((page) => page.content) || [];

  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter !== 'ALL') return n.category === filter;
    return true;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'CONTACT_REQUEST': return <MessageSquare className="w-5 h-5 text-teal-600" />;
      case 'JOB_APPLICATION': return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'ENDORSEMENT': return <Star className="w-5 h-5 text-amber-600" />;
      case 'PAYMENT': return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'SYSTEM': return <Shield className="w-5 h-5 text-slate-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleTogglePref = (category: string, field: 'inApp' | 'email', value: boolean) => {
    updatePrefMutation.mutate({ category, data: { [field]: value } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0b1a13]">Notifications</h1>
          <p className="text-[#52a37a] mt-1 font-medium">Keep track of your community interactions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreferences(!showPreferences)}
            className="border-secondary text-foreground font-bold rounded-xl h-11"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Preferences {showPreferences ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || allNotifications.length === 0}
            className="border-[#8ce5b8] text-[#0b1a13] font-bold rounded-xl h-11 px-6 hover:bg-[#f2faf6]"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      {showPreferences && (
        <Card className="rounded-3xl border-secondary shadow-sm bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Settings2 className="w-5 h-5 mr-2"/> Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {(!preferences || preferences.length === 0) ? (
              <p className="text-sm text-muted-foreground">Loading preferences...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-secondary/50 pb-2">
                  <div className="col-span-6">Category</div>
                  <div className="col-span-3 text-center">In-App</div>
                  <div className="col-span-3 text-center">Email</div>
                </div>
                {preferences.map((pref) => (
                  <div key={pref.category} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 font-medium text-foreground">
                      {pref.category.replace(/_/g, ' ')}
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Switch 
                        checked={pref.inApp} 
                        onCheckedChange={(v) => handleTogglePref(pref.category, 'inApp', v)} 
                      />
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Switch 
                        checked={pref.email} 
                        onCheckedChange={(v) => handleTogglePref(pref.category, 'email', v)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="bg-white border border-secondary rounded-2xl h-14 p-1.5 shadow-sm overflow-x-auto flex w-full justify-start md:w-fit">
          <TabsTrigger value="ALL" className="rounded-xl font-bold px-6 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary shrink-0">All</TabsTrigger>
          <TabsTrigger value="UNREAD" className="rounded-xl font-bold px-6 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary shrink-0">Unread</TabsTrigger>
          <TabsTrigger value="CONTACT_REQUEST" className="rounded-xl font-bold px-6 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary shrink-0">Contacts</TabsTrigger>
          <TabsTrigger value="JOB_APPLICATION" className="rounded-xl font-bold px-6 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary shrink-0">Jobs</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {status === 'pending' ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />)
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center bg-[#f2faf6] rounded-[40px] border-2 border-dashed border-[#8ce5b8]">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bell className="w-8 h-8 text-[#52a37a]" />
            </div>
            <h3 className="text-lg font-bold text-[#0b1a13] mb-1">No notifications</h3>
            <p className="text-[#52a37a] text-sm">You have no notifications in this category.</p>
          </div>
        ) : (
          <>
            {filteredNotifications.map((notif) => (
              <Card 
                key={notif.id} 
                className={`border-[#8ce5b8] rounded-[28px] overflow-hidden shadow-sm transition-all ${notif.isRead ? 'opacity-70 grayscale-[0.2]' : 'bg-white border-l-4 border-l-[#4ccb8c]'}`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-slate-50' : 'bg-[#f2faf6]'}`}>
                      {getIcon(notif.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-[#0b1a13] ${notif.isRead ? 'font-medium' : ''}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-bold text-[#52a37a] flex items-center gap-1 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#2a6f4d] leading-relaxed mb-4">{notif.message}</p>
                      
                      {notif.category === 'CONTACT_REQUEST' && !notif.isRead && (
                        <div className="flex gap-3 mt-2">
                          <Button 
                            size="sm" 
                            className="bg-[#4ccb8c] hover:bg-[#2a6f4d] text-white rounded-xl px-4 font-bold h-9"
                            onClick={() => {
                              const requestId = notif.actionUrl?.split('/').pop();
                              if (requestId) respondMutation.mutate({ id: requestId, status: 'ACCEPTED' });
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-4 font-bold h-9"
                            onClick={() => {
                              const requestId = notif.actionUrl?.split('/').pop();
                              if (requestId) respondMutation.mutate({ id: requestId, status: 'DECLINED' });
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                    {!notif.isRead && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-[#8ce5b8] hover:text-[#4ccb8c]"
                        onClick={() => markReadMutation.mutate(notif.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="border-[#8ce5b8] text-[#0b1a13] font-bold h-12 px-12 rounded-xl"
                >
                  {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load older notifications'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
