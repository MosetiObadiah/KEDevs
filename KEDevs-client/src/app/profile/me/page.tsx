'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Briefcase
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
import { cn } from '@/lib/utils';

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
    const image = new Image();
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
    availabilityStatus: 'AVAILABLE',
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
        setProfile(response.data);
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
        <p className="text-xl font-bold text-muted-foreground animate-pulse">Curating your professional story...</p>
      </div>
    );
  }

  const isEmployer = user?.role === 'EMPLOYER';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 pt-12 relative z-10">
        {/* Profile Header Card */}
        <Card className="border-none shadow-2xl shadow-primary/5 overflow-hidden rounded-[2rem] mb-12">
          <div className="h-32 bg-gradient-to-r from-primary to-primary-foreground/20" />
          <CardContent className="pt-0 -mt-16 pb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <Avatar className="w-40 h-40 border-[8px] border-white shadow-xl rounded-[2.5rem] bg-white">
                  <AvatarImage src={isEmployer ? profile.logoUrl : profile.profilePhoto} className="object-cover" />
                  <AvatarFallback className="text-5xl font-black bg-primary text-white">
                    {isEmployer ? (profile.companyName?.charAt(0) || <Building2 />) : (profile.firstName?.charAt(0) || <Users2 />)}
                  </AvatarFallback>
                </Avatar>
                
                <Label htmlFor="photo-upload" className="absolute bottom-2 right-2 h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-20 border-4 border-white">
                   <Camera className="h-5 w-5" />
                   <input 
                      id="photo-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
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
                      }}
                   />
                </Label>
                
                {profile.isVerified && (
                  <div className="absolute top-2 right-2 h-8 w-8 bg-white text-primary rounded-full flex items-center justify-center shadow-md z-20 border-2 border-primary/10">
                    <ShieldCheck className="h-5 w-5 fill-primary/10" />
                  </div>
                )}
              </div>

              <div className="flex-1 pt-12 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                       <Badge variant="outline" className="rounded-lg font-black tracking-wider text-[10px] uppercase bg-primary/5 text-primary border-primary/20">
                          {user?.role} PROFILE
                       </Badge>
                       {profile.isVerified && (
                         <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-lg font-black tracking-wider text-[10px] uppercase">
                           VERIFIED
                         </Badge>
                       )}
                       {isEmployer && profile.isApproved && (
                         <Badge className="bg-blue-500 hover:bg-blue-600 rounded-lg font-black tracking-wider text-[10px] uppercase">
                           APPROVED EMPLOYER
                         </Badge>
                       )}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                       {isEmployer ? (profile.companyName || 'My Company') : `${profile.firstName} ${profile.lastName}`}
                    </h1>
                    
                    <p className="text-lg md:text-xl font-semibold text-slate-500 mt-1 flex items-center gap-2">
                       {isEmployer ? (profile.industry || 'Industry not set') : (profile.currentLastRole || 'Awaiting Role Definition')}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      size="lg" 
                      className={cn(
                        "rounded-2xl font-black px-8 h-14 shadow-xl transition-all",
                        isEditing ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "shadow-primary/20"
                      )}
                      onClick={() => isEditing ? handleUpdateBasicInfo() : setIsEditing(true)}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isEditing ? <Save className="mr-2 h-5 w-5" /> : <Edit2 className="mr-2 h-5 w-5" />)}
                      {isEditing ? 'Save Changes' : 'Manage Profile'}
                    </Button>
                    {isEditing && (
                      <Button 
                        size="lg" 
                        variant="ghost" 
                        className="rounded-2xl font-black h-14"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {isEmployer ? (profile.locationHQ || 'Location not set') : `${profile.locationCity || 'City'}, ${profile.locationCountry || 'Kenya'}`}
                  </div>
                  {isEmployer ? (
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <Users2 className="h-4 w-4 text-primary" />
                      {profile.companySize?.replace(/_/g, ' ') || 'Size not set'} Employees
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Briefcase className="h-4 w-4 text-primary" />
                        {profile.yearsOfExperience?.replace(/_/g, ' ')} Experience
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Zap className="h-4 w-4 text-primary" />
                        {profile.preferredWorkType || 'REMOTE'}
                      </div>
                    </>
                  )}
                  {isEmployer ? (
                    profile.companyWebsite && (
                      <Link href={profile.companyWebsite} target="_blank" className="flex items-center gap-2 text-primary font-black text-sm hover:underline">
                        <Globe className="h-4 w-4" />
                        {profile.companyWebsite.replace(/^https?:\/\//, '')}
                      </Link>
                    )
                  ) : (
                    profile.githubUrl && (
                      <Link href={profile.githubUrl} target="_blank" className="flex items-center gap-2 text-slate-900 font-black text-sm hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        {profile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEmployer ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-6">
                  <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <div className="h-8 w-2 bg-primary rounded-full" />
                    Company Bio & Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isEditing ? (
                    <Textarea 
                      className="min-h-[200px] rounded-2xl border-slate-200 font-medium text-lg focus-visible:ring-primary/20"
                      value={profile.companyBio || ''} 
                      onChange={(e) => setProfile({...profile, companyBio: e.target.value})}
                      placeholder="Describe your company culture, mission, and what you're looking for in developers..."
                    />
                  ) : (
                    <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                      {profile.companyBio || "Add a bio to tell developers about your company..."}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-6">
                  <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <div className="h-8 w-2 bg-primary rounded-full" />
                    Point of Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                            <Users2 className="h-6 w-6" />
                         </div>
                         <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person</Label>
                            {isEditing ? (
                              <Input 
                                className="h-10 rounded-xl border-slate-200 font-bold"
                                value={profile.contactPersonName || ''} 
                                onChange={(e) => setProfile({...profile, contactPersonName: e.target.value})} 
                              />
                            ) : (
                              <p className="text-lg font-black text-slate-900">{profile.contactPersonName || 'HR Manager'}</p>
                            )}
                         </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                            <Mail className="h-6 w-6" />
                         </div>
                         <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Email</Label>
                            {isEditing ? (
                              <Input 
                                className="h-10 rounded-xl border-slate-200 font-bold"
                                value={profile.contactEmail || ''} 
                                onChange={(e) => setProfile({...profile, contactEmail: e.target.value})} 
                              />
                            ) : (
                              <p className="text-lg font-black text-slate-900 truncate">{profile.contactEmail || (user?.email ? `${user.email} (account)` : 'Not set')}</p>
                            )}
                         </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-6">
                  <CardTitle className="text-xl font-black">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                   {isEditing ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold text-xs">Industry</Label>
                          <Select 
                            value={profile.industry || ''} 
                            onValueChange={(v) => setProfile({ ...profile, industry: v })}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 font-bold">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs">Company Size</Label>
                          <Select 
                            value={profile.companySize || ''} 
                            onValueChange={(v) => setProfile({ ...profile, companySize: v })}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 font-bold">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              <SelectItem value="ONE_TO_TEN">1-10 Employees</SelectItem>
                              <SelectItem value="TEN_TO_FIFTY">11-50 Employees</SelectItem>
                              <SelectItem value="FIFTY_TO_TWO_HUNDRED">51-200 Employees</SelectItem>
                              <SelectItem value="TWO_HUNDRED_PLUS">200+ Employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs">Headquarters</Label>
                          <Select 
                            value={profile.locationHQ?.split(',')[0] || ''} 
                            onValueChange={(v) => setProfile({ ...profile, locationHQ: `${v}, Kenya` })}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 font-bold">
                              <SelectValue placeholder="Select county" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              {KENYA_COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center py-1 border-b border-slate-50">
                           <span className="text-slate-400 font-bold text-xs uppercase">Industry</span>
                           <span className="text-slate-900 font-black">{profile.industry || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-50">
                           <span className="text-slate-400 font-bold text-xs uppercase">Size</span>
                           <span className="text-slate-900 font-black">{profile.companySize?.replace(/_/g, ' ') || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-50">
                           <span className="text-slate-400 font-bold text-xs uppercase">HQ</span>
                           <span className="text-slate-900 font-black">{profile.locationHQ || '—'}</span>
                        </div>
                     </div>
                   )}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-6">
                  <CardTitle className="text-xl font-black">Online Presence</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                   <div className="flex flex-col gap-3">
                      {isEditing ? (
                        <>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black uppercase text-slate-400">Website</Label>
                             <Input className="h-10 rounded-xl" value={profile.companyWebsite || ''} onChange={(e) => setProfile({...profile, companyWebsite: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black uppercase text-slate-400">LinkedIn</Label>
                             <Input className="h-10 rounded-xl" value={profile.linkedinUrl || ''} onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black uppercase text-slate-400">Twitter / X</Label>
                             <Input className="h-10 rounded-xl" value={profile.twitterUrl || ''} onChange={(e) => setProfile({...profile, twitterUrl: e.target.value})} />
                          </div>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 group" asChild>
                             <Link href={profile.companyWebsite || '#'} target="_blank" className={cn(!profile.companyWebsite && "opacity-50 pointer-events-none")}>
                                <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                   <Globe className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-black text-slate-900">Official Website</span>
                                <ExternalLink className="ml-auto h-4 w-4 text-slate-300" />
                             </Link>
                          </Button>
                          <Button variant="outline" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 group" asChild>
                             <Link href={profile.linkedinUrl || '#'} target="_blank" className={cn(!profile.linkedinUrl && "opacity-50 pointer-events-none")}>
                                <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform text-[#0077b5]">
                                   <ExternalLink className="h-4 w-4" />
                                </div>
                                <span className="font-black text-slate-900">LinkedIn Profile</span>
                                <ExternalLink className="ml-auto h-4 w-4 text-slate-300" />
                             </Link>
                          </Button>
                          <Button variant="outline" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 group" asChild>
                             <Link href={profile.twitterUrl || '#'} target="_blank" className={cn(!profile.twitterUrl && "opacity-50 pointer-events-none")}>
                                <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform text-slate-900">
                                   <X className="h-4 w-4" />
                                </div>
                                <span className="font-black text-slate-900">X</span>
                                <ExternalLink className="ml-auto h-4 w-4 text-slate-300" />
                             </Link>
                          </Button>
                        </>
                      )}
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* DEVELOPER PROFILE VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
               <Tabs defaultValue="overview" className="space-y-8">
                  <TabsList className="bg-white p-2 h-16 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar">
                     <TabsTrigger value="overview" className="rounded-xl px-8 font-black text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-12">
                        <Users2 className="h-4 w-4 mr-2" /> Overview
                     </TabsTrigger>
                     <TabsTrigger value="projects" className="rounded-xl px-8 font-black text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-12">
                        <Code2 className="h-4 w-4 mr-2" /> Projects
                     </TabsTrigger>
                     <TabsTrigger value="experience" className="rounded-xl px-8 font-black text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-12">
                        <GraduationCap className="h-4 w-4 mr-2" /> Experience
                     </TabsTrigger>
                     <TabsTrigger value="oss" className="rounded-xl px-8 font-black text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-12">
                        <Globe className="h-4 w-4 mr-2" /> OSS & Achievements
                     </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* Bio Card */}
                     <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 pb-6">
                           <CardTitle className="text-2xl font-black flex items-center gap-2">
                              <div className="h-8 w-2 bg-primary rounded-full" />
                              Professional Story
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                           {isEditing ? (
                              <Textarea 
                                 className="min-h-[200px] rounded-2xl border-slate-200 font-medium text-lg focus-visible:ring-primary/20"
                                 value={profile.bio || ''} 
                                 onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                 placeholder="Tell your story, your stack, and what you're passionate about..."
                              />
                           ) : (
                              <p className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                 {profile.bio || "Add a bio to tell employers who you are..."}
                              </p>
                           )}
                        </CardContent>
                     </Card>

                     {/* Skills Card */}
                     <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                           <CardTitle className="text-2xl font-black flex items-center gap-2">
                              <div className="h-8 w-2 bg-primary rounded-full" />
                              Technical Arsenal
                           </CardTitle>
                           <Button size="sm" className="rounded-xl font-bold h-10 px-4" onClick={() => openAddDialog('skill')}>
                              <Plus className="h-4 w-4 mr-2" /> Add Skill
                           </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                           <div className="flex flex-wrap gap-3">
                              {profile.skills.map((skill: string) => (
                                 <Badge key={skill} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2">
                                    {skill}
                                    <button onClick={() => handleRemoveItem('skill', skill)} className="hover:text-red-500 transition-colors">
                                       <X className="h-3.5 w-3.5" />
                                    </button>
                                 </Badge>
                              ))}
                              {profile.skills.length === 0 && (
                                 <p className="text-slate-400 font-medium italic">No skills added yet.</p>
                              )}
                           </div>

                           {profile.languages.length > 0 && (
                             <div className="mt-10">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Spoken Languages</h4>
                                <div className="flex flex-wrap gap-2">
                                   {profile.languages.map((lang: string) => (
                                      <Badge key={lang} variant="outline" className="h-8 px-4 rounded-lg font-black text-[10px] uppercase border-slate-200">
                                         {lang}
                                         <button onClick={() => handleRemoveItem('language', lang)} className="ml-2 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                         </button>
                                      </Badge>
                                   ))}
                                </div>
                             </div>
                           )}
                           <Button variant="ghost" size="sm" className="mt-4 font-black text-[10px] uppercase text-primary" onClick={() => openAddDialog('language')}>
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add Language
                           </Button>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                           <div className="h-8 w-2 bg-primary rounded-full" />
                           Portfolio Projects
                        </h2>
                        <Button className="rounded-2xl font-black h-12 shadow-xl shadow-primary/10 px-6" onClick={() => openAddDialog('project')}>
                           <Plus className="h-5 w-5 mr-2" /> New Project
                        </Button>
                     </div>

                     <div className="grid grid-cols-1 gap-8">
                        {profile.projects.map((project: any) => (
                           <Card key={project.id} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                              <div className="grid grid-cols-1 md:grid-cols-12">
                                 <div className="md:col-span-5 relative overflow-hidden bg-slate-100">
                                    {project.screenshotUrl ? (
                                       <img src={project.screenshotUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={project.title} />
                                    ) : (
                                       <div className="h-64 flex items-center justify-center text-slate-300">
                                          <Code2 className="h-20 w-20" />
                                       </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                       {project.isFeatured && (
                                          <Badge className="bg-emerald-500 rounded-lg font-black uppercase text-[10px] px-3 py-1 shadow-lg">Featured</Badge>
                                       )}
                                    </div>
                                    <Label className="absolute bottom-4 left-4 h-10 w-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                                       <Upload className="h-4 w-4" />
                                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('project', project.id, e)} />
                                    </Label>
                                 </div>
                                 <div className="md:col-span-7 p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                       <div className="space-y-1">
                                          <h3 className="text-2xl font-black text-slate-900">{project.title}</h3>
                                          <p className="text-slate-500 font-medium text-sm line-clamp-3">{project.description}</p>
                                       </div>
                                       <div className="flex gap-1">
                                          <Button 
                                             size="icon" 
                                             variant="ghost" 
                                             className={cn("rounded-xl h-10 w-10", project.isFeatured ? "text-yellow-500" : "text-slate-300")}
                                             onClick={() => handleToggleFeatured(project.id, project.isFeatured)}
                                          >
                                             {project.isFeatured ? <Star className="h-5 w-5 fill-current" /> : <Star className="h-5 w-5" />}
                                          </Button>
                                          <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem('project', project.id)}>
                                             <Trash2 className="h-5 w-5" />
                                          </Button>
                                       </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                       {project.techStack?.split(',').map((tech: string) => (
                                          <Badge key={tech} variant="outline" className="rounded-lg text-[10px] font-bold uppercase border-slate-100 bg-slate-50/50">{tech.trim()}</Badge>
                                       ))}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                       {project.projectUrl && (
                                          <Button size="sm" className="rounded-xl font-black h-10 px-5" asChild>
                                             <Link href={project.projectUrl} target="_blank">Live Demo <ExternalLink className="ml-2 h-3.5 w-3.5" /></Link>
                                          </Button>
                                       )}
                                       {project.repoUrl && (
                                          <Button variant="outline" className="rounded-xl font-black h-10 border-slate-100 flex-1" asChild>
                                             <Link href={project.repoUrl} target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Source</Link>
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </Card>
                        ))}
                        {profile.projects.length === 0 && (
                           <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                              <Code2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                              <h3 className="text-xl font-black text-slate-400">Showcase your work</h3>
                              <p className="text-slate-400 font-medium">Add projects to your profile to impress employers.</p>
                           </div>
                        )}
                     </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                           <CardTitle className="text-2xl font-black flex items-center gap-2">
                              <div className="h-8 w-2 bg-primary rounded-full" />
                              Education
                           </CardTitle>
                           <Button size="sm" variant="outline" className="rounded-xl font-bold h-10 px-4 border-slate-200" onClick={() => openAddDialog('education')}>
                              <Plus className="h-4 w-4 mr-2" /> Add Education
                           </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                           <div className="space-y-6">
                              {profile.education.map((edu: any) => (
                                 <div key={edu.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex gap-6 items-start">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                                       <GraduationCap className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                       <div className="flex justify-between">
                                          <h4 className="text-xl font-black text-slate-900">{edu.institution}</h4>
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleRemoveItem('education', edu.id)}>
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </div>
                                       <p className="text-primary font-black text-sm">{edu.qualification} • {edu.fieldOfStudy}</p>
                                       <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{edu.startYear} — {edu.yearCompleted}</p>
                                    </div>
                                 </div>
                              ))}
                              {profile.education.length === 0 && (
                                 <p className="py-8 text-center text-slate-400 font-bold italic">No education history added yet.</p>
                              )}
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                           <CardTitle className="text-2xl font-black flex items-center gap-2">
                              <div className="h-8 w-2 bg-primary rounded-full" />
                              Certifications
                           </CardTitle>
                           <Button size="sm" variant="outline" className="rounded-xl font-bold h-10 px-4 border-slate-200" onClick={() => openAddDialog('certification')}>
                              <Plus className="h-4 w-4 mr-2" /> Add Certificate
                           </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {profile.certifications.map((c: any) => (
                                 <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                       <Award className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-black text-slate-900 truncate">{c.name}</h4>
                                       <p className="text-slate-500 font-bold text-[10px] uppercase">{c.issuedBy}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleRemoveItem('certification', c.id)}>
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              ))}
                              {profile.certifications.length === 0 && (
                                 <p className="col-span-full py-8 text-center text-slate-400 font-bold italic">No certifications added yet.</p>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="oss" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                           <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                              <CardTitle className="text-xl font-black flex items-center gap-2">
                                 OSS Work
                              </CardTitle>
                              <Button size="icon" variant="ghost" className="rounded-xl h-8 w-8 text-primary" onClick={() => openAddDialog('oss')}>
                                 <Plus className="h-5 w-5" />
                              </Button>
                           </CardHeader>
                           <CardContent className="pt-6 space-y-4">
                              {profile.ossContributions.map((oss: any) => (
                                 <div key={oss.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <h4 className="font-black text-slate-900">{oss.projectName}</h4>
                                          <p className="text-primary font-bold text-xs">{oss.role}</p>
                                       </div>
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleRemoveItem('oss', oss.id)}>
                                          <Trash2 className="h-4 w-4" />
                                       </Button>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{oss.description}</p>
                                    {oss.contributionUrl && (
                                       <Link href={oss.contributionUrl} target="_blank" className="text-primary font-black text-xs inline-flex items-center hover:underline">
                                          View Contribution <ExternalLink className="ml-1 h-3 w-3" />
                                       </Link>
                                    )}
                                 </div>
                              ))}
                              {profile.ossContributions.length === 0 && (
                                 <p className="py-8 text-center text-slate-400 font-bold italic">No OSS contributions listed.</p>
                              )}
                           </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                           <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                              <CardTitle className="text-xl font-black flex items-center gap-2">
                                 Achievements
                              </CardTitle>
                              <Button size="icon" variant="ghost" className="rounded-xl h-8 w-8 text-primary" onClick={() => openAddDialog('achievement')}>
                                 <Plus className="h-5 w-5" />
                              </Button>
                           </CardHeader>
                           <CardContent className="pt-6 space-y-4">
                              {profile.achievements.map((ach: any) => (
                                 <div key={ach.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center shrink-0">
                                       <Trophy className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                       <div className="flex justify-between items-start">
                                          <h4 className="font-black text-slate-900">{ach.title}</h4>
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleRemoveItem('achievement', ach.id)}>
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </div>
                                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{ach.year}</p>
                                       <p className="text-slate-500 text-sm font-medium">{ach.description}</p>
                                    </div>
                                 </div>
                              ))}
                              {profile.achievements.length === 0 && (
                                 <p className="py-8 text-center text-slate-400 font-bold italic">No achievements added yet.</p>
                              )}
                           </CardContent>
                        </Card>
                     </div>
                  </TabsContent>
               </Tabs>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <SpotlightStatusCard status={spotlightStatus} onBuy={() => setBuySpotlightOpen(true)} />

               <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-slate-900 text-white">
                  <CardHeader className="pb-6">
                     <CardTitle className="text-xl font-black tracking-widest uppercase">Visibility & Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <Label className="text-sm font-black text-slate-100 uppercase tracking-wide">Availability</Label>
                              <p className="text-[10px] font-bold text-slate-400">Can employers reach out?</p>
                           </div>
                        </div>
                        <Select value={profile.availabilityStatus} onValueChange={handleToggleAvailability}>
                           <SelectTrigger className="rounded-xl border-slate-700 bg-slate-800 h-12 font-black text-white focus:ring-primary/20">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-slate-700 bg-slate-800 text-white">
                              <SelectItem value="AVAILABLE">🟢 Available Now</SelectItem>
                              <SelectItem value="OPEN_TO_OFFERS">🟡 Open to Offers</SelectItem>
                              <SelectItem value="NOT_AVAILABLE">🔴 Not Available</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <Label className="text-sm font-black text-slate-100 uppercase tracking-wide">Privacy Mode</Label>
                              <p className="text-[10px] font-bold text-slate-400">Control who sees your profile</p>
                           </div>
                        </div>
                        <Select value={profile.profileVisibility} onValueChange={handleToggleVisibility}>
                           <SelectTrigger className="rounded-xl border-slate-700 bg-slate-800 h-12 font-black text-white focus:ring-primary/20">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-slate-700 bg-slate-800 text-white">
                              <SelectItem value="PUBLIC">🌎 Public Search</SelectItem>
                              <SelectItem value="PRIVATE">🔒 Private Link Only</SelectItem>
                              <SelectItem value="HIDDEN">👻 Hidden (Ghost mode)</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </CardContent>
               </Card>

               <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="border-b border-slate-50 pb-6">
                     <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                     <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 font-black text-slate-900 group" asChild>
                        <Link href={`/developers/${profile.id || user?.id}`}>
                           <Eye className="h-5 w-5 mr-4 text-primary group-hover:scale-110 transition-transform" /> 
                           Preview Public View
                        </Link>
                     </Button>
                     <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 font-black text-slate-900 group" onClick={() => router.push('/verify')}>
                        <ShieldCheck className="h-5 w-5 mr-4 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                        Verify Identity
                     </Button>
                  </CardContent>
               </Card>

               {!isEmployer && (
                 <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-6">
                       <CardTitle className="text-xl font-black">Personal Links</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                       {isEditing ? (
                         <div className="space-y-4">
                            <div className="space-y-1">
                               <Label className="text-[10px] font-black uppercase text-slate-400">LinkedIn</Label>
                               <Input className="h-10 rounded-xl" value={profile.linkedinUrl || ''} onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[10px] font-black uppercase text-slate-400">Portfolio</Label>
                               <Input className="h-10 rounded-xl" value={profile.portfolioUrl || ''} onChange={(e) => setProfile({...profile, portfolioUrl: e.target.value})} />
                            </div>
                         </div>
                       ) : (
                         <>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 font-black text-slate-900 group" asChild>
                               <Link href={profile.linkedinUrl || '#'} target="_blank" className={cn(!profile.linkedinUrl && "opacity-50 pointer-events-none")}>
                                  <ExternalLink className="h-5 w-5 mr-4 text-[#0077b5] group-hover:scale-110 transition-transform" /> 
                                  LinkedIn
                               </Link>
                            </Button>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/50 justify-start px-6 font-black text-slate-900 group" asChild>
                               <Link href={profile.portfolioUrl || '#'} target="_blank" className={cn(!profile.portfolioUrl && "opacity-50 pointer-events-none")}>
                                  <Globe className="h-5 w-5 mr-4 text-primary group-hover:scale-110 transition-transform" /> 
                                  Portfolio
                               </Link>
                            </Button>
                         </>
                       )}
                    </CardContent>
                 </Card>
               )}
            </div>
          </div>
        )}
      </div>

      <BuySpotlightDialog 
        open={buySpotlightOpen} 
        onClose={() => setBuySpotlightOpen(false)} 
        onSuccess={() => { fetchSpotlightStatus(); setBuySpotlightOpen(false); }}
        isVerified={profile.isVerified}
        hasFeaturedProject={profile.projects?.some((p: any) => p.isFeatured) || false}
      />

      {/* Add Item Dialogs */}
      <Dialog open={!!dialogOpen} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Add {dialogOpen?.charAt(0).toUpperCase()}{dialogOpen?.slice(1)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {dialogOpen === 'skill' && (
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="font-bold">Skill Name</Label>
                     <Input 
                        placeholder="e.g. React, Java" 
                        className="h-12 rounded-xl"
                        value={newItem.skill || ''} 
                        onChange={(e) => setNewItem({ ...newItem, skill: e.target.value })} 
                     />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {COMMON_SKILLS.slice(0, 8).map(s => (
                        <Badge 
                           key={s} 
                           variant="outline" 
                           className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                           onClick={() => setNewItem({ ...newItem, skill: s })}
                        >
                           {s}
                        </Badge>
                     ))}
                  </div>
               </div>
            )}

            {dialogOpen === 'language' && (
               <div className="space-y-2">
                  <Label className="font-bold">Language Name</Label>
                  <Input 
                     placeholder="e.g. Swahili, French" 
                     className="h-12 rounded-xl"
                     value={newItem.language || ''} 
                     onChange={(e) => setNewItem({ ...newItem, language: e.target.value })} 
                  />
               </div>
            )}

            {dialogOpen === 'education' && (
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="font-bold">Institution</Label>
                   <Input value={newItem.institution || ''} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">Qualification</Label>
                   <Input value={newItem.qualification || ''} onChange={(e) => setNewItem({ ...newItem, qualification: e.target.value })} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="font-bold">Start Year</Label>
                      <Input type="number" value={newItem.startYear || ''} onChange={(e) => setNewItem({ ...newItem, startYear: e.target.value })} className="rounded-xl" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold">End Year</Label>
                      <Input type="number" value={newItem.yearCompleted || ''} onChange={(e) => setNewItem({ ...newItem, yearCompleted: e.target.value })} className="rounded-xl" />
                   </div>
                </div>
              </div>
            )}

            {dialogOpen === 'project' && (
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="font-bold">Project Title</Label>
                     <Input value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-bold">Description</Label>
                     <Textarea value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="rounded-xl min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-bold">Tech Stack (comma separated)</Label>
                     <Input placeholder="React, Node.js, AWS" value={newItem.techStack || ''} onChange={(e) => setNewItem({ ...newItem, techStack: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-bold">Project Preview (Optional)</Label>
                     <div className="flex items-center gap-4">
                        <Button variant="outline" className="rounded-xl h-12 w-full font-bold relative" asChild>
                           <label className="cursor-pointer">
                              {selectedFile ? selectedFile.name : 'Choose Screenshot'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                           </label>
                        </Button>
                     </div>
                     {previewUrl && <img src={previewUrl} className="mt-4 w-full h-32 object-cover rounded-2xl" />}
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="featured" checked={newItem.isFeatured || false} onCheckedChange={(v) => setNewItem({ ...newItem, isFeatured: v })} />
                    <Label htmlFor="featured" className="font-bold text-sm">Feature this project</Label>
                  </div>
               </div>
            )}

            {/* Other dialogs for OSS, Achievement, Certification follow same pattern */}
            {(dialogOpen === 'oss' || dialogOpen === 'achievement' || dialogOpen === 'certification') && (
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="font-bold">Title / Project Name</Label>
                     <Input 
                        value={newItem.projectName || newItem.title || newItem.name || ''} 
                        onChange={(e) => setNewItem({ ...newItem, [dialogOpen === 'oss' ? 'projectName' : dialogOpen === 'achievement' ? 'title' : 'name']: e.target.value })} 
                        className="rounded-xl" 
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-bold">{dialogOpen === 'certification' ? 'Issued By' : 'Description'}</Label>
                     <Textarea 
                        value={newItem.description || newItem.issuedBy || ''} 
                        onChange={(e) => setNewItem({ ...newItem, [dialogOpen === 'certification' ? 'issuedBy' : 'description']: e.target.value })} 
                        className="rounded-xl min-h-[100px]" 
                     />
                  </div>
               </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
             <Button variant="ghost" onClick={closeDialog} className="font-bold">Cancel</Button>
             <Button className="font-black rounded-xl px-8 h-12 shadow-lg" onClick={() => handleAddItem(dialogOpen as string)} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Item'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={(v) => !v && setCropDialogOpen(false)}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Crop Profile Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
             <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden bg-slate-900 border-8 border-slate-100">
                <Cropper
                  image={cropImageSrc || ''}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                />
             </div>
             
             <div className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                   <Label className="font-black uppercase tracking-widest text-[10px] text-slate-400">Zoom Level</Label>
                   <span className="font-black text-xs text-primary">{(zoom * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                   value={[zoom]} 
                   min={1} 
                   max={3} 
                   step={0.1} 
                   onValueChange={(val) => setZoom(val[0])} 
                />
             </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
             <Button variant="ghost" onClick={() => setCropDialogOpen(false)} className="font-bold">Cancel</Button>
             <Button 
                className="font-black rounded-xl px-8 h-12 shadow-lg" 
                disabled={isSaving}
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    const croppedBlob = await getCroppedImg(cropImageSrc!, croppedAreaPixels);
                    const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
                    
                    let response;
                    if (user?.role === 'EMPLOYER') {
                      response = await employerService.uploadLogo(file);
                    } else {
                      response = await developerService.uploadProfilePhoto(file);
                    }

                    if (response.success) {
                      setProfile(response.data);
                      setCropDialogOpen(false);
                      toast.success('Profile photo updated');
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to crop and upload photo.');
                  } finally {
                    setIsSaving(false);
                  }
                }}
             >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set Profile Photo'}
             </Button>
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
      "rounded-[2rem] border-none shadow-xl overflow-hidden relative group",
      isActive ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20" : "bg-slate-50 border border-slate-100 shadow-slate-100/50"
    )}>
       {isActive && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
       )}
       <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4">
             <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                isActive ? "bg-white text-emerald-500" : "bg-primary text-white"
             )}>
                <Zap className={cn("h-7 w-7", isActive && "fill-current")} />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                   {isActive ? 'Spotlight Active!' : 'Get Spotlight'}
                </h3>
                <p className={cn("text-xs font-bold mt-1 uppercase tracking-widest", isActive ? "text-emerald-100" : "text-slate-400")}>
                   {isActive ? 'You are being featured' : 'Boost your reach'}
                </p>
             </div>
          </div>

          {isActive ? (
             <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                   <p className="font-black text-sm">Developer of the {status.type}</p>
                   <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1">
                      Expires: {new Date(status.expiresAt).toLocaleDateString()}
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
