'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '@/lib/api/developers';
import * as spotlightApi from '@/lib/api/spotlight';
import { useAuth } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, X, Briefcase, MapPin, CheckCircle2, Star, Edit2, Upload, Crown, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { SpotlightModal } from '@/components/shared/spotlight-modal';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export function DeveloperProfileView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  
  // State for forms
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ bio: '', locationCity: '', locationCountry: '', currentLastRole: '' });
  
  // Inline forms state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectData, setProjectData] = useState({ title: '', description: '', techStack: '', projectUrl: '', repoUrl: '' });
  
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduData, setEduData] = useState({ institution: '', degree: '', fieldOfStudy: '', startYear: 2020, current: true });
  
  const [showCertForm, setShowCertForm] = useState(false);
  const [certData, setCertData] = useState({ name: '', issuer: '', issuedDate: new Date().toISOString() });
  
  const [showOssForm, setShowOssForm] = useState(false);
  const [ossData, setOssData] = useState({ projectName: '', repoUrl: '', description: '', role: '' });
  
  const [showAchieveForm, setShowAchieveForm] = useState(false);
  const [achieveData, setAchieveData] = useState({ title: '', description: '', date: new Date().toISOString() });

  // Deletion modals state
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['developers', 'me'],
    queryFn: profileApi.getMyDeveloperProfile,
  });

  const { data: spotlightStatus } = useQuery({
    queryKey: ['spotlight', 'me'],
    queryFn: spotlightApi.getMySpotlightStatus,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['developers', 'me'] });

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateDeveloperProfile,
    onSuccess: () => {
      invalidate();
      setIsEditingBio(false);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile')
  });

  const availabilityMutation = useMutation({
    mutationFn: (status: string) => profileApi.updateAvailability(status),
    onSuccess: () => { invalidate(); toast.success('Availability updated'); },
    onError: () => toast.error('Failed to update availability')
  });

  const visibilityMutation = useMutation({
    mutationFn: (status: string) => profileApi.updateVisibility(status),
    onSuccess: () => { invalidate(); toast.success('Visibility updated'); },
    onError: () => toast.error('Failed to update visibility')
  });

  // -- Add/Remove Mutations
  const addSkillMutation = useMutation({
    mutationFn: profileApi.addSkill,
    onSuccess: () => { invalidate(); setNewSkill(''); toast.success('Skill added'); }
  });
  const deleteSkillMutation = useMutation({
    mutationFn: profileApi.deleteSkill,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Skill removed'); }
  });

  const addLanguageMutation = useMutation({
    mutationFn: profileApi.addLanguage,
    onSuccess: () => { invalidate(); setNewLanguage(''); toast.success('Language added'); }
  });
  const deleteLanguageMutation = useMutation({
    mutationFn: profileApi.deleteLanguage,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Language removed'); }
  });

  const addProjectMutation = useMutation({
    mutationFn: profileApi.addProject,
    onSuccess: () => { 
      invalidate(); 
      setShowProjectForm(false);
      setProjectData({ title: '', description: '', techStack: '', projectUrl: '', repoUrl: '' });
      toast.success('Project added'); 
    }
  });
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => profileApi.updateProject(id, data),
    onSuccess: () => { invalidate(); toast.success('Project updated'); }
  });
  const deleteProjectMutation = useMutation({
    mutationFn: profileApi.deleteProject,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Project removed'); }
  });
  const uploadScreenshotMutation = useMutation({
    mutationFn: ({ id, file }: { id: string, file: File }) => profileApi.uploadProjectScreenshot(id, file),
    onSuccess: () => { invalidate(); toast.success('Screenshot uploaded'); },
    onError: () => toast.error('Upload failed')
  });

  const addEducationMutation = useMutation({
    mutationFn: profileApi.addEducation,
    onSuccess: () => { invalidate(); setShowEduForm(false); toast.success('Education added'); }
  });
  const deleteEducationMutation = useMutation({
    mutationFn: profileApi.deleteEducation,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Education removed'); }
  });

  const addCertMutation = useMutation({
    mutationFn: profileApi.addCertification,
    onSuccess: () => { invalidate(); setShowCertForm(false); toast.success('Certification added'); }
  });
  const deleteCertMutation = useMutation({
    mutationFn: profileApi.deleteCertification,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Certification removed'); }
  });

  const addOssMutation = useMutation({
    mutationFn: profileApi.addOssContribution,
    onSuccess: () => { invalidate(); setShowOssForm(false); toast.success('OSS Contribution added'); }
  });
  const deleteOssMutation = useMutation({
    mutationFn: profileApi.deleteOssContribution,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('OSS Contribution removed'); }
  });

  const addAchievementMutation = useMutation({
    mutationFn: profileApi.addAchievement,
    onSuccess: () => { invalidate(); setShowAchieveForm(false); toast.success('Achievement added'); }
  });
  const deleteAchievementMutation = useMutation({
    mutationFn: profileApi.deleteAchievement,
    onSuccess: () => { invalidate(); setItemToDelete(null); toast.success('Achievement removed'); }
  });

  if (isLoading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleEditBioClick = () => {
    setEditProfileData({
      bio: profile.bio || '',
      locationCity: profile.locationCity || '',
      locationCountry: profile.locationCountry || '',
      currentLastRole: profile.currentLastRole || ''
    });
    setIsEditingBio(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    if (type === 'skill') deleteSkillMutation.mutate(id);
    if (type === 'language') deleteLanguageMutation.mutate(id);
    if (type === 'project') deleteProjectMutation.mutate(id);
    if (type === 'education') deleteEducationMutation.mutate(id);
    if (type === 'cert') deleteCertMutation.mutate(id);
    if (type === 'oss') deleteOssMutation.mutate(id);
    if (type === 'achievement') deleteAchievementMutation.mutate(id);
  };

  const handleFileChange = (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadScreenshotMutation.mutate({ id: projectId, file });
    }
  };

  return (
    <div className="space-y-8">
      {/* Spotlight Active Banner */}
      {spotlightStatus && spotlightStatus.isActive && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Dev of the {spotlightStatus.type === 'DAY' ? 'Day' : 'Week'}</h3>
              <p className="text-sm text-white/90">Your profile is currently featured until {new Date(spotlightStatus.endDate).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-[#0b1a13] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{profile.firstName} {profile.lastName}</h1>
              {profile.isVerified ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <Link href="/verification">
                  <Badge variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 cursor-pointer">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Get Verified
                  </Badge>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleEditBioClick} className="text-white hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
            </div>
            
            {isEditingBio ? (
              <div className="space-y-3 max-w-2xl bg-white/10 p-4 rounded-xl mt-2">
                <Input value={editProfileData.currentLastRole} onChange={e => setEditProfileData({...editProfileData, currentLastRole: e.target.value})} placeholder="Current Role" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                <div className="flex gap-2">
                  <Input value={editProfileData.locationCity} onChange={e => setEditProfileData({...editProfileData, locationCity: e.target.value})} placeholder="City" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                  <Input value={editProfileData.locationCountry} onChange={e => setEditProfileData({...editProfileData, locationCountry: e.target.value})} placeholder="Country" className="bg-white/20 text-white placeholder:text-white/50 border-white/30" />
                </div>
                <Textarea value={editProfileData.bio} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} placeholder="Bio" className="bg-white/20 text-white placeholder:text-white/50 border-white/30 min-h-[100px]" />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setIsEditingBio(false)} className="text-white">Cancel</Button>
                  <Button onClick={() => updateProfileMutation.mutate(editProfileData)} disabled={updateProfileMutation.isPending} className="bg-primary hover:bg-[#2a6f4d] text-white">Save</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 text-muted-foreground font-medium text-white/80">
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.currentLastRole || 'Developer'}</span>
                  {profile.locationCity && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.locationCity}, {profile.locationCountry}</span>}
                </div>
                <p className="mt-4 text-white/80 max-w-2xl">{profile.bio || 'Add a bio...'}</p>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            {(!spotlightStatus || !spotlightStatus.isActive) && profile.isVerified && (
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={() => setSpotlightOpen(true)}>
                <Star className="w-4 h-4 mr-2" /> Buy Spotlight
              </Button>
            )}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-primary">Availability</label>
              <Select value={profile.availabilityStatus || ''} onValueChange={(v) => availabilityMutation.mutate(v as string)}>
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
              <Select value={profile.profileVisibility || ''} onValueChange={(v) => visibilityMutation.mutate(v as string)}>
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
                {profile.skills?.map((skill: any, index: number) => (
                  <Badge key={skill.id || skill.name || `skill-${index}`} className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent py-1.5 px-3 flex items-center gap-2">
                    {skill.name || skill.skill || skill}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setItemToDelete({ id: skill.id || skill.name || skill.skill || skill, type: 'skill' })} />
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

          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-foreground uppercase tracking-tight">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map((lang: any, index: number) => (
                  <Badge key={lang.id || lang.language || `lang-${index}`} className="bg-secondary/10 text-foreground hover:bg-secondary/20 border-transparent py-1.5 px-3 flex items-center gap-2">
                    {lang.language || lang}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setItemToDelete({ id: lang.id || lang.language || lang, type: 'language' })} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Input value={newLanguage} onChange={e => setNewLanguage(e.target.value)} placeholder="Add language..." className="border-secondary focus:border-primary" />
                <Button onClick={() => addLanguageMutation.mutate(newLanguage)} disabled={!newLanguage || addLanguageMutation.isPending} size="icon" className="bg-primary hover:bg-[#2a6f4d] text-white shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Endorsements summary */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-4 flex items-center justify-between">
                Endorsements
                <Badge variant="secondary" className="bg-primary/10 text-primary">{profile.endorsementCount || 0}</Badge>
              </h3>
              <div className="space-y-3">
                {(!profile.endorsements || profile.endorsements.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No endorsements yet.</p>
                ) : (
                  profile.endorsements.map((end: any) => (
                    <div key={end.id} className="p-3 bg-secondary/10 rounded-xl text-sm">
                      <p className="text-foreground italic">"{end.content}"</p>
                      <p className="text-muted-foreground font-bold text-xs mt-2">- {end.authorName}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projects, Education, etc */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Projects */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Projects</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold" onClick={() => setShowProjectForm(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add Project
                </Button>
              </div>

              {showProjectForm && (
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 mb-4">
                  <h4 className="font-bold text-sm">New Project</h4>
                  <Input placeholder="Project Title" value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} />
                  <Textarea placeholder="Description" value={projectData.description} onChange={e => setProjectData({...projectData, description: e.target.value})} />
                  <Input placeholder="Tech Stack (comma separated)" value={projectData.techStack} onChange={e => setProjectData({...projectData, techStack: e.target.value})} />
                  <div className="flex gap-2">
                    <Input placeholder="Live URL (e.g. https://...)" value={projectData.projectUrl} onChange={e => setProjectData({...projectData, projectUrl: e.target.value})} />
                    <Input placeholder="Repo URL (e.g. https://github.com/...)" value={projectData.repoUrl} onChange={e => setProjectData({...projectData, repoUrl: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowProjectForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => addProjectMutation.mutate(projectData)} disabled={!projectData.title || addProjectMutation.isPending}>Save</Button>
                  </div>
                </div>
              )}
              
              {(!profile.projects || profile.projects.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">No projects added yet. Showcase your work!</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {profile.projects?.map((proj: any, index: number) => (
                    <div key={proj.id || `proj-${index}`} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors group flex gap-4">
                      {proj.screenshotUrl ? (
                        <img src={proj.screenshotUrl} alt={proj.title} className="w-32 h-24 object-cover rounded-xl border border-secondary shrink-0" />
                      ) : (
                        <div className="w-32 h-24 bg-secondary/20 rounded-xl border border-secondary shrink-0 flex items-center justify-center flex-col gap-1 text-muted-foreground cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => fileInputRefs.current[proj.id]?.click()}>
                          <Upload className="w-5 h-5" />
                          <span className="text-[10px] font-bold">Add Image</span>
                          <input type="file" className="hidden" accept="image/*" ref={el => { fileInputRefs.current[proj.id] = el; }} onChange={(e) => handleFileChange(proj.id, e)} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-foreground">{proj.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">Featured</span>
                            <Switch 
                              checked={proj.isFeatured} 
                              disabled={!proj.projectUrl || !proj.screenshotUrl}
                              onCheckedChange={(c) => updateProjectMutation.mutate({ id: proj.id, data: { isFeatured: c } })} 
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete({ id: proj.id, type: 'project' })}><X className="w-3 h-3" /></Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                        <p className="text-xs text-primary font-medium mt-1">{proj.techStack}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Live Link</a>}
                          {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Repository</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Education */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Education</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold" onClick={() => setShowEduForm(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {showEduForm && (
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 mb-4">
                  <Input placeholder="Institution" value={eduData.institution} onChange={e => setEduData({...eduData, institution: e.target.value})} />
                  <div className="flex gap-2">
                    <Input placeholder="Degree" value={eduData.degree} onChange={e => setEduData({...eduData, degree: e.target.value})} />
                    <Input placeholder="Field of Study" value={eduData.fieldOfStudy} onChange={e => setEduData({...eduData, fieldOfStudy: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowEduForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => addEducationMutation.mutate({ ...eduData, qualification: eduData.degree + ' in ' + eduData.fieldOfStudy, yearCompleted: eduData.startYear + 4, isCertification: false })} disabled={!eduData.institution}>Save</Button>
                  </div>
                </div>
              )}

              {(!profile.education || profile.education.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground text-sm font-medium">No education added yet.</div>
              ) : (
                <div className="space-y-4">
                  {profile.education?.map((edu: any, index: number) => (
                    <div key={edu.id || `edu-${index}`} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{edu.institution}</h4>
                        <p className="text-sm text-muted-foreground">{edu.degree} in {edu.fieldOfStudy} {edu.qualification}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20" onClick={() => setItemToDelete({ id: edu.id, type: 'education' })}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Certifications</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold" onClick={() => setShowCertForm(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {showCertForm && (
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 mb-4">
                  <Input placeholder="Certification Name" value={certData.name} onChange={e => setCertData({...certData, name: e.target.value})} />
                  <Input placeholder="Issuing Organization" value={certData.issuer} onChange={e => setCertData({...certData, issuer: e.target.value})} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCertForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => addCertMutation.mutate({ ...certData, issuedBy: certData.issuer, yearIssued: 2024 })} disabled={!certData.name}>Save</Button>
                  </div>
                </div>
              )}

              {(!profile.certifications || profile.certifications.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground text-sm font-medium">No certifications added yet.</div>
              ) : (
                <div className="space-y-4">
                  {profile.certifications?.map((cert: any, index: number) => (
                    <div key={cert.id || `cert-${index}`} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer || cert.issuedBy}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20" onClick={() => setItemToDelete({ id: cert.id, type: 'cert' })}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* OSS Contributions */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Open Source</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold" onClick={() => setShowOssForm(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {showOssForm && (
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 mb-4">
                  <Input placeholder="Project Name" value={ossData.projectName} onChange={e => setOssData({...ossData, projectName: e.target.value})} />
                  <Input placeholder="Role / Contribution" value={ossData.role} onChange={e => setOssData({...ossData, role: e.target.value})} />
                  <Input placeholder="URL (PR/Issue/Repo)" value={ossData.repoUrl} onChange={e => setOssData({...ossData, repoUrl: e.target.value})} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowOssForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => addOssMutation.mutate({ projectName: ossData.projectName, description: ossData.role, contributionUrl: ossData.repoUrl })} disabled={!ossData.projectName}>Save</Button>
                  </div>
                </div>
              )}

              {(!profile.ossContributions || profile.ossContributions.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground text-sm font-medium">No OSS contributions added yet.</div>
              ) : (
                <div className="space-y-4">
                  {profile.ossContributions?.map((oss: any, index: number) => (
                    <div key={oss.id || `oss-${index}`} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{oss.projectName}</h4>
                        <p className="text-sm text-muted-foreground">{oss.description || oss.role}</p>
                        {oss.contributionUrl && <a href={oss.contributionUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Link</a>}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20" onClick={() => setItemToDelete({ id: oss.id, type: 'oss' })}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase tracking-tight">Achievements</h3>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white h-8 text-xs font-bold" onClick={() => setShowAchieveForm(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {showAchieveForm && (
                <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 mb-4">
                  <Input placeholder="Achievement Title" value={achieveData.title} onChange={e => setAchieveData({...achieveData, title: e.target.value})} />
                  <Textarea placeholder="Description" value={achieveData.description} onChange={e => setAchieveData({...achieveData, description: e.target.value})} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAchieveForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => addAchievementMutation.mutate({ title: achieveData.title, description: achieveData.description, year: 2024 })} disabled={!achieveData.title}>Save</Button>
                  </div>
                </div>
              )}

              {(!profile.achievements || profile.achievements.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground text-sm font-medium">No achievements added yet.</div>
              ) : (
                <div className="space-y-4">
                  {profile.achievements?.map((ach: any, index: number) => (
                    <div key={ach.id || `ach-${index}`} className="p-4 rounded-2xl border border-secondary bg-white hover:border-primary transition-colors flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{ach.title}</h4>
                        <p className="text-sm text-muted-foreground">{ach.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20" onClick={() => setItemToDelete({ id: ach.id, type: 'achievement' })}>Delete</Button>
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
        open={!!itemToDelete} 
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={`Delete ${itemToDelete?.type}?`}
        description={`Are you sure you want to remove this ${itemToDelete?.type} from your profile?`}
        onConfirm={handleConfirmDelete}
        isPending={deleteSkillMutation.isPending || deleteLanguageMutation.isPending || deleteProjectMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
