'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { profileApi } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/auth/onboarding-layout';
import { motion } from 'framer-motion';

export default function EmployerOnboarding() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    contactPersonName: user?.fullName || '',
    companyName: '',
    companyWebsite: '',
    industry: '',
    locationHQ: '',
    companySize: 'ONE_TO_TEN' as any
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await profileApi.createEmployerProfile(formData);
      await refreshProfile();
      toast.success('Company profile created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company profile');
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] uppercase tracking-widest font-bold text-teal mb-1.5 block";
  const inputClass = "bg-white dark:bg-[#2F3E46]/20 border-sage dark:border-teal/20 focus:border-teal focus:ring-teal/10 h-11 transition-all dark:text-sage";

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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Contact */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Contact Person</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Full Name</label>
            <Input
              value={formData.contactPersonName}
              onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
              placeholder="Alice Smith"
              required
              className={inputClass}
            />
          </div>
        </section>

        {/* Section 2: Company Details */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Company Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Tech Solutions Ltd"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Industry</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Software Development"
                required
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Verification & Size */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Verification & Scale</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Company Website</label>
              <Input
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                placeholder="https://example.com"
                required
                type="url"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Company Size</label>
              <Select
                value={formData.companySize}
                onValueChange={(val) => setFormData({ ...formData, companySize: val })}
              >
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
            </div>
          </div>
        </section>

        {/* Section 4: Location */}
        <section className="space-y-4">
          <div className="border-b pb-2 border-sage/30 mb-6">
            <h3 className="text-sm font-bold text-deep uppercase tracking-tight">Presence</h3>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Headquarters Location</label>
            <Input
              value={formData.locationHQ}
              onChange={(e) => setFormData({ ...formData, locationHQ: e.target.value })}
              placeholder="Nairobi, Kenya"
              required
              className={inputClass}
            />
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
            {loading ? 'Setting up Company...' : 'Complete Onboarding'}
          </Button>
        </motion.div>
      </form>
    </OnboardingLayout>
  );
}
