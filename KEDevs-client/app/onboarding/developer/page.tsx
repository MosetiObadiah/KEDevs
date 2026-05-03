'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { profileApi } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/auth/onboarding-layout';
import { motion } from 'framer-motion';

export default function DeveloperOnboarding() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.fullName.split(' ')[0] || '',
    lastName: user?.fullName.split(' ').slice(1).join(' ') || '',
    currentLastRole: '',
    yearsOfExperience: 'ZERO_TO_ONE' as any,
    preferredWorkType: 'REMOTE' as any,
    locationCity: '',
    locationCountry: '',
    bio: '',
    profileVisibility: 'PUBLIC' as any,
    numberOfProjects: 0
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await profileApi.createDeveloperProfile(formData);
      await refreshProfile();
      toast.success('Profile created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] uppercase tracking-widest font-bold text-teal mb-1.5 block";
  const inputClass = "bg-white dark:bg-[#2F3E46]/20 border-sage dark:border-teal/20 focus:border-teal focus:ring-teal/10 h-11 transition-all dark:text-sage";

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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identity */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Identity</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Professional */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Professional</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Current / Last Role</label>
              <Input
                value={formData.currentLastRole}
                onChange={(e) => setFormData({ ...formData, currentLastRole: e.target.value })}
                placeholder="Senior Software Engineer"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Years of Experience</label>
              <Select
                value={formData.yearsOfExperience}
                onValueChange={(val) => setFormData({ ...formData, yearsOfExperience: val })}
              >
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
            </div>
          </div>
        </section>

        {/* Section 3: Location & Preferences */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Location & Preferences</h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Work Type</label>
              <Select
                value={formData.preferredWorkType}
                onValueChange={(val) => setFormData({ ...formData, preferredWorkType: val })}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>City</label>
              <Input
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                placeholder="Nairobi"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Country</label>
              <Input
                value={formData.locationCountry}
                onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                placeholder="Kenya"
                required
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 4: The Hook */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">The Hook</h3>
          </div>
          <div className="flex flex-col relative">
            <label className={labelClass}>Short Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="I'm a Fullstack Dev passionate about FinTech and clean architecture..."
              className="h-32 bg-white border-sage focus:border-teal resize-none pt-3 transition-all"
              maxLength={300}
            />
            <span className="absolute bottom-3 right-3 text-[10px] font-bold text-fern">
              {formData.bio.length} / 300
            </span>
          </div>
        </section>

        {/* Section 5: Visibility */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Privacy</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Profile Visibility</label>
            <Select
              value={formData.profileVisibility}
              onValueChange={(val) => setFormData({ ...formData, profileVisibility: val })}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public (Visible to employers)</SelectItem>
                <SelectItem value="PRIVATE">Private (Hidden from search)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="pt-8"
        >
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-teal hover:bg-forest text-white transition-all shadow-xl shadow-teal/20 rounded-lg"
          >
            {loading ? 'Creating Profile...' : 'Finish Onboarding'}
          </Button>
        </motion.div>
      </form>
    </OnboardingLayout>
  );
}
