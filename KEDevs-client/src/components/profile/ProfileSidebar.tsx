import React, { useState } from 'react';
import { 
  Eye, 
  BadgeCheck, 
  Link as LinkIcon, 
  GitBranch, 
  Globe, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  HeadphonesIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactSupportDialog } from '@/components/shared/ContactSupportDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSidebarProps {
  profile: any;
  editingSection?: string | null;
  onEditSection?: (section: string | null) => void;
  onSaveSection?: (section: string) => void;
  isSaving?: boolean;
  onUpdate?: (data: any) => void;
  onBuySpotlight: () => void;
  onVerifyIdentity: () => void;
}

export function ProfileSidebar({ 
  profile, 
  editingSection,
  onEditSection,
  onSaveSection,
  isSaving,
  onUpdate,
  onBuySpotlight, 
  onVerifyIdentity 
}: ProfileSidebarProps) {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card className="rounded-xl-[2rem] border-border/50 shadow-sm overflow-hidden bg-background">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-medium group" onClick={onVerifyIdentity}>
            <ShieldCheck className="w-4 h-4 mr-3 text-cyan-600 group-hover:scale-110 transition-transform" />
            Verify Identity
          </Button>
          <button
            onClick={() => setSupportOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-sm"
          >
            <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Contact Support</span>
          </button>
        </CardContent>
      </Card>
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />

      {/* Connectivity Card */}
      <Card className="rounded-xl-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-background">
        <CardHeader className="pb-4 px-8 pt-8 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Connectivity</CardTitle>
          {editingSection === null ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEditSection?.('contact')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </Button>
          ) : editingSection === 'contact' ? (
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onEditSection?.(null)} disabled={isSaving}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onSaveSection?.('contact')} disabled={isSaving}>
                <ShieldCheck className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          {editingSection === 'contact' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Public Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={profile.publicEmail || ''} 
                    onChange={(e) => onUpdate?.({...profile, publicEmail: e.target.value})}
                    placeholder="Email for employers to contact you"
                    className="h-10 rounded-xl border-slate-200 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Public Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={profile.publicPhone || ''} 
                    onChange={(e) => onUpdate?.({...profile, publicPhone: e.target.value})}
                    placeholder="Phone number for contact"
                    className="h-10 rounded-xl border-slate-200 pl-10"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic px-1">
                These details will be visible to logged-in employers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{profile.publicEmail || profile.email || 'Not shared'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium truncate">{profile.publicPhone || 'Not shared'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Links Card */}
      <Card className="rounded-xl-[2rem] border-border/50 shadow-sm overflow-hidden bg-background">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Personal Links</CardTitle>
          {editingSection === null ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEditSection?.('links')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </Button>
          ) : editingSection === 'links' ? (
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onEditSection?.(null)} disabled={isSaving}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onSaveSection?.('links')} disabled={isSaving}>
                <ShieldCheck className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'links' ? (
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">LinkedIn URL</Label>
                  <Input 
                    value={profile.linkedinUrl || ''} 
                    onChange={(e) => onUpdate?.({...profile, linkedinUrl: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                    className="h-10 rounded-xl border-slate-200"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GitHub URL</Label>
                  <Input 
                    value={profile.githubUrl || ''} 
                    onChange={(e) => onUpdate?.({...profile, githubUrl: e.target.value})}
                    placeholder="https://github.com/..."
                    className="h-10 rounded-xl border-slate-200"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Portfolio URL</Label>
                  <Input 
                    value={profile.portfolioUrl || ''} 
                    onChange={(e) => onUpdate?.({...profile, portfolioUrl: e.target.value})}
                    placeholder="https://yourportfolio.com"
                    className="h-10 rounded-xl border-slate-200"
                  />
               </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.linkedinUrl ? (
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-medium group" asChild>
                  <a href={profile.linkedinUrl} target="_blank">
                    <LinkIcon className="w-4 h-4 mr-3 text-[#0077b5]" />
                    LinkedIn
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-muted-foreground/30" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No LinkedIn profile added.</p>
              )}
              
              {profile.githubUrl ? (
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-medium group" asChild>
                  <a href={profile.githubUrl} target="_blank">
                    <GitBranch className="w-4 h-4 mr-3 text-foreground" />
                    GitHub
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-muted-foreground/30" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No GitHub profile added.</p>
              )}

              {profile.portfolioUrl ? (
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-medium group" asChild>
                  <a href={profile.portfolioUrl} target="_blank">
                    <Globe className="w-4 h-4 mr-3 text-primary" />
                    Portfolio
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-muted-foreground/30" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No portfolio link added.</p>
              )}
            </div>
          )}
        </CardContent>
        <div className="px-8 pb-8 pt-2 border-t border-border/50 mx-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preferred Work</p>
            <p className="font-medium text-foreground flex items-center gap-2 uppercase tracking-tight text-xs">
              <Globe className="h-3.5 w-3.5 text-primary" /> {profile.preferredWorkType || 'REMOTE'}
            </p>
          </div>
        </div>
      </Card>

      {/* Spotlight Card */}
      <Card className="rounded-xl-[2.5rem] border-azure-100 bg-azure-50/50 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-azure-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-azure-500/20 transition-all pointer-events-none" />
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-azure-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-warning-900 leading-tight">Get Spotlight</h3>
              <p className="text-xs font-medium text-azure-700 leading-relaxed">
                Boost your reach. Get featured on the homepage and attract up to <span className="font-medium">10x more</span> views.
              </p>
            </div>
          </div>
          <Button className="w-full h-12 rounded-xl font-black bg-azure-500 hover:bg-azure-500 text-white shadow-lg shadow-amber-500/20" onClick={onBuySpotlight}>
            Boost Profile Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
