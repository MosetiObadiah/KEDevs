'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import {
  Edit2,
  Save,
  Globe,
  CheckCircle2,
  Zap,
  Plus,
  Trash2,
  GraduationCap,
  Award,
  Code2,
  Trophy,
  Star,
  Camera,
  Upload,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Eye,
  Building2,
  Users2,
  Loader2,
  X,
  ShieldCheck,
  Briefcase,
  BadgeCheck,
  User
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';
import { spotlightService } from '@/services/spotlightService';
import { KENYA_COUNTIES, INDUSTRIES } from '@/lib/constants';
import BuySpotlightDialog from '@/components/profile/BuySpotlightDialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { cn, formatExperience, formatCompanySize, formatDateString } from '@/lib/utils';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';

const COMMON_SKILLS = [
  'React', 'Java', 'Docker', 'Node.js', 'Python', 'TypeScript', 'Spring Boot', 'AWS',
  'PostgreSQL', 'MongoDB', 'Next.js', 'Flutter', 'Kubernetes', 'GraphQL', 'TailWind CSS',
  'Material UI', 'Redux', 'Go', 'Rust', 'C++', 'C#', 'Angular', 'Vue.js', 'Swift',
  'Kotlin', 'PHP', 'Laravel', 'Symfony', 'Django', 'Flask', 'Express', 'NestJS',
  'MySQL', 'Redis', 'Elasticsearch', 'Terraform', 'Jenkins', 'Git', 'GitHub Actions',
  'Figma', 'Adobe XD', 'Unity', 'Unreal Engine', 'TensorFlow', 'PyTorch'
];

const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      canvas.width = 250;
      canvas.height = 250;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        250,
        250
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    image.onerror = (err) => reject(err);
  });
};

export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    id: '',
    firstName: '',
    lastName: '',
    bio: '',
    currentLastRole: '',
    yearsOfExperience: 'ZERO_TO_ONE',
    availabilityStatus: 'OPEN_TO_OFFERS',
    preferredWorkType: 'REMOTE',
    locationCity: '',
    locationCountry: '',
    profileVisibility: 'PUBLIC',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    publicEmail: '',
    publicPhone: '',
    skills: [],
    languages: [],
    education: [],
    certifications: [],
    ossContributions: [],
    achievements: [],
    projects: [],
    isVerified: false,
    contactPersonName: '',
    contactEmail: '',
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: 'TEN_TO_FIFTY',
    locationHQ: '',
    companyBio: '',
    logoUrl: '',
    twitterUrl: '',
    profilePhoto: ''
  });

  const [spotlightStatus, setSpotlightStatus] = useState<any>(null);
  const [buySpotlightOpen, setBuySpotlightOpen] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [techInputValue, setTechInputValue] = useState('');

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile(true);
    if (user?.role === 'DEVELOPER') {
      fetchSpotlightStatus();
      if (searchParams.get('buySpotlight') === 'true') {
        setBuySpotlightOpen(true);
      }
    }
  }, [searchParams]);

  const fetchSpotlightStatus = async () => {
    try {
      const response = await spotlightService.getMyStatus();
      if (response.success) {
        setSpotlightStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch spotlight status', err);
    }
  };

  const loadProfile = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsRefreshing(true);

    setError(null);
    try {
      const response = user?.role === 'EMPLOYER'
        ? await employerService.getMyProfile()
        : await developerService.getMyProfile();
      if (response.success) {
        setProfile({
          ...response.data,
          preferredWorkType: response.data.preferredWorkType || 'REMOTE'
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to load profile.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateBasicInfo = async () => {
    setIsSaving(true);
    try {
      const isEmp = user?.role === 'EMPLOYER';
      const payload = isEmp
        ? {
          contactPersonName: profile.contactPersonName || user?.fullName || 'Employer',
          companyName: profile.companyName,
          companyWebsite: profile.companyWebsite,
          industry: profile.industry,
          companySize: profile.companySize || 'TEN_TO_FIFTY',
          locationHQ: profile.locationHQ,
          companyBio: profile.companyBio,
          logoUrl: profile.logoUrl,
          linkedinUrl: profile.linkedinUrl,
          twitterUrl: profile.twitterUrl,
          contactEmail: profile.contactEmail,
        }
        : {
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          currentLastRole: profile.currentLastRole,
          yearsOfExperience: profile.yearsOfExperience,
          preferredWorkType: profile.preferredWorkType,
          locationCity: profile.locationCity,
          locationCountry: profile.locationCountry,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl,
          publicEmail: profile.publicEmail,
          publicPhone: profile.publicPhone,
        };

      const response = isEmp
        ? await employerService.updateProfile(payload)
        : await developerService.updateProfile(payload);

      if (response.success) {
        setIsEditing(false);
        setProfile({ ...profile, ...response.data });
        toast.success('Profile updated successfully');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (status: string) => {
    try {
      await developerService.updateAvailability({ availabilityStatus: status });
      setProfile({ ...profile, availabilityStatus: status });
      toast.success(`Availability set to ${status.replace(/_/g, ' ')}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update availability');
    }
  };

  const handleToggleVisibility = async (visibility: string) => {
    try {
      await developerService.updateVisibility({ profileVisibility: visibility });
      setProfile({ ...profile, profileVisibility: visibility });
      toast.success(`Visibility set to ${visibility}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update visibility');
    }
  };

  const openAddDialog = (type: string) => {
    let initialNewItem = {};
    if (type === 'project') initialNewItem = { isFeatured: false };
    if (type === 'education') initialNewItem = { isCertification: false };

    setNewItem(initialNewItem);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDialogOpen(type);
  };

  const closeDialog = () => {
    setDialogOpen(null);
    setNewItem({});
    setSelectedFile(null);
    setPreviewUrl(null);
    setTechInputValue('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddItem = async (type: string) => {
    try {
      setIsSaving(true);
      switch (type) {
        case 'skill':
          await developerService.addSkill(newItem.skill);
          break;
        case 'language':
          await developerService.addLanguage(newItem.language);
          break;
        case 'education':
          await developerService.addEducation({
            ...newItem,
            isCertification: newItem.isCertification || false
          });
          break;
        case 'certification':
          await developerService.addCertification(newItem);
          break;
        case 'oss':
          await developerService.addOSS(newItem);
          break;
        case 'achievement':
          await developerService.addAchievement(newItem);
          break;
        case 'project':
          if (newItem.isFeatured) {
            if (!selectedFile) {
              toast.error('A project screenshot is required to feature this project.');
              setIsSaving(false);
              return;
            }
            if (!newItem.projectUrl) {
              toast.error('A Live URL is required to feature this project.');
              setIsSaving(false);
              return;
            }
          }
          await developerService.addProject({
            ...newItem,
            isFeatured: newItem.isFeatured || false
          }, selectedFile || undefined);
          break;
      }
      loadProfile(false);
      closeDialog();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to add item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = async (type: string, identifier: string) => {
    if (!confirm('Are you sure you want to remove this?')) return;
    try {
      setIsRefreshing(true);
      switch (type) {
        case 'skill':
          await developerService.removeSkill(identifier);
          break;
        case 'language':
          await developerService.removeLanguage(identifier);
          break;
        case 'education':
          await developerService.deleteEducation(identifier);
          break;
        case 'certification':
          await developerService.deleteCertification(identifier);
          break;
        case 'oss':
          await developerService.deleteOSS(identifier);
          break;
        case 'achievement':
          await developerService.deleteAchievement(identifier);
          break;
        case 'project':
          await developerService.deleteProject(identifier);
          break;
        case 'endorsement':
          await developerService.deleteEndorsement(identifier);
          break;
      }
      loadProfile(false);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed`);
    } catch (err) {
      console.error('Failed to remove item', err);
      toast.error('Failed to remove item');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    if (!currentFeatured) {
      const project = profile.projects.find((p: any) => p.id === projectId);
      if (project && (!project.projectUrl || !project.screenshotUrl)) {
        toast.error('A project screenshot and Live URL are required to feature this project.');
        return;
      }
    }
    try {
      setIsRefreshing(true);
      await developerService.toggleFeaturedProject(projectId, !currentFeatured);
      toast.success(!currentFeatured ? 'Project featured!' : 'Project unfeatured');
      loadProfile(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (type: string, id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      if (type === 'project') {
        await developerService.uploadProjectScreenshot(id, file);
      } else if (type === 'certification') {
        await developerService.uploadCertificationImage(id, file);
      }
      loadProfile(false);
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-xl font-medium text-muted-foreground animate-pulse">Curating your professional story...</p>
      </div>
    );
  }

  const isEmployer = user?.role === 'EMPLOYER';

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 pt-8 pb-12">
        {/* Header Actions */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-3">
            <Button
              size="lg"
              className={cn(
                "rounded-xl font-medium px-8 h-12 shadow-xl transition-all",
                isEmployer
                  ? "bg-cyan-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white"
                  : (isEditing ? "bg-primary hover:bg-primary/90 shadow-primary/20 text-white" : "shadow-primary/20")
              )}
              onClick={() => isEditing ? handleUpdateBasicInfo() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isEditing ? <Save className="mr-2 h-5 w-5" /> : <Edit2 className="mr-2 h-5 w-5" />)}
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-medium h-12 border-border/50"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {isEmployer ? (
          /* Employer Dashboard Redesigned */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column (65%): Company Identity & Bio */}
            <div className="lg:col-span-2 space-y-10">
              {/* Employer Identity Card */}
              <div className={cn(
                "flex flex-col md:flex-row items-start gap-8 bg-white p-8 rounded-xl-[2.5rem] border shadow-xl shadow-slate-200/40 transition-all",
                isEditing ? "border-emerald-500/20" : "border-slate-100"
              )}>
                <div className="relative group">
                  <Avatar className="w-32 h-32 rounded-xl-[2.5rem] border-4 border-background shadow-xl overflow-hidden bg-white shrink-0">
                    <AvatarImage src={profile.logoUrl} className="object-contain p-4" />
                    <AvatarFallback className="bg-cyan-600 text-white text-4xl font-black">
                      {profile.companyName?.charAt(0) || <Building2 className="w-10 h-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="employer-logo-upload" className="absolute bottom-2 right-2 h-10 w-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-20 border-4 border-white">
                    <Camera className="h-5 w-5" />
                    <input id="employer-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCropImageSrc(reader.result as string);
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setCropDialogOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </Label>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  {isEditing ? (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
                        <Input
                          value={profile.companyName || ''}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                          className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Industry</Label>
                          <Select value={profile.industry} onValueChange={(v) => setProfile({ ...profile, industry: v })}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {INDUSTRIES.map(ind => (
                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location (HQ)</Label>
                          <Input
                            value={profile.locationHQ || ''}
                            onChange={(e) => setProfile({ ...profile, locationHQ: e.target.value })}
                            className="h-12 rounded-xl border-slate-200 focus:border-emerald-500"
                            placeholder="e.g. Nairobi, Kenya"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Size</Label>
                          <Select value={profile.companySize} onValueChange={(v) => setProfile({ ...profile, companySize: v })}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="ONE_TO_TEN">1–10 Employees</SelectItem>
                              <SelectItem value="TEN_TO_FIFTY">10–50 Employees</SelectItem>
                              <SelectItem value="FIFTY_TO_TWO_HUNDRED">50–200 Employees</SelectItem>
                              <SelectItem value="TWO_HUNDRED_PLUS">200+ Employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                          {profile.companyName || 'Establish Company Name'}
                        </h1>
                        {profile.isVerified && (
                          <Badge className="bg-cyan-600 hover:bg-cyan-600 rounded-xl font-medium tracking-wider text-[10px] uppercase h-6 px-2">
                            <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED
                          </Badge>
                        )}
                      </div>

                      <p className="text-xl font-medium text-muted-foreground">{profile.industry || 'Define Industry'}</p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground uppercase tracking-wider pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          {profile.locationHQ || 'Location unspecified'}
                        </span>
                        <span className="hidden md:block text-muted-foreground/30">•</span>
                        <span className="flex items-center gap-1.5">
                          <Users2 className="w-4 h-4 text-cyan-600" />
                          {profile.companySize ? formatCompanySize(profile.companySize) : 'Team Size Unspecified'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Bio Card */}
              <Card className="rounded-xl-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                <CardHeader className="px-10 pt-10 pb-4">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <div className="h-7 w-1.5 bg-cyan-600 rounded-full" />
                    About the Company
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Story / Vision</Label>
                      <Textarea
                        className="min-h-[160px] rounded-2xl border-slate-200 font-medium text-base p-4 focus-visible:ring-emerald-500/20 resize-none"
                        value={profile.companyBio || ''}
                        onChange={(e) => setProfile({ ...profile, companyBio: e.target.value })}
                        placeholder="Summarize what your company does, your core values, and what developers love about working with you..."
                      />
                    </div>
                  ) : (
                    <p className="text-lg leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                      {profile.companyBio || 'No company biography provided yet. Click "Edit Profile" to tell developers your story.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (35%): Sidebar Actions / Metadata */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-xl-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                <CardContent className="p-8 space-y-8">



                  {/* Contact & Online Presence */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact & Online Presence</h3>

                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium uppercase text-slate-500">Primary Contact Name</Label>
                            <Input
                              value={profile.contactPersonName || ''}
                              onChange={(e) => setProfile({ ...profile, contactPersonName: e.target.value })}
                              className="h-10 rounded-xl"
                              placeholder="e.g. Jane Doe"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium uppercase text-slate-500">Support Email</Label>
                            <Input
                              value={profile.contactEmail || ''}
                              onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                              className="h-10 rounded-xl"
                              placeholder="e.g. support@company.com"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium uppercase text-slate-500">Official Website URL</Label>
                            <Input
                              value={profile.companyWebsite || ''}
                              onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
                              className="h-10 rounded-xl"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium uppercase text-slate-500">LinkedIn Company Page</Label>
                            <Input
                              value={profile.linkedinUrl || ''}
                              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                              className="h-10 rounded-xl"
                              placeholder="https://linkedin.com/company/..."
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium uppercase text-slate-500">Twitter / X Profile</Label>
                            <Input
                              value={profile.twitterUrl || ''}
                              onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                              className="h-10 rounded-xl"
                              placeholder="https://x.com/..."
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                              <User className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Contact</p>
                              <p className="font-medium text-slate-900 truncate">{profile.contactPersonName || 'Not set'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                              <Mail className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support Email</p>
                              <p className="font-medium text-slate-900 truncate">{profile.contactEmail || 'Not set'}</p>
                            </div>
                          </div>

                          {profile.companyWebsite && (
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                                <Globe className="h-5 w-5 text-cyan-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Site</p>
                                <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="font-medium text-cyan-600 hover:underline truncate block">{profile.companyWebsite}</a>
                              </div>
                            </div>
                          )}

                          {profile.linkedinUrl && (
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                                <ExternalLink className="h-5 w-5 text-cyan-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">LinkedIn Company Page</p>
                                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="font-medium text-cyan-600 hover:underline truncate block">{profile.linkedinUrl}</a>
                              </div>
                            </div>
                          )}

                          {profile.twitterUrl && (
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                                <X className="h-5 w-5 text-cyan-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Twitter / X Profile</p>
                                <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="font-medium text-cyan-600 hover:underline truncate block">{profile.twitterUrl}</a>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Developer View (New Redesigned Structure) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column (65%) */}
            <div className="lg:col-span-2 space-y-10">
              <ProfileHeader
                profile={profile}
                isOwner={true}
                isEditing={isEditing}
                onUpdate={setProfile}
                onPhotoSelect={(file) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropImageSrc(reader.result as string);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCropDialogOpen(true);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <ProfileTabs
                profile={profile}
                isOwner={true}
                isEditing={isEditing}
                onUpdate={setProfile}
                onAddSkill={() => openAddDialog('skill')}
                onAddProject={() => openAddDialog('project')}
                onAddEducation={() => openAddDialog('education')}
                onAddOSS={() => openAddDialog('oss')}
                onAddAchievement={() => openAddDialog('achievement')}
                onRemoveItem={handleRemoveItem}
                onToggleFeatured={handleToggleFeatured}
              />
            </div>

            {/* Right Column (35%) */}
            <div className="lg:col-span-1">
              <ProfileSidebar
                profile={profile}
                isEditing={isEditing}
                onUpdate={setProfile}
                onBuySpotlight={() => setBuySpotlightOpen(true)}
                onPreviewPublic={() => router.push(`/developers/${profile.id}`)}
                onVerifyIdentity={() => router.push('/verify')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs & Overlays */}
      <BuySpotlightDialog
        open={buySpotlightOpen}
        onClose={() => setBuySpotlightOpen(false)}
        onSuccess={() => { fetchSpotlightStatus(); setBuySpotlightOpen(false); }}
        isVerified={profile.isVerified}
        hasFeaturedProject={profile.projects?.some((p: any) => p.isFeatured) || false}
      />

      <Dialog open={!!dialogOpen} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent className="sm:max-w-md rounded-xl-[2.5rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Add {dialogOpen?.charAt(0).toUpperCase()}{dialogOpen?.slice(1)}
            </DialogTitle>
            <DialogDescription className="sr-only">Form for adding profile items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {dialogOpen === 'skill' && (
              <div className="space-y-4">
                <Label className="font-medium">Skill Name</Label>
                <Input value={newItem.skill || ''} onChange={(e) => setNewItem({ ...newItem, skill: e.target.value })} className="h-12 rounded-xl" />
                <div className="flex flex-wrap gap-2 pt-2">
                  {COMMON_SKILLS.slice(0, 8).map(s => (
                    <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => setNewItem({ ...newItem, skill: s })}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {dialogOpen === 'project' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="font-medium">Project Title</Label><Input value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-medium">Description</Label><Textarea value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="rounded-xl min-h-[100px]" /></div>
                <div className="space-y-2">
                  <Label className="font-medium">Tech Stack</Label>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                    {(newItem.techStack ? newItem.techStack.split(',').filter(Boolean) : []).map((tech: string, i: number) => (
                      <Badge key={`${tech}-${i}`} className="bg-slate-100 hover:bg-slate-200 text-slate-900 border-none flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl text-xs font-medium transition-colors">
                        {tech.trim()}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newItem.techStack.split(',').filter((_: any, idx: number) => idx !== i).join(',');
                            setNewItem({ ...newItem, techStack: updated });
                          }}
                          className="rounded-2xl p-0.5 hover:bg-slate-300 transition-colors text-slate-500 hover:text-slate-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add technology... (Press Enter)"
                    value={techInputValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(',')) {
                        const parts = val.split(',').map(p => p.trim()).filter(Boolean);
                        if (parts.length > 1 || val.endsWith(',')) {
                          const remainingText = val.endsWith(',') ? '' : parts.pop() || '';
                          const oldTechs = newItem.techStack ? newItem.techStack.split(',').filter(Boolean) : [];
                          const combined = [...oldTechs, ...parts].join(',');
                          setNewItem({ ...newItem, techStack: combined });
                          setTechInputValue(remainingText);
                          return;
                        }
                      }
                      setTechInputValue(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = techInputValue.trim();
                        if (val) {
                          const oldTechs = newItem.techStack ? newItem.techStack.split(',').filter(Boolean) : [];
                          const combined = [...oldTechs, val].join(',');
                          setNewItem({ ...newItem, techStack: combined });
                          setTechInputValue('');
                        }
                      }
                    }}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2"><Label className="font-medium">Live URL</Label><Input value={newItem.projectUrl || ''} onChange={(e) => setNewItem({ ...newItem, projectUrl: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-medium">Source Code URL</Label><Input value={newItem.repoUrl || ''} onChange={(e) => setNewItem({ ...newItem, repoUrl: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2">
                  <Label className="font-medium">Screenshot (Required for featured)</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="rounded-xl h-10 px-2 pt-1.5" />
                  {previewUrl && (
                    <div className="mt-4 relative rounded-2xl overflow-hidden">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-black/60 hover:bg-danger-500 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-2"><Switch id="featured" checked={newItem.isFeatured || false} onCheckedChange={(v) => setNewItem({ ...newItem, isFeatured: v })} /><Label htmlFor="featured" className="font-medium text-sm">Feature this project</Label></div>
              </div>
            )}
            {dialogOpen === 'education' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="font-medium">Institution</Label><Input value={newItem.institution || ''} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-medium">Qualification</Label><Input value={newItem.qualification || ''} onChange={(e) => setNewItem({ ...newItem, qualification: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-medium">Field of Study</Label><Input value={newItem.fieldOfStudy || ''} onChange={(e) => setNewItem({ ...newItem, fieldOfStudy: e.target.value })} className="rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="font-medium">Start Year</Label><Input type="number" value={newItem.startYear || ''} onChange={(e) => setNewItem({ ...newItem, startYear: e.target.value })} className="rounded-xl" /></div>
                  <div className="space-y-2"><Label className="font-medium">End Year</Label><Input type="number" value={newItem.yearCompleted || ''} onChange={(e) => setNewItem({ ...newItem, yearCompleted: e.target.value })} className="rounded-xl" /></div>
                </div>
              </div>
            )}
            {(dialogOpen === 'oss' || dialogOpen === 'achievement' || dialogOpen === 'certification') && (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="font-medium">Title</Label><Input value={newItem.projectName || newItem.title || newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, [dialogOpen === 'oss' ? 'projectName' : dialogOpen === 'achievement' ? 'title' : 'name']: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-medium">{dialogOpen === 'certification' ? 'Issued By' : 'Description'}</Label><Textarea value={newItem.description || newItem.issuedBy || ''} onChange={(e) => setNewItem({ ...newItem, [dialogOpen === 'certification' ? 'issuedBy' : 'description']: e.target.value })} className="rounded-xl min-h-[100px]" /></div>
                {dialogOpen === 'oss' && <div className="space-y-2"><Label className="font-medium">Contribution URL</Label><Input value={newItem.contributionUrl || ''} onChange={(e) => setNewItem({ ...newItem, contributionUrl: e.target.value })} className="rounded-xl" /></div>}
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
            <Button variant="ghost" onClick={closeDialog} className="font-medium">Cancel</Button>
            <Button className="font-black rounded-xl px-8 h-12 shadow-lg" onClick={() => handleAddItem(dialogOpen as string)} disabled={isSaving}>{isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cropDialogOpen} onOpenChange={(v) => !v && setCropDialogOpen(false)}>
        <DialogContent className="sm:max-w-xl rounded-xl-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Crop Profile Photo</DialogTitle>
            <DialogDescription className="sr-only">Adjust your profile photo by cropping and zooming.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-4">
            <div className="relative w-full h-[400px] rounded-xl-[2rem] overflow-hidden bg-slate-900 border-8 border-slate-100">
              <Cropper image={cropImageSrc || ''} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
            </div>
            <div className="space-y-4 px-2">
              <div className="flex justify-between items-center"><Label className="font-black uppercase tracking-widest text-[10px] text-slate-500">Zoom Level</Label><span className={cn("font-black text-xs", isEmployer ? "text-cyan-600" : "text-primary")}>{(zoom * 100).toFixed(0)}%</span></div>
              <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(val) => setZoom(val[0])} />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
            <Button variant="ghost" onClick={() => setCropDialogOpen(false)} className="font-medium">Cancel</Button>
            <Button className={cn("font-black rounded-xl px-8 h-12 shadow-lg", isEmployer ? "bg-cyan-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" : "")} disabled={isSaving} onClick={async () => {
              try {
                setIsSaving(true);
                const croppedBlob = await getCroppedImg(cropImageSrc!, croppedAreaPixels);
                const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
                const response = user?.role === 'EMPLOYER' ? await employerService.uploadLogo(file) : await developerService.uploadProfilePhoto(file);
                if (response.success) { setProfile(response.data); setCropDialogOpen(false); toast.success('Profile photo updated'); }
              } catch (err) { toast.error('Failed to update photo.'); } finally { setIsSaving(false); }
            }}>{isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set Profile Photo'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SpotlightStatusCard({ status, onBuy }: { status: any, onBuy: () => void }) {
  const isActive = !!status;
  return (
    <Card className={cn(
      "rounded-xl-[2rem] border-none shadow-xl overflow-hidden relative group",
      isActive ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20" : "bg-slate-50 border border-slate-100 shadow-slate-100/50"
    )}>
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
      )}
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
            isActive ? "bg-white text-cyan-600" : "bg-primary text-white"
          )}>
            <Zap className={cn("h-7 w-7", isActive && "fill-current")} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight leading-none">
              {isActive ? 'Spotlight Active!' : 'Get Spotlight'}
            </h3>
            <p className={cn("text-xs font-medium mt-1 uppercase tracking-widest", isActive ? "text-emerald-100" : "text-slate-500")}>
              {isActive ? 'You are being featured' : 'Boost your reach'}
            </p>
          </div>
        </div>

        {isActive ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
              <p className="font-black text-sm">Developer of the {status.type}</p>
              <p className="text-[10px] font-medium text-emerald-100 uppercase mt-1">
                Expires: {formatDateString(status.expiresAt)}
              </p>
            </div>
            <p className="text-xs font-medium text-emerald-50">
              You are currently showcased on the homepage spotlight.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Get featured on the homepage and attract up to <span className="font-black text-slate-900">10x more</span> employer views.
            </p>
            <Button className="w-full h-12 rounded-xl font-black bg-white text-slate-900 hover:bg-slate-50 shadow-lg" onClick={onBuy}>
              Boost Profile Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
