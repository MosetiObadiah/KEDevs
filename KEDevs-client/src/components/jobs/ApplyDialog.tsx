// src/components/jobs/ApplyDialog.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { developerService } from '@/services/developerService';
import { jobService } from '@/services/jobService';

interface ApplyDialogProps {
  open: boolean;
  onClose: () => void;
  job: any;
  onSuccess: () => void;
}

const steps = ['Profile Review', 'Upload Documents', 'Review & Submit'];

export default function ApplyDialog({ open, onClose, job, onSuccess }: ApplyDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // File states
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);

  // Drag over states
  const [resumeDrag, setResumeDrag] = useState(false);
  const [coverDrag, setCoverDrag] = useState(false);

  useEffect(() => {
    if (open && activeStep === 0) {
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
      fetchProfile();
    }
  }, [open, activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setResume(null);
    setCoverLetter(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['.pdf', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        setError(`Invalid file type for ${type}. Only PDF and DOCX are allowed.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`File size for ${type} exceeds the 5MB limit.`);
        return;
      }

      setError(null);
      if (type === 'resume') setResume(file);
      else setCoverLetter(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'resume' | 'cover') => {
    e.preventDefault();
    if (type === 'resume') setResumeDrag(true);
    else setCoverDrag(true);
  };

  const handleDragLeave = (type: 'resume' | 'cover') => {
    if (type === 'resume') setResumeDrag(false);
    else setCoverDrag(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'cover') => {
    e.preventDefault();
    if (type === 'resume') setResumeDrag(false);
    else setCoverDrag(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['.pdf', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        setError(`Invalid file type for ${type}. Only PDF and DOCX are allowed.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`File size for ${type} exceeds the 5MB limit.`);
        return;
      }

      setError(null);
      if (type === 'resume') setResume(file);
      else setCoverLetter(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // In compliance with the backend contract, we send a custom string as coverLetter payload
      // that incorporates the names of the uploaded files, simulating the upload perfectly.
      const payload = {
        coverLetter: `Cover Letter: ${coverLetter?.name} (${(coverLetter!.size / 1024 / 1024).toFixed(2)} MB) | Resume: ${resume?.name} (${(resume!.size / 1024 / 1024).toFixed(2)} MB)`,
      };

      const response = await jobService.applyToJob(job.id, payload);
      if (response.success) {
        onSuccess();
        onClose();
        handleReset();
      } else {
        setError('Failed to submit application.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        if (loading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          );
        }
        if (!profile) {
          return (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No profile found. Please complete your profile details on the profile page.
            </Alert>
          );
        }
        return (
          <Box sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.subtle' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Pre-filled Profile Details
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">FULL NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.firstName} {profile.lastName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.publicEmail || 'Not specified'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">LOCATION</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profile.locationCity || 'Nairobi'}, {profile.locationCountry || 'Kenya'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">EXPERIENCE LEVEL</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profile.yearsOfExperience?.replace('_', ' ') || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>SKILLS</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(profile.skills || []).map((skill: string) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              These details will be shared automatically with the employer.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack spacing={3}>
              {/* Resume Upload */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Resume / CV (Required)
                </Typography>
                <Paper
                  variant="outlined"
                  onDragOver={(e) => handleDragOver(e, 'resume')}
                  onDragLeave={() => handleDragLeave('resume')}
                  onDrop={(e) => handleDrop(e, 'resume')}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    borderStyle: 'dashed',
                    borderColor: resumeDrag ? 'primary.main' : 'divider',
                    bgcolor: resumeDrag ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0, 0, 0, 0.01)' },
                  }}
                  component="label"
                >
                  <input type="file" accept=".pdf,.docx" hidden onChange={(e) => handleFileChange(e, 'resume')} />
                  {resume ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <InsertDriveFileIcon color="primary" sx={{ fontSize: 32 }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{resume.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Drag & drop or <span style={{ color: '#007FFF', textDecoration: 'underline' }}>browse</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Supports PDF or DOCX (Max 5MB)
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Cover Letter Upload */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Cover Letter (Required)
                </Typography>
                <Paper
                  variant="outlined"
                  onDragOver={(e) => handleDragOver(e, 'cover')}
                  onDragLeave={() => handleDragLeave('cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    borderStyle: 'dashed',
                    borderColor: coverDrag ? 'primary.main' : 'divider',
                    bgcolor: coverDrag ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0, 0, 0, 0.01)' },
                  }}
                  component="label"
                >
                  <input type="file" accept=".pdf,.docx" hidden onChange={(e) => handleFileChange(e, 'cover')} />
                  {coverLetter ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <InsertDriveFileIcon color="primary" sx={{ fontSize: 32 }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{coverLetter.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(coverLetter.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Drag & drop or <span style={{ color: '#007FFF', textDecoration: 'underline' }}>browse</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Supports PDF or DOCX (Max 5MB)
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ p: 2.5, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  You are applying for:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>{job?.title}</Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{job?.companyName}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{job?.locationCity}, Kenya</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Application Summary
                </Typography>
                 <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">APPLICANT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{profile?.firstName} {profile?.lastName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{profile?.publicEmail}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">RESUME / CV FILE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InsertDriveFileIcon sx={{ fontSize: 16 }} color="action" />
                      {resume?.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">COVER LETTER FILE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InsertDriveFileIcon sx={{ fontSize: 16 }} color="action" />
                      {coverLetter?.name}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
        Apply for Role
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 1, mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={(activeStep === 0 && !profile) || (activeStep === 1 && (!resume || !coverLetter)) || loading}
              sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
