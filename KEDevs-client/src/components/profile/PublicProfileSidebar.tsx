import React from 'react';
import { 
  Send, 
  ThumbsUp, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  GitBranch, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Users,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn, formatWorkType } from '@/lib/utils';

interface PublicProfileSidebarProps {
  profile: any;
  onContact: () => void;
  onFlag: () => void;
  isLoggedIn: boolean;
  isRequesting?: boolean;
}

export function PublicProfileSidebar({ 
  profile, 
  onContact, 
  onFlag,
  isLoggedIn,
  isRequesting 
}: PublicProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {profile.canEmployersReachOut !== false && profile.availabilityStatus !== 'NOT_AVAILABLE' && (
          <Button 
            className="w-full h-14 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
            onClick={onContact}
            disabled={isRequesting}
          >
            <Send className="mr-2 h-5 w-5" />
            {isRequesting ? 'Sending...' : 'Contact Developer'}
          </Button>
        )}
        <Button 
          variant="ghost" 
          className="w-full h-10 rounded-xl font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
          onClick={onFlag}
        >
          <Flag className="mr-2 h-3.5 w-3.5" />
          Report Profile
        </Button>
      </div>

      {/* Connectivity Card */}
      <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
        <CardHeader className="pb-4 px-8 pt-8">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Connectivity</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          {!isLoggedIn ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Sign up to view contact information.</p>
              <Button variant="link" className="text-primary font-bold p-0 h-auto" asChild>
                <Link href="/register">Unlock Full Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Email</p>
                  <p className="text-sm font-bold truncate">{profile.publicEmail || profile.email || 'Not shared'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Phone</p>
                  <p className="text-sm font-bold truncate">{profile.publicPhone || 'Not shared'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border/50">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preferred Work</p>
              <p className="font-bold text-foreground flex items-center gap-2 tracking-wide text-sm">
                <Globe className="h-3.5 w-3.5 text-primary" /> {formatWorkType(profile.preferredWorkType || 'REMOTE')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-border/50 pt-6">
            {profile.linkedinUrl && (
              <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-border/50 hover:bg-muted" asChild>
                <a href={profile.linkedinUrl} target="_blank"><LinkIcon className="h-5 w-5 text-[#0077b5]" /></a>
              </Button>
            )}
            {profile.githubUrl && (
              <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-border/50 hover:bg-muted" asChild>
                <a href={profile.githubUrl} target="_blank"><GitBranch className="h-5 w-5" /></a>
              </Button>
            )}
            {profile.portfolioUrl && (
              <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-border/50 hover:bg-muted" asChild>
                <a href={profile.portfolioUrl} target="_blank"><Globe className="h-5 w-5 text-primary" /></a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Similar Profiles Placeholder */}
      <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
        <CardHeader className="pb-4 px-8 pt-8">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Similar Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
             <div className="text-center py-6 border-2 border-dashed border-border/20 rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground uppercase">Discover More Talent</p>
                <Button variant="link" className="text-primary font-bold h-auto mt-1" asChild>
                  <Link href="/developers">Browse Directory</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
