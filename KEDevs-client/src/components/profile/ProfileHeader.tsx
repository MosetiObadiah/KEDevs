import React from 'react';
import { MapPin, Briefcase, ShieldCheck, Globe, Camera, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatExperience, formatAvailability, formatWorkType, toTitleCase } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileHeaderProps {
  profile: any;
  isOwner?: boolean;
  isEditing?: boolean;
  onUpdate?: (data: any) => void;
  onPhotoSelect?: (file: File) => void;
}

export function ProfileHeader({ profile, isOwner, isEditing, onUpdate, onPhotoSelect }: ProfileHeaderProps) {

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`;
  const profileImage = profile.profilePhoto || profile.avatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoSelect) {
      onPhotoSelect(file);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col md:flex-row items-start gap-8 mb-10 bg-white p-8 rounded-[2.5rem] border border-primary/20 shadow-xl shadow-primary/5">
        <div className="relative group">
          <Avatar className="w-32 h-32 rounded-[2rem] border-4 border-background shadow-xl overflow-hidden bg-white">
            <AvatarImage src={profileImage} className="object-cover" />
            <AvatarFallback className="bg-primary text-white text-4xl font-black">
              {initials || 'DEV'}
            </AvatarFallback>
          </Avatar>
          {isOwner && (
            <Label htmlFor="dev-photo-upload" className="absolute bottom-2 right-2 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-20 border-4 border-white">
              <Camera className="h-5 w-5" />
              <input
                id="dev-photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Label>
          )}
        </div>

        <div className="space-y-6 flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
              <Input
                value={profile.firstName || ''}
                onChange={(e) => onUpdate?.({ ...profile, firstName: e.target.value })}
                className="h-12 rounded-xl border-slate-200 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
              <Input
                value={profile.lastName || ''}
                onChange={(e) => onUpdate?.({ ...profile, lastName: e.target.value })}
                className="h-12 rounded-xl border-slate-200 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Role</Label>
            <Input
              value={profile.currentLastRole || ''}
              onChange={(e) => onUpdate?.({ ...profile, currentLastRole: e.target.value })}
              className="h-12 rounded-xl border-slate-200 focus:border-primary"
              placeholder="e.g. Senior Android Developer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Experience</Label>
              <Select value={profile.yearsOfExperience} onValueChange={(v) => onUpdate?.({ ...profile, yearsOfExperience: v })}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="ZERO_TO_ONE">0 - 1 Year</SelectItem>
                  <SelectItem value="ONE_TO_THREE">1 - 3 Years</SelectItem>
                  <SelectItem value="THREE_TO_FIVE">3 - 5 Years</SelectItem>
                  <SelectItem value="FIVE_TO_TEN">5 - 10 Years</SelectItem>
                  <SelectItem value="TEN_PLUS">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Type</Label>
              <Select value={profile.preferredWorkType} onValueChange={(v) => onUpdate?.({ ...profile, preferredWorkType: v })}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Availability</Label>
              <Select value={profile.availabilityStatus} onValueChange={(v) => onUpdate?.({ ...profile, availabilityStatus: v })}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="OPEN_TO_OFFERS">Open to Offers</SelectItem>
                  <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</Label>
              <Input
                value={profile.locationCity || ''}
                onChange={(e) => onUpdate?.({ ...profile, locationCity: e.target.value })}
                className="h-12 rounded-xl border-slate-200 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
              <Input
                value={profile.locationCountry || ''}
                onChange={(e) => onUpdate?.({ ...profile, locationCountry: e.target.value })}
                className="h-12 rounded-xl border-slate-200 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
      <div className="relative group">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-background shadow-xl overflow-hidden bg-white">
          <AvatarImage src={profileImage} className="object-cover" />
          <AvatarFallback className="bg-primary text-white text-4xl font-black">
            {initials || 'DEV'}
          </AvatarFallback>
        </Avatar>
        {isOwner && (
          <Label htmlFor="dev-photo-upload-view" className="absolute bottom-1 right-1 h-8 w-8 md:h-10 md:w-10 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-20 border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-4 w-4 md:h-5 w-5" />
            <input
              id="dev-photo-upload-view"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Label>
        )}
      </div>

      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {toTitleCase(`${profile.firstName || ''} ${profile.lastName || ''}`)}
          </h1>
          {profile.isVerified && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold tracking-wider text-[10px] uppercase h-6 px-2">
              <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED
            </Badge>
          )}
        </div>

        <p className="text-xl font-medium text-muted-foreground">{profile.currentLastRole || 'Software Engineer'}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {toTitleCase(profile.locationCity || 'Nairobi')}, {toTitleCase(profile.locationCountry || 'Kenya')}
          </span>
          <span className="hidden md:block text-muted-foreground/30">•</span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="font-black uppercase tracking-wider text-[10px] text-slate-400">Years of Experience:</span>
            <span className="text-foreground">{formatExperience(profile.yearsOfExperience)}</span>
          </span>
          <span className="hidden md:block text-muted-foreground/30">•</span>
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 normal-case">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="font-black uppercase tracking-wider text-[10px] text-slate-400">Preferred Work:</span>
            {formatWorkType(profile.preferredWorkType || 'REMOTE')}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Availability:</span>
          <Badge variant={profile.availabilityStatus === 'OPEN_TO_OFFERS' ? 'default' : 'secondary'} className="rounded-lg font-black tracking-widest text-[10px] uppercase px-3 py-1">
            {formatAvailability(profile.availabilityStatus)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
