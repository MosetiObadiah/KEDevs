'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function BookmarksAndContactsPage() {
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['employers', 'bookmarks'],
    queryFn: profileApi.getBookmarks,
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['employers', 'contacts'],
    queryFn: profileApi.getContactRequests,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Hiring Pipeline</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your bookmarked talent and active conversations</p>
      </div>

      <Tabs defaultValue="bookmarked" className="space-y-8">
        <TabsList className="bg-white border border-secondary rounded-2xl h-14 p-1.5 shadow-sm w-full md:w-auto">
          <TabsTrigger value="bookmarked" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary flex-1 md:flex-none">
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmarked
          </TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary flex-1 md:flex-none">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarked" className="outline-none">
          {isLoadingBookmarks ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : bookmarks?.length === 0 ? (
            <EmptyState 
              icon={<Bookmark className="w-10 h-10 text-muted-foreground" />}
              title="No bookmarks yet"
              description="Save developers you like while browsing the directory to see them here."
              action={<Link href="/developers"><Button className="bg-primary hover:bg-[#2a6f4d] text-white rounded-xl font-bold">Browse Developers</Button></Link>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks?.map((bookmark: any) => (
                <Card key={bookmark.id} className="border-secondary rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-foreground text-lg">{bookmark.developerName}</h3>
                      <Badge className="bg-secondary/10 text-muted-foreground border-transparent font-bold text-[10px]">
                        Saved {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/developers/${bookmark.developerId}`} className="flex-1">
                        <Button variant="outline" className="w-full border-secondary rounded-xl font-bold h-10">
                          View Profile
                        </Button>
                      </Link>
                      <Button variant="ghost" className="rounded-xl h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Bookmark className="w-5 h-5 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="outline-none">
          {isLoadingContacts ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : contacts?.length === 0 ? (
            <EmptyState 
              icon={<MessageSquare className="w-10 h-10 text-muted-foreground" />}
              title="No contact requests"
              description="When you reach out to developers, your active requests will appear here."
            />
          ) : (
            <div className="space-y-4">
              {contacts?.map((req: any) => (
                <Card key={req.id} className="border-secondary rounded-3xl overflow-hidden shadow-sm bg-white">
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Developer ID: {req.developerId.substring(0, 8)}...</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{req.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-bold">
                          <Clock className="w-3 h-3" />
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                        <Badge 
                          title={req.status === 'PENDING' ? 'Waiting for developer to respond' : ''}
                          className={`
                            ${req.status === 'ACCEPTED' ? 'bg-primary/20 text-primary border-primary/30' : 
                              req.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                              'bg-slate-100 text-slate-500 border-slate-200'}
                            px-3 py-1 rounded-full font-black text-[10px] tracking-widest border
                          `}
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <Link href={`/developers/${req.developerId}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon, title, description, action }: any) {
  return (
    <div className="py-20 text-center bg-secondary/10 rounded-[40px] border-2 border-dashed border-secondary flex flex-col items-center">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">{description}</p>
      {action}
    </div>
  );
}
