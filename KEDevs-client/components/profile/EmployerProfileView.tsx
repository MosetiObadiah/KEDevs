'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/lib/api/employers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, MapPin, Globe, CheckCircle2, AlertCircle, Bookmark, Search, Star, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CompanySize } from '@/lib/types/user';

export function EmployerProfileView() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    companyName: string;
    industrySector: string;
    locationHQ: string;
    companyWebsite: string;
    about: string;
    companySize: CompanySize;
  }>({
    companyName: '',
    industrySector: '',
    locationHQ: '',
    companyWebsite: '',
    about: '',
    companySize: 'ONE_TO_TEN'
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employers', 'me'],
    queryFn: profileApi.getMyEmployerProfile,
  });

  const updateMutation = useMutation({
    mutationFn: profileApi.updateEmployerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers', 'me'] });
      setIsEditing(false);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile')
  });

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleEditClick = () => {
    setEditData({
      companyName: profile.companyName || '',
      industrySector: profile.industrySector || '',
      locationHQ: profile.locationHQ || '',
      companyWebsite: profile.companyWebsite || '',
      about: profile.about || '',
      companySize: profile.companySize || 'ONE_TO_TEN'
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden relative group">
              {profile.companyLogoUrl ? (
                <img src={profile.companyLogoUrl} alt={profile.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <div className="flex-1 w-full max-w-2xl">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-black">{profile.companyName}</h1>
                <Button variant="ghost" size="icon" onClick={handleEditClick} className="text-white hover:text-primary h-8 w-8">
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                {/* Approval Badge */}
                {!profile.isApproved ? (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold uppercase tracking-widest text-[10px] py-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> Pending Approval
                  </Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px] py-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                  </Badge>
                )}

                {/* Pro Badge */}
                {profile.isProAccount && (
                  <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-transparent font-black uppercase tracking-widest text-[10px] py-1">
                    <Star className="w-3 h-3 mr-1 fill-amber-900" /> PRO
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 bg-white/10 p-4 rounded-xl mt-3 w-full">
                  <Input value={editData.companyName} onChange={e => setEditData({...editData, companyName: e.target.value})} placeholder="Company Name" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                  <div className="flex gap-2">
                    <Input value={editData.industrySector} onChange={e => setEditData({...editData, industrySector: e.target.value})} placeholder="Industry" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                    <Input value={editData.locationHQ} onChange={e => setEditData({...editData, locationHQ: e.target.value})} placeholder="Headquarters Location" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                  </div>
                  <div className="flex gap-2">
                    <Input value={editData.companyWebsite} onChange={e => setEditData({...editData, companyWebsite: e.target.value})} placeholder="Website URL" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                    <Select value={editData.companySize} onValueChange={v => setEditData({...editData, companySize: v as CompanySize})}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white w-1/3">
                        <SelectValue placeholder="Company Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONE_TO_TEN">1-10</SelectItem>
                        <SelectItem value="TEN_TO_FIFTY">10-50</SelectItem>
                        <SelectItem value="FIFTY_TO_TWO_HUNDRED">50-200</SelectItem>
                        <SelectItem value="TWO_HUNDRED_PLUS">200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-white hover:text-white/80">Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-[#2a6f4d] text-white">Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium mt-3 text-white/80">
                  {profile.industrySector && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {profile.industrySector}</span>}
                  {profile.locationHQ && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.locationHQ}</span>}
                  {profile.companyWebsite && <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Globe className="w-4 h-4" /> Website</a>}
                  {profile.companySize && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {profile.companySize.replace(/_/g, ' ')} Employees</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button 
              className={`w-full font-bold ${!profile.isApproved ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-[#2a6f4d] text-white'}`}
              disabled={!profile.isApproved}
              onClick={() => toast.info('Job posting modal will be available here')}
            >
              Post a Job
            </Button>
            {!profile.isProAccount && (
              <Link href="/payments">
                <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold">
                  Upgrade to PRO
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-foreground uppercase tracking-tight">About Company</h3>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={handleEditClick} className="text-primary hover:bg-primary/10">
                    <Edit2 className="w-4 h-4 mr-1" /> Edit Bio
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea 
                    value={editData.about} 
                    onChange={e => setEditData({...editData, about: e.target.value})} 
                    placeholder="Tell developers about your company, mission, and tech culture..." 
                    className="min-h-[150px] border-secondary focus:border-primary" 
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>Save Bio</Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.about || "No bio provided yet. Edit your profile to add a description of your company."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/employers/bookmarks" className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${profile.isProAccount ? 'border-secondary hover:border-primary bg-white' : 'border-dashed border-secondary bg-secondary/10 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <Bookmark className={`w-5 h-5 ${profile.isProAccount ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-foreground">Bookmarks & Requests</span>
                  </div>
                  {!profile.isProAccount && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
                </Link>

                <Link href="/employers/saved-searches" className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${profile.isProAccount ? 'border-secondary hover:border-primary bg-white' : 'border-dashed border-secondary bg-secondary/10 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <Search className={`w-5 h-5 ${profile.isProAccount ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-foreground">Saved Searches</span>
                  </div>
                  {!profile.isProAccount && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
