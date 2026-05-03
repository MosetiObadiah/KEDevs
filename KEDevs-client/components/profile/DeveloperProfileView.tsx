'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, X, Briefcase, MapPin, CheckCircle2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { SpotlightModal } from '@/components/shared/spotlight-modal';

export function DeveloperProfileView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['developers', 'me'],
    queryFn: profileApi.getMyDeveloperProfile,
  });

  const availabilityMutation = useMutation({
    mutationFn: (status: string) => profileApi.updateAvailability(status as any),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['developers', 'me'] });
      const prev = queryClient.getQueryData(['developers', 'me']);
      queryClient.setQueryData(['developers', 'me'], (old: any) => ({ ...old, availabilityStatus: newStatus }));
      return { prev };
    },
    onError: (err, newStatus, context) => {
      queryClient.setQueryData(['developers', 'me'], context?.prev);
      toast.error('Failed to update availability');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['developers', 'me'] });
      toast.success('Availability updated');
    }
  });

  const visibilityMutation = useMutation({
    mutationFn: (status: string) => profileApi.updateVisibility(status as any),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['developers', 'me'] });
      const prev = queryClient.getQueryData(['developers', 'me']);
      queryClient.setQueryData(['developers', 'me'], (old: any) => ({ ...old, profileVisibility: newStatus }));
      return { prev };
    },
    onError: (err, newStatus, context) => {
      queryClient.setQueryData(['developers', 'me'], context?.prev);
      toast.error('Failed to update visibility');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['developers', 'me'] });
      toast.success('Visibility updated');
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: (skill: string) => profileApi.addSkill({ name: skill, proficiencyLevel: 'INTERMEDIATE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers', 'me'] });
      setNewSkill('');
      toast.success('Skill added');
    },
    onError: () => toast.error('Failed to add skill')
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) => profileApi.removeSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers', 'me'] });
      setSkillToDelete(null);
      toast.success('Skill removed');
    },
    onError: () => toast.error('Failed to remove skill')
  });

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{profile.firstName} {profile.lastName}</h1>
              {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.currentLastRole}</span>
              {profile.locationCity && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.locationCity}, {profile.locationCountry}</span>}
            </div>
            <p className="mt-4 text-white/80 max-w-2xl">{profile.bio}</p>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button onClick={() => setSpotlightOpen(true)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
              <Star className="w-4 h-4 mr-2" /> Buy Spotlight
            </Button>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-primary">Availability</label>
              <Select value={profile.availabilityStatus || ''} onValueChange={(v) => availabilityMutation.mutate(v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE_NOW">Available Now</SelectItem>
                  <SelectItem value="OPEN_TO_OFFERS">Open To Offers</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-primary">Visibility</label>
              <Select value={profile.profileVisibility || ''} onValueChange={(v) => visibilityMutation.mutate(v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Skills & Languages */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: any) => (
                  <Badge key={skill.id} className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent py-1.5 px-3 flex items-center gap-2">
                    {skill.name}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSkillToDelete(skill.id)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill..." className="border-secondary focus:border-primary" />
                <Button onClick={() => addSkillMutation.mutate(newSkill)} disabled={!newSkill || addSkillMutation.isPending} size="icon" className="bg-primary hover:bg-[#2a6f4d] text-white shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projects */}
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Projects</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold">
                  <Plus className="w-3 h-3 mr-1" /> Add Project
                </Button>
              </div>
              
              {profile.projects?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">No projects added yet. Showcase your work!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects?.map((proj: any) => (
                    <div key={proj.id} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors group">
                      <h4 className="font-bold text-foreground">{proj.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20">Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SpotlightModal open={spotlightOpen} onOpenChange={setSpotlightOpen} />
      
      <ConfirmModal 
        open={!!skillToDelete} 
        onOpenChange={(open) => !open && setSkillToDelete(null)}
        title="Delete Skill?"
        description="Are you sure you want to remove this skill from your profile?"
        onConfirm={() => skillToDelete && deleteSkillMutation.mutate(skillToDelete)}
        isPending={deleteSkillMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
