'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  CloudUpload, 
  FileText, 
  Building2, 
  MapPin, 
  X, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { developerService } from '@/services/developerService';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface ApplyDialogProps {
  open: boolean;
  onClose: () => void;
  job: any;
  onSuccess: () => void;
}

const steps = ['Profile Review', 'Upload Documents', 'Review & Submit'];

export default function ApplyDialog({ open, onClose, job, onSuccess }: ApplyDialogProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // File states
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);

  useEffect(() => {
    if (open && activeStep === 0) {
      fetchProfile();
    }
  }, [open, activeStep]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await developerService.getMyProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError('Failed to fetch profile details.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['.pdf'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        toast.error(`Invalid file type for ${type}. Only PDF is allowed.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File size for ${type} exceeds the 5MB limit.`);
        return;
      }

      if (type === 'resume') setResume(file);
      else setCoverLetter(file);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} selected`);
    }
  };

  const handleSubmit = async () => {
    if (!resume) {
      toast.error('Please upload a resume to continue.');
      return;
    }
    setLoading(true);
    try {
      const response = await jobService.applyToJob(job.id, resume, coverLetter);
      if (response.success) {
        onSuccess();
        onClose();
        setActiveStep(0);
        setResume(null);
        setCoverLetter(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-xl-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Apply for Role</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">
              {steps[activeStep]} — Step {activeStep + 1} of {steps.length}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8">
             <div className="flex justify-between mb-2">
                {steps.map((_, i) => (
                   <div key={i} className={cn(
                      "h-1.5 flex-1 mx-0.5 rounded-full transition-all duration-500",
                      i <= activeStep ? "bg-primary" : "bg-slate-800"
                   )} />
                ))}
             </div>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="bg-danger-50 border border-danger-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-danger-500" />
              <p className="text-sm font-black text-danger-900">{error}</p>
            </div>
          )}

          {activeStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Validating profile...</p>
                </div>
              ) : !profile ? (
                <div className="text-center py-8 space-y-6">
                  <div className="h-20 w-20 bg-azure-50 text-azure-500 rounded-3xl flex items-center justify-center mx-auto">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Profile Incomplete</h3>
                    <p className="text-slate-500 font-medium mt-2">Please complete your profile details before applying.</p>
                  </div>
                  <Button className="rounded-xl font-black h-12 w-full" onClick={() => { onClose(); router.push('/profile/me'); }}>
                    Go to Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl-[2rem] bg-cyan-50 border border-emerald-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cyan-600">
                       <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-emerald-900">Profile Details Loaded</p>
                       <p className="text-xs font-medium text-cyan-800">These will be shared with the employer.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</p>
                      <p className="font-medium text-slate-900">{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</p>
                      <p className="font-medium text-slate-900 truncate">{profile.publicEmail || 'Not set'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">{profile.locationCity}, {profile.locationCountry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Experience</p>
                      <p className="font-medium text-slate-900">{profile.yearsOfExperience?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills?.map((s: string) => (
                        <Badge key={s} variant="outline" className="rounded-xl bg-white border-slate-200 text-slate-900 font-medium px-2 py-0.5">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resume / CV (Required)</p>
                     <label className={cn(
                        "flex flex-col items-center justify-center p-8 rounded-xl-[2rem] border-4 border-dashed cursor-pointer transition-all",
                        resume ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/50"
                     )}>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'resume')} />
                        {resume ? (
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                                 <FileCheck className="h-6 w-6" />
                              </div>
                              <div className="text-left">
                                 <p className="font-black text-slate-900 truncate max-w-[200px]">{resume.name}</p>
                                 <p className="text-[10px] font-medium text-slate-500">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center space-y-2">
                              <CloudUpload className="h-10 w-10 text-slate-300 mx-auto" />
                              <p className="font-black text-sm">Upload PDF</p>
                              <p className="text-[10px] font-medium text-slate-500">Maximum 5MB</p>
                           </div>
                        )}
                     </label>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cover Letter (Optional)</p>
                     <label className={cn(
                        "flex flex-col items-center justify-center p-8 rounded-xl-[2rem] border-4 border-dashed cursor-pointer transition-all",
                        coverLetter ? "border-emerald-500 bg-cyan-50" : "border-slate-100 hover:border-emerald-500/50"
                     )}>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'cover')} />
                        {coverLetter ? (
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cyan-600">
                                 <FileText className="h-6 w-6" />
                              </div>
                              <div className="text-left">
                                 <p className="font-black text-slate-900 truncate max-w-[200px]">{coverLetter.name}</p>
                                 <p className="text-[10px] font-medium text-slate-500">{(coverLetter.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center space-y-2">
                              <CloudUpload className="h-10 w-10 text-slate-300 mx-auto" />
                              <p className="font-black text-sm text-slate-500 italic">Optional Cover Letter</p>
                           </div>
                        )}
                     </label>
                  </div>
               </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="p-8 rounded-xl-[2.5rem] bg-slate-900 text-white space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Applying for</p>
                  <h4 className="text-2xl font-black">{job.title}</h4>
                  <div className="flex flex-wrap gap-4 pt-2">
                     <span className="flex items-center gap-2 text-xs font-medium"><Building2 className="h-4 w-4 text-primary" /> {job.companyName}</span>
                     <span className="flex items-center gap-2 text-xs font-medium"><MapPin className="h-4 w-4 text-primary" /> {job.locationCity}, Kenya</span>
                  </div>
               </div>

               <div className="p-6 rounded-xl-[2rem] border border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Files to Submit</p>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-slate-900 truncate flex-1">{resume?.name}</span>
                        <Badge className="bg-primary/10 text-primary text-[8px] uppercase">Resume</Badge>
                     </div>
                     {coverLetter && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                           <FileText className="h-4 w-4 text-cyan-600" />
                           <span className="text-sm font-medium text-slate-900 truncate flex-1">{coverLetter.name}</span>
                           <Badge className="bg-cyan-600/10 text-cyan-600 text-[8px] uppercase">Cover Letter</Badge>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50 p-8 flex flex-row justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            size="lg" 
            className="rounded-2xl font-black h-14 px-8"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button 
              size="lg" 
              className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronRight className="mr-2 h-5 w-5" />}
              {loading ? 'Submitting...' : 'Send Application'}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20"
              onClick={handleNext}
              disabled={loading || (activeStep === 0 && !profile) || (activeStep === 1 && !resume)}
            >
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
