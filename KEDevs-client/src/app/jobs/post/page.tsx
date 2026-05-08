'use client';

import React, { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Autocomplete,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { employerService } from '@/services/employerService';
import { JobType, WorkType, ExperienceLevel, JobVisibility } from '@/lib/types';

const jobTypes: JobType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const workTypes: WorkType[] = ['REMOTE', 'ONSITE', 'HYBRID'];
const experienceLevels: ExperienceLevel[] = ['ENTRY', 'MID', 'SENIOR', 'LEAD'];
const visibilityOptions: JobVisibility[] = ['PUBLIC', 'PRIVATE'];


interface FormState {
  title: string;
  summary: string;
  description: string;
  companyName: string;
  locationCity: string;
  locationCountry: string;
  jobType: JobType | null;
  workType: WorkType | null;
  experienceLevel: ExperienceLevel | null;
  minQualification: string;
  minExperienceYears: number | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string;
  applicationDeadline: string | null;
  sourceUrl: string;
  isPeerSourced: boolean;
  visibility: JobVisibility | null;
  tags: string[];
}

const initialFormState: FormState = {
  title: '',
  summary: '',
  description: '',
  companyName: '',
  locationCity: 'Nairobi',
  locationCountry: 'Kenya',
  jobType: 'FULL_TIME',
  workType: 'REMOTE',
  experienceLevel: 'MID',
  minQualification: 'BACHELORS',
  minExperienceYears: 1,
  salaryRangeMin: null,
  salaryRangeMax: null,
  salaryCurrency: 'KES',
  applicationDeadline: null,
  sourceUrl: '',
  isPeerSourced: false,
  visibility: 'PUBLIC',
  tags: [],
};

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: any }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

interface StepConfig {
  label: string;
  key: string;
  validate: (state: FormState, userRole: string) => Record<string, string>;
  render: (state: FormState, dispatch: React.Dispatch<FormAction>, errors: Record<string, string>) => React.ReactNode;
}

export default function CreateJobPostPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);

  const isEmployer = user?.role === 'EMPLOYER';
  const isDeveloper = user?.role === 'DEVELOPER';

  // Draft saving
  useEffect(() => {
    const savedDraft = localStorage.getItem('jobPostDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        dispatch({ type: 'UPDATE_FIELD', field: 'title', value: draft.title || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'summary', value: draft.summary || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'description', value: draft.description || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'companyName', value: draft.companyName || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'locationCity', value: draft.locationCity || 'Nairobi' });
        dispatch({ type: 'UPDATE_FIELD', field: 'locationCountry', value: draft.locationCountry || 'Kenya' });
        dispatch({ type: 'UPDATE_FIELD', field: 'jobType', value: draft.jobType || 'FULL_TIME' });
        dispatch({ type: 'UPDATE_FIELD', field: 'workType', value: draft.workType || 'REMOTE' });
        dispatch({ type: 'UPDATE_FIELD', field: 'experienceLevel', value: draft.experienceLevel || 'MID_LEVEL' });
        dispatch({ type: 'UPDATE_FIELD', field: 'minQualification', value: draft.minQualification || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'minExperienceYears', value: draft.minExperienceYears || 1 });
        dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMin', value: draft.salaryRangeMin || null });
        dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMax', value: draft.salaryRangeMax || null });
        dispatch({ type: 'UPDATE_FIELD', field: 'salaryCurrency', value: draft.salaryCurrency || 'KES' });
        dispatch({ type: 'UPDATE_FIELD', field: 'applicationDeadline', value: draft.applicationDeadline || null });
        dispatch({ type: 'UPDATE_FIELD', field: 'sourceUrl', value: draft.sourceUrl || '' });
        dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: draft.isPeerSourced || false });
        dispatch({ type: 'UPDATE_FIELD', field: 'visibility', value: (draft.visibility as JobVisibility) || 'PUBLIC' });
        dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: draft.tags || [] });
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem('jobPostDraft', JSON.stringify(formState));
    };
    const timeoutId = setTimeout(saveDraft, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [formState]);

  // Warn on leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const steps: StepConfig[] = [
    ...(isDeveloper ? [{
      label: 'Job Nature',
      key: 'jobNature',
      validate: (state: FormState) => ({}), // Always valid after selection
      render: (state: FormState, dispatch: React.Dispatch<FormAction>, errors: Record<string, string>) => (
        <Stack spacing={3}>
          <Typography variant="h6">What type of job are you posting?</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card
              sx={{
                flex: 1,
                border: state.isPeerSourced ? '2px solid primary.main' : '1px solid',
                borderColor: state.isPeerSourced ? 'primary.main' : 'divider',
              }}
            >
              <CardActionArea onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: true })}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h5" gutterBottom>Peer-Sourced</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share a job opportunity you found externally
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            <Card
              sx={{
                flex: 1,
                border: !state.isPeerSourced ? '2px solid primary.main' : '1px solid',
                borderColor: !state.isPeerSourced ? 'primary.main' : 'divider',
              }}
            >
              <CardActionArea onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'isPeerSourced', value: false })}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h5" gutterBottom>Personal</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Post a job from your own company or network
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Stack>
        </Stack>
      ),
    }] : []),
    {
      label: 'Job Details',
      key: 'details',
      validate: (state) => {
        const errors: Record<string, string> = {};
        if (!state.title.trim()) errors.title = 'Title is required';
        if (!state.description.trim()) errors.description = 'Description is required';
        if (isEmployer && !state.companyName.trim()) errors.companyName = 'Company name is required';
        if (state.tags.length === 0) errors.tags = 'At least one tag is required';
        return errors;
      },
      render: (state, dispatch, errors) => (
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Job Title"
            value={state.title}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })}
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            fullWidth
            label="Short Summary"
            value={state.summary}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'summary', value: e.target.value })}
            helperText="A brief overview of the role"
          />
          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Full Description"
            value={state.description}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value })}
            error={!!errors.description}
            helperText={errors.description || "Add responsibilities, technology stack, and what makes this role special"}
          />
          {!isDeveloper && (
            <TextField
              fullWidth
              label="Company Name"
              value={state.companyName}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'companyName', value: e.target.value })}
              disabled={isEmployer}
              error={!!errors.companyName}
              helperText={errors.companyName}
            />
          )}
          <Autocomplete
            multiple
            freeSolo
            options={['react', 'node', 'javascript', 'python', 'java', 'spring-boot', 'aws', 'docker', 'kubernetes', 'typescript', 'nextjs', 'flutter', 'go', 'rust']}
            value={state.tags}
            onChange={(event, newValue) => dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Job Tags"
                placeholder="Type and press Enter to add tags..."
                error={!!errors.tags}
                helperText={errors.tags || "Add tags like frontend, backend, remote, react"}
              />
            )}
          />
        </Stack>
      ),
    },
    {
      label: 'Requirements',
      key: 'requirements',
      validate: (state) => {
        const errors: Record<string, string> = {};
        if (!state.experienceLevel) errors.experienceLevel = 'Experience level is required';
        if (state.minExperienceYears !== null && state.minExperienceYears < 0) errors.minExperienceYears = 'Must be non-negative';
        return errors;
      },
      render: (state, dispatch, errors) => (
        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Experience Level"
            value={state.experienceLevel || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'experienceLevel', value: e.target.value })}
            error={!!errors.experienceLevel}
            helperText={errors.experienceLevel}
          >
            {experienceLevels.map((option) => (
              <MenuItem key={option} value={option}>{option.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Minimum Qualification"
            value={state.minQualification || 'BACHELORS'}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'minQualification', value: e.target.value })}
          >
            <MenuItem value="NONE">No Minimum Requirement</MenuItem>
            <MenuItem value="HIGH_SCHOOL">High School Diploma</MenuItem>
            <MenuItem value="CERTIFICATE">Professional Certificate</MenuItem>
            <MenuItem value="DIPLOMA">Diploma</MenuItem>
            <MenuItem value="ASSOCIATES">Associate's Degree</MenuItem>
            <MenuItem value="BACHELORS">Bachelor's Degree</MenuItem>
            <MenuItem value="MASTERS">Master's Degree</MenuItem>
            <MenuItem value="PHD">PhD</MenuItem>
            <MenuItem value="SELF_TAUGHT">Self-Taught / Bootcamp</MenuItem>
            <MenuItem value="EQUIVALENT_EXPERIENCE">Equivalent Work Experience</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Min Experience Years"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={state.minExperienceYears || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'minExperienceYears', value: e.target.value ? Number(e.target.value) : null })}
            error={!!errors.minExperienceYears}
            helperText={errors.minExperienceYears}
          />
        </Stack>
      ),
    },
    {
      label: 'Location & Pay',
      key: 'location',
      validate: (state) => {
        const errors: Record<string, string> = {};
        if (!state.workType) errors.workType = 'Work type is required';
        if (state.salaryRangeMin !== null && state.salaryRangeMax !== null && state.salaryRangeMin > state.salaryRangeMax) {
          errors.salaryRangeMin = 'Min salary cannot be greater than max';
        }
        if (state.applicationDeadline && new Date(state.applicationDeadline) <= new Date()) {
          errors.applicationDeadline = 'Deadline must be in the future';
        }
        return errors;
      },
      render: (state, dispatch, errors) => (
        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Work Type"
            value={state.workType || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'workType', value: e.target.value })}
            error={!!errors.workType}
            helperText={errors.workType}
          >
            {workTypes.map((option) => (
              <MenuItem key={option} value={option}>{option.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="City"
              value={state.locationCity}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCity', value: e.target.value })}
            />
            <TextField
              fullWidth
              label="Country"
              value={state.locationCountry}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'locationCountry', value: e.target.value })}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Salary Min"
              type="number"
              value={state.salaryRangeMin || ''}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMin', value: e.target.value ? Number(e.target.value) : null })}
              error={!!errors.salaryRangeMin}
              helperText={errors.salaryRangeMin}
            />
            <TextField
              fullWidth
              label="Salary Max"
              type="number"
              value={state.salaryRangeMax || ''}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryRangeMax', value: e.target.value ? Number(e.target.value) : null })}
            />
            <TextField
              fullWidth
              label="Currency"
              value={state.salaryCurrency}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'salaryCurrency', value: e.target.value })}
            />
          </Stack>
          <TextField
            fullWidth
            label="Application Deadline"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={state.applicationDeadline || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'applicationDeadline', value: e.target.value })}
            error={!!errors.applicationDeadline}
            helperText={errors.applicationDeadline}
          />
        </Stack>
      ),
    },
    {
      label: 'Visibility',
      key: 'visibility',
      validate: (state) => {
        const errors: Record<string, string> = {};
        if (!state.visibility) errors.visibility = 'Visibility is required';
        return errors;
      },
      render: (state, dispatch, errors) => (
        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Visibility"
            value={state.visibility || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'visibility', value: e.target.value })}
            error={!!errors.visibility}
            helperText={errors.visibility}
          >
            {visibilityOptions.map((option) => (
              <MenuItem key={option} value={option}>{option === 'PUBLIC' ? 'Public' : 'Private'}</MenuItem>
            ))}
          </TextField>
          {state.isPeerSourced && (
            <TextField
              fullWidth
              label="External Source URL (optional)"
              value={state.sourceUrl}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'sourceUrl', value: e.target.value })}
              helperText="If this is a peer-sourced job, add the original posting URL"
            />
          )}
        </Stack>
      ),
    },
  ];

  const handleNext = () => {
    const currentStepConfig = steps[activeStep];
    const errors = currentStepConfig.validate(formState, user?.role || '');
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors before proceeding.');
      return;
    }
    setError(null);
    setCompleted((prev) => new Set(prev).add(activeStep));
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < activeStep || completed.has(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  const handleSubmit = async () => {
    const allErrors: Record<string, string> = {};
    steps.forEach((step) => {
      Object.assign(allErrors, step.validate(formState, user?.role || ''));
    });
    if (Object.keys(allErrors).length > 0) {
      setError('Please complete all required fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formState,
        applicationDeadline: formState.applicationDeadline ? new Date(formState.applicationDeadline).toISOString().split('T')[0] : null,
        tags: formState.tags,
      };
      const response = await jobService.postJob(payload);
      if (response.success) {
        setSuccessMessage('Job post created successfully. Redirecting...');
        localStorage.removeItem('jobPostDraft'); // Clear draft on success
        setTimeout(() => {
          if (isDeveloper) {
            router.push('/jobs');
          } else {
            router.push(`/jobs/${response.data.id}`);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to create job post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Sign in to post a job</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to be logged in to submit job opportunities on KEDevs.
          </Typography>
          <Button component={Link} href="/login" variant="contained" size="large">
            Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Post a Job</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new job post and connect with qualified developers.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.key} completed={completed.has(index)}>
              <StepLabel onClick={() => handleStepClick(index)} sx={{ cursor: index <= activeStep || completed.has(index) ? 'pointer' : 'default' }}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

        <Box sx={{ mb: 4 }}>
          {steps[activeStep].render(formState, dispatch, steps[activeStep].validate(formState, user?.role || ''))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
