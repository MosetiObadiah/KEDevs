'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { JobPost, WorkType, ExperienceLevel, JobType, JobVisibility } from '@/lib/types/job';
import { createJob, updateJob } from '@/lib/api/jobs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  visibility: z.enum(['EXTERNAL', 'INTERNAL'] as [JobVisibility, ...JobVisibility[]]),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID'] as [WorkType, ...WorkType[]]),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as [JobType, ...JobType[]]),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as [ExperienceLevel, ...ExperienceLevel[]]),
  locationCity: z.string().optional(),
  locationCountry: z.string().optional(),
  salary: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: JobPost; // If present, we are in EDIT mode
}

export function JobFormModal({ isOpen, onClose, job }: JobFormModalProps) {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job ? {
      title: job.title,
      description: job.description,
      visibility: job.visibility,
      workType: job.workType,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      locationCity: job.locationCity || '',
      locationCountry: job.locationCountry || '',
      salary: job.salary || '',
    } : {
      visibility: 'EXTERNAL',
      workType: 'REMOTE',
      jobType: 'FULL_TIME',
      experienceLevel: 'ENTRY',
    },
  });

  // Sync select values with react-hook-form
  const visibility = watch('visibility');
  const workType = watch('workType');
  const jobType = watch('jobType');
  const experienceLevel = watch('experienceLevel');

  useEffect(() => {
    if (isOpen) {
      if (job) {
        reset({
          title: job.title,
          description: job.description,
          visibility: job.visibility,
          workType: job.workType,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          locationCity: job.locationCity || '',
          locationCountry: job.locationCountry || '',
          salary: job.salary || '',
        });
        if (job.tags) {
          setTags(job.tags.map((t: any) => typeof t === 'string' ? t : t.tag));
        } else {
          setTags([]);
        }
      } else {
        reset({
          visibility: 'EXTERNAL',
          workType: 'REMOTE',
          jobType: 'FULL_TIME',
          experienceLevel: 'ENTRY',
          locationCity: '',
          locationCountry: '',
          salary: '',
          title: '',
          description: '',
        });
        setTags([]);
      }
    }
  }, [isOpen, job, reset]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const payload = {
        ...data,
        tags: tags,
        isPeerSourced: false,
      };

      if (job) {
        await updateJob(job.id, payload);
        toast.success('Job updated successfully');
      } else {
        await createJob(payload);
        toast.success('Job posted successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2F3E46]">
            {job ? 'Edit Job Posting' : 'Post a New Opportunity'}
          </DialogTitle>
          <DialogDescription>
            {job ? 'Update the details for your existing job post.' : 'Reach the best Kenyan tech talent by detailing your requirements.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Engineer (React)"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, requirements, and benefits..."
                className={cn("min-h-[150px]", errors.description ? 'border-red-500' : '')}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(val) => setValue('visibility', val as JobVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXTERNAL">External (Public)</SelectItem>
                  <SelectItem value="INTERNAL">Internal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Work Type</Label>
              <Select value={workType} onValueChange={(val) => setValue('workType', val as WorkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={experienceLevel} onValueChange={(val) => setValue('experienceLevel', val as ExperienceLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">Entry Level</SelectItem>
                  <SelectItem value="MID">Mid Level</SelectItem>
                  <SelectItem value="SENIOR">Senior Level</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Job Category</Label>
              <Select value={jobType} onValueChange={(val) => setValue('jobType', val as JobType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCity">City</Label>
              <Input id="locationCity" placeholder="e.g. Nairobi" {...register('locationCity')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range (Optional)</Label>
              <Input id="salary" placeholder="e.g. 150k - 250k KES" {...register('salary')} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Skills & Tags (Max 5)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. react, nodejs"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-[#52796F]/10 text-[#52796F] px-2 py-1 rounded-lg text-sm font-semibold"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#52796F] hover:bg-[#354F52] text-white min-w-[120px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {job ? 'Save Changes' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
