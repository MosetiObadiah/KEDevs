'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/hooks';
import { profileApi } from '@/lib/api/profile';
import { developerProfileSchema, DeveloperProfileFormData } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/auth/onboarding-layout';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function DeveloperOnboarding() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<DeveloperProfileFormData>({
    resolver: zodResolver(developerProfileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: user?.fullName.split(' ')[0] || '',
      lastName: user?.fullName.split(' ').slice(1).join(' ') || '',
      currentLastRole: '',
      yearsOfExperience: 'ZERO_TO_ONE',
      preferredWorkType: 'REMOTE',
      locationCity: '',
      locationCountry: '',
      bio: '',
      profileVisibility: 'PUBLIC',
      numberOfProjects: 0,
      availabilityStatus: 'OPEN_TO_OFFERS',
    },
  });

  const bioValue = watch('bio');

  async function onSubmit(data: DeveloperProfileFormData) {
    setLoading(true);
    try {
      await profileApi.createDeveloperProfile(data as any);
      await refreshProfile();
      toast.success('Profile created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] uppercase tracking-widest font-bold text-primary mb-1.5 block";
  const inputClass = "bg-white dark:bg-[#0b1a13]/20 border-secondary dark:border-primary/20 focus:border-primary focus:ring-primary/10 h-11 transition-all dark:text-secondary";

  return (
    <OnboardingLayout
      title="Complete your profile"
      subtitle="Let's build your professional identity on KEDevs."
      leftTitle="Get discovered by Top Kenyan Tech Companies"
      leftDescription="Join the elite community of developers and take your career to the next level."
      benefits={[
        "Showcase your expertise to top recruiters",
        "Access exclusive job opportunities",
        "Build trust with a verified profile",
        "Connect with other expert developers"
      ]}
      progress={90}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Identity */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Identity</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>First Name</label>
              <Input
                {...register('firstName')}
                placeholder="Jane"
                className={inputClass}
              />
              {errors.firstName && <span className="text-destructive text-xs mt-1">{errors.firstName.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Last Name</label>
              <Input
                {...register('lastName')}
                placeholder="Doe"
                className={inputClass}
              />
              {errors.lastName && <span className="text-destructive text-xs mt-1">{errors.lastName.message}</span>}
            </div>
          </div>
        </section>

        {/* Section 2: Professional */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Professional</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Current / Last Role</label>
              <Input
                {...register('currentLastRole')}
                placeholder="Senior Software Engineer"
                className={inputClass}
              />
              {errors.currentLastRole && <span className="text-destructive text-xs mt-1">{errors.currentLastRole.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Years of Experience</label>
              <Controller
                control={control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZERO_TO_ONE">Entry Level (0-1 yr)</SelectItem>
                      <SelectItem value="ONE_TO_THREE">Junior (1-3 yrs)</SelectItem>
                      <SelectItem value="THREE_TO_FIVE">Intermediate (3-5 yrs)</SelectItem>
                      <SelectItem value="FIVE_TO_TEN">Senior (5-10 yrs)</SelectItem>
                      <SelectItem value="TEN_PLUS">Expert (10+ yrs)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.yearsOfExperience && <span className="text-destructive text-xs mt-1">{errors.yearsOfExperience.message}</span>}
            </div>
          </div>
        </section>

        {/* Section 3: Location & Preferences */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Location & Preferences</h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Work Type</label>
              <Controller
                control={control}
                name="preferredWorkType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                      <SelectItem value="ONSITE">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.preferredWorkType && <span className="text-destructive text-xs mt-1">{errors.preferredWorkType.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>City</label>
              <Input
                {...register('locationCity')}
                placeholder="Nairobi"
                className={inputClass}
              />
              {errors.locationCity && <span className="text-destructive text-xs mt-1">{errors.locationCity.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Country</label>
              <Input
                {...register('locationCountry')}
                placeholder="Kenya"
                className={inputClass}
              />
              {errors.locationCountry && <span className="text-destructive text-xs mt-1">{errors.locationCountry.message}</span>}
            </div>
          </div>
        </section>

        {/* Section 4: The Hook */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">The Hook</h3>
          </div>
          <div className="flex flex-col relative">
            <label className={labelClass}>Short Bio</label>
            <Textarea
              {...register('bio')}
              placeholder="I'm a Fullstack Dev passionate about FinTech and clean architecture..."
              className="h-32 bg-white border-secondary focus:border-primary resize-none pt-3 transition-all"
              maxLength={300}
            />
            <span className="absolute bottom-3 right-3 text-[10px] font-bold text-muted-foreground">
              {bioValue?.length || 0} / 300
            </span>
            {errors.bio && <span className="text-destructive text-xs mt-1">{errors.bio.message}</span>}
          </div>
        </section>

        {/* Section 5: Visibility */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Privacy</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Profile Visibility</label>
            <Controller
              control={control}
              name="profileVisibility"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public (Visible to employers)</SelectItem>
                    <SelectItem value="PRIVATE">Private (Hidden from search)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.profileVisibility && <span className="text-destructive text-xs mt-1">{errors.profileVisibility.message}</span>}
          </div>
        </section>

        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="pt-8"
        >
          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-[#2a6f4d] text-white transition-all shadow-xl shadow-primary/20 rounded-lg"
          >
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Profile...</> : 'Finish Onboarding'}
          </Button>
        </motion.div>
      </form>
    </OnboardingLayout>
  );
}
