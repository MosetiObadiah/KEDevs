'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/hooks';
import { profileApi } from '@/lib/api/profile';
import { employerProfileSchema, EmployerProfileFormData } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/auth/onboarding-layout';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function EmployerOnboarding() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<EmployerProfileFormData>({
    resolver: zodResolver(employerProfileSchema),
    mode: 'onChange',
    defaultValues: {
      contactPersonName: user?.fullName || '',
      companyName: '',
      companyWebsite: '',
      industry: '',
      locationHQ: '',
      companySize: 'ONE_TO_TEN',
      companyBio: '',
      logoUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
    },
  });

  async function onSubmit(data: EmployerProfileFormData) {
    setLoading(true);
    try {
      await profileApi.createEmployerProfile(data as any);
      await refreshProfile();
      toast.success('Company profile created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company profile');
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] uppercase tracking-widest font-bold text-primary mb-1.5 block";
  const inputClass = "bg-white dark:bg-[#0b1a13]/20 border-secondary dark:border-primary/20 focus:border-primary focus:ring-primary/10 h-11 transition-all dark:text-secondary";

  return (
    <OnboardingLayout
      title="Setup Your Company"
      subtitle="Tell us about your company to start hiring top developers."
      leftTitle="Hire the Best Kenyan Tech Talent"
      leftDescription="Access a curated pool of expert developers ready to build the future of your company."
      benefits={[
        "Post jobs and reach thousands of devs",
        "Advanced filtering and search tools",
        "Direct communication with candidates",
        "Manage applications in one place"
      ]}
      progress={90}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Contact */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Contact Person</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Full Name</label>
            <Input
              {...register('contactPersonName')}
              placeholder="Alice Smith"
              className={inputClass}
            />
            {errors.contactPersonName && <span className="text-destructive text-xs mt-1">{errors.contactPersonName.message}</span>}
          </div>
        </section>

        {/* Section 2: Company Details */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Company Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Company Name</label>
              <Input
                {...register('companyName')}
                placeholder="Tech Solutions Ltd"
                className={inputClass}
              />
              {errors.companyName && <span className="text-destructive text-xs mt-1">{errors.companyName.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Industry</label>
              <Input
                {...register('industry')}
                placeholder="Software Development"
                className={inputClass}
              />
              {errors.industry && <span className="text-destructive text-xs mt-1">{errors.industry.message}</span>}
            </div>
          </div>
        </section>

        {/* Section 3: Verification & Size */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Verification & Scale</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Company Website</label>
              <Input
                {...register('companyWebsite')}
                placeholder="https://example.com"
                type="url"
                className={inputClass}
              />
              {errors.companyWebsite && <span className="text-destructive text-xs mt-1">{errors.companyWebsite.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Company Size</label>
              <Controller
                control={control}
                name="companySize"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE_TO_TEN">1-10 employees</SelectItem>
                      <SelectItem value="TEN_TO_FIFTY">10-50 employees</SelectItem>
                      <SelectItem value="FIFTY_TO_TWO_HUNDRED">50-200 employees</SelectItem>
                      <SelectItem value="TWO_HUNDRED_PLUS">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.companySize && <span className="text-destructive text-xs mt-1">{errors.companySize.message}</span>}
            </div>
          </div>
        </section>

        {/* Section 4: Location */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-secondary/30 mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Presence</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Headquarters Location</label>
            <Input
              {...register('locationHQ')}
              placeholder="Nairobi, Kenya"
              className={inputClass}
            />
            {errors.locationHQ && <span className="text-destructive text-xs mt-1">{errors.locationHQ.message}</span>}
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
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting up Company...</> : 'Complete Onboarding'}
          </Button>
        </motion.div>
      </form>
    </OnboardingLayout>
  );
}
