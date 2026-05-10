import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Layers, 
  ExternalLink, 
  GitBranch, 
  Trophy, 
  Award, 
  GraduationCap, 
  Trash2,
  Code2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

interface ProfileTabsProps {
  profile: any;
  isOwner?: boolean;
  isEditing?: boolean;
  onUpdate?: (data: any) => void;
  onAddSkill?: () => void;
  onAddProject?: () => void;
  onAddEducation?: () => void;
  onAddOSS?: () => void;
  onAddAchievement?: () => void;
  onRemoveItem?: (type: string, id: string) => void;
  onToggleFeatured?: (id: string, current: boolean) => void;
}

export function ProfileTabs({ 
  profile, 
  isOwner,
  isEditing,
  onUpdate,
  onAddSkill,
  onAddProject,
  onAddEducation,
  onAddOSS,
  onAddAchievement,
  onRemoveItem,
  onToggleFeatured
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full border-b rounded-none bg-transparent h-auto p-0 mb-8 justify-start gap-8">
        <TabsTrigger 
          value="overview" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="projects" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
        >
          Projects
        </TabsTrigger>
        <TabsTrigger 
          value="experience" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
        >
          Experience
        </TabsTrigger>
        <TabsTrigger 
          value="oss" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
        >
          OSS & Achievements
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-500">
        <section className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2">
            <div className="h-6 w-1.5 bg-primary rounded-full" />
            Professional Story
          </h3>
          {isEditing ? (
            <Textarea 
              className="min-h-[200px] rounded-2xl border-slate-200 font-medium text-lg focus:border-primary" 
              value={profile.bio || ''} 
              onChange={(e) => onUpdate?.({...profile, bio: e.target.value})} 
              placeholder="Tell your professional story..." 
            />
          ) : (
            <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio || "This developer hasn't added a biography yet."}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              Technical Arsenal
            </h3>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={onAddSkill}>
                <Plus className="w-4 h-4 mr-1" /> Add Skill
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-bold bg-muted/50 border border-border/50 text-foreground group relative">
                {skill}
                {isOwner && (
                  <button 
                    onClick={() => onRemoveItem?.('skill', skill)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!profile.skills?.length && (
              <p className="text-sm text-muted-foreground italic">No skills listed yet.</p>
            )}
          </div>
        </section>
      </TabsContent>
      
      <TabsContent value="projects" className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black flex items-center gap-2">
            <div className="h-6 w-1.5 bg-primary rounded-full" />
            Featured Projects
          </h3>
          {isOwner && (
            <Button size="sm" className="rounded-xl font-bold" onClick={onAddProject}>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {profile.projects?.length > 0 ? (
            profile.projects.map((project: any) => (
              <Card key={project.id} className="group border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden bg-background rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {project.screenshotUrl && (
                    <div className="md:col-span-4 h-48 md:h-auto relative overflow-hidden bg-muted">
                      <img 
                        src={project.screenshotUrl} 
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className={cn("p-8 flex flex-col justify-center", project.screenshotUrl ? "md:col-span-8" : "md:col-span-12")}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black text-foreground">{project.title}</h4>
                      {isOwner && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => onRemoveItem?.('project', project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack?.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px] font-bold uppercase rounded-lg bg-muted/50 border-none px-2">{t}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.projectUrl && (
                        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 border-border/50" asChild>
                          <a href={project.projectUrl} target="_blank"><ExternalLink className="h-3.5 w-3.5" /> Demo</a>
                        </Button>
                      )}
                      {project.repoUrl && (
                        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 border-border/50" asChild>
                          <a href={project.repoUrl} target="_blank"><GitBranch className="h-3.5 w-3.5" /> Source</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-16 text-center border-4 border-dashed border-border/20 rounded-[3rem] bg-background/50">
              <Layers className="h-16 w-16 text-muted/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-black text-lg">No projects showcased yet.</p>
              {isOwner && <p className="text-sm text-muted-foreground mt-2">Showcase your work to impress employers.</p>}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="experience" className="space-y-10 animate-in fade-in duration-500">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              Education
            </h3>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={onAddEducation}>
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {profile.education?.map((edu: any) => (
              <div key={edu.id} className="p-6 rounded-3xl bg-background border border-border/50 flex gap-6 items-start hover:border-primary/20 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black text-foreground truncate">{edu.institution}</h4>
                    {isOwner && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => onRemoveItem?.('education', edu.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-primary">{edu.qualification} • {edu.fieldOfStudy}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{edu.startYear} — {edu.yearCompleted || 'Present'}</p>
                </div>
              </div>
            ))}
            {!profile.education?.length && (
              <p className="text-sm text-muted-foreground italic">No education history added yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              Certifications
            </h3>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={() => onAddEducation}>
                <Plus className="w-4 h-4 mr-1" /> Add Certificate
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.certifications?.map((c: any) => (
              <div key={c.id} className="p-5 rounded-2xl bg-background border border-border/50 flex items-center gap-4 group hover:border-amber-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-amber-500/5 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Award className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate text-sm">{c.name}</h4>
                  <p className="text-muted-foreground font-bold text-[10px] uppercase">{c.issuedBy}</p>
                </div>
                {isOwner && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => onRemoveItem?.('certification', c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {!profile.certifications?.length && (
              <p className="text-sm text-muted-foreground italic col-span-full">No certifications added yet.</p>
            )}
          </div>
        </section>
      </TabsContent>
      
      <TabsContent value="oss" className="space-y-10 animate-in fade-in duration-500">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              OSS Contributions
            </h3>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={onAddOSS}>
                <Plus className="w-4 h-4 mr-1" /> Add Contribution
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.ossContributions?.map((oss: any) => (
              <div key={oss.id} className="p-6 rounded-3xl bg-background border border-border/50 space-y-4 hover:border-primary/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="font-black text-foreground truncate">{oss.projectName}</h4>
                    <p className="text-primary font-bold text-xs uppercase tracking-wider">{oss.role}</p>
                  </div>
                  {isOwner && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => onRemoveItem?.('oss', oss.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">{oss.description}</p>
                {oss.contributionUrl && (
                  <a href={oss.contributionUrl} target="_blank" className="text-primary font-black text-xs inline-flex items-center hover:underline gap-1">
                    View Work <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
            {!profile.ossContributions?.length && (
              <p className="text-sm text-muted-foreground italic col-span-full">No OSS contributions listed yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              Achievements
            </h3>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={onAddAchievement}>
                <Plus className="w-4 h-4 mr-1" /> Add Achievement
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.achievements?.map((ach: any) => (
              <div key={ach.id} className="p-5 rounded-2xl bg-background border border-border/50 flex gap-4 hover:border-amber-200 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-amber-500/5 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-foreground truncate text-sm">{ach.title}</h4>
                    {isOwner && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => onRemoveItem?.('achievement', ach.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">{ach.year}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ach.description}</p>
                </div>
              </div>
            ))}
            {!profile.achievements?.length && (
              <p className="text-sm text-muted-foreground italic col-span-full">No achievements listed yet.</p>
            )}
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
}
