// src/app/onboarding/employer/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BusinessIcon from '@mui/icons-material/Business';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import PeopleIcon from '@mui/icons-material/People';
import { employerService } from '@/services/employerService';
import { KENYA_COUNTIES, INDUSTRIES } from '@/lib/constants';

const steps = ['Company Profile', 'Contact & Presence', 'Review & Submit'];

const COMPANY_SIZES = [
  { value: 'ONE_TO_TEN', label: '1–10 employees' },
  { value: 'TEN_TO_FIFTY', label: '11–50 employees' },
  { value: 'FIFTY_TO_TWO_HUNDRED', label: '51–200 employees' },
  { value: 'TWO_HUNDRED_PLUS', label: '200+ employees' },
];

const menuProps = {
  slotProps: {
    select: {
      MenuProps: {
        slotProps: { paper: { sx: { maxHeight: 300, overflow: 'auto' } } },
      },
    },
  },
};

interface FormData {
  companyName: string;
  industry: string;
  companySize: string;
  locationCity: string;
  companyBio: string;
  contactPersonName: string;
  contactEmail: string;
  websiteUrl: string;
  linkedinUrl: string;
  twitterHandle: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function EmployerOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { completeOnboarding, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    companySize: 'TEN_TO_FIFTY',
    locationCity: '',
    companyBio: '',
    contactPersonName: user?.fullName || '',
    contactEmail: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterHandle: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: FieldErrors = {};

    if (step === 0) {
      if (!formData.companyName.trim()) errors.companyName = 'Company name is required.';
      if (!formData.industry) errors.industry = 'Please select an industry.';
      if (!formData.companySize) errors.companySize = 'Please select a company size.';
      if (!formData.locationCity) errors.locationCity = 'Please select your county / HQ.';
      if (!formData.companyBio.trim()) errors.companyBio = 'A short company bio is required.';
      else if (formData.companyBio.trim().length < 20)
        errors.companyBio = 'Bio must be at least 20 characters.';
    }

    if (step === 1) {
      if (!formData.contactPersonName.trim())
        errors.contactPersonName = 'Contact person name is required.';
      if (!formData.contactEmail.trim()) {
        errors.contactEmail = 'Contact email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      if (!validateStep(activeStep)) return;
      setActiveStep((prev) => prev + 1);
      return;
    }

    // Final submit
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await employerService.createProfile({
        contactPersonName: formData.contactPersonName.trim() || user?.fullName || 'Employer',
        companyName: formData.companyName.trim(),
        companyBio: formData.companyBio.trim(),
        companyWebsite: formData.websiteUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        twitterUrl: formData.twitterHandle.trim(),
        industry: formData.industry,
        companySize: formData.companySize,
        locationHQ: formData.locationCity ? `${formData.locationCity}, Kenya` : 'Nairobi, Kenya',
        logoUrl: '',
        contactEmail: formData.contactEmail.trim() || user?.email || '',
      });

      if (response.success) {
        completeOnboarding();
        router.push('/pending-approval');
      } else {
        setSubmitError('Submission failed. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create employer profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setFieldErrors({});
  };

  const companySizeLabel = COMPANY_SIZES.find((s) => s.value === formData.companySize)?.label || '';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          boxShadow: '0 10px 60px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <Stack alignItems="center" spacing={1} sx={{ mb: 5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <BusinessIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Build Your{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Company Profile
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Join KEDevs to find and hire the best tech talent in Kenya. This takes about 2 minutes.
          </Typography>
        </Stack>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          sx={{ minHeight: 380 }}
        >
          {/* ─── STEP 0: Company Profile ─── */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <BusinessIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Company Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All fields marked * are required.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Company Name */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. TechFlow Solutions Ltd"
                    error={!!fieldErrors.companyName}
                    helperText={fieldErrors.companyName}
                  />
                </Grid>

                {/* Industry */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Industry *"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    error={!!fieldErrors.industry}
                    helperText={fieldErrors.industry || 'Your primary business sector'}
                    {...menuProps}
                  >
                    <MenuItem value="" disabled>
                      Select industry...
                    </MenuItem>
                    {INDUSTRIES.map((ind) => (
                      <MenuItem key={ind} value={ind}>
                        {ind}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Company Size */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Company Size *"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    error={!!fieldErrors.companySize}
                    helperText={fieldErrors.companySize}
                    {...menuProps}
                  >
                    {COMPANY_SIZES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* HQ Location */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Headquarters County *"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleChange}
                    error={!!fieldErrors.locationCity}
                    helperText={fieldErrors.locationCity || 'Where your company is based in Kenya'}
                    {...menuProps}
                  >
                    <MenuItem value="" disabled>
                      Select county...
                    </MenuItem>
                    {KENYA_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>
                        {county}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Company Bio */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Company Bio / Mission *"
                    name="companyBio"
                    value={formData.companyBio}
                    onChange={handleChange}
                    placeholder="Tell developers what makes your company a great place to work. Describe your culture, mission, tech stack, and what you're building..."
                    error={!!fieldErrors.companyBio}
                    helperText={
                      fieldErrors.companyBio ||
                      `${formData.companyBio.length} characters — be compelling!`
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* ─── STEP 1: Contact & Presence ─── */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <ContactMailIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Contact & Online Presence
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    How developers can find and reach you.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Contact Person */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Contact Person Name *"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    placeholder="e.g. Joy Wambui"
                    error={!!fieldErrors.contactPersonName}
                    helperText={fieldErrors.contactPersonName || 'HR / Hiring manager name'}
                  />
                </Grid>

                {/* Contact Email */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Recruitment Email *"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="hiring@yourcompany.com"
                    error={!!fieldErrors.contactEmail}
                    helperText={fieldErrors.contactEmail || 'Used for developer inquiries'}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                      OPTIONAL LINKS
                    </Typography>
                  </Divider>
                </Grid>

                {/* Website */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Company Website"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                  />
                </Grid>

                {/* LinkedIn */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="LinkedIn Company Page"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/..."
                  />
                </Grid>

                {/* Twitter */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Twitter / X Handle"
                    name="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={handleChange}
                    placeholder="@yourcompany"
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* ─── STEP 2: Review & Submit ─── */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <PreviewIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Review Your Profile
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This is how your company will appear after approval.
                  </Typography>
                </Box>
              </Box>

              {/* Preview Card */}
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, bgcolor: 'background.subtle' }}
              >
                <Stack spacing={2.5}>
                  {/* Header */}
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      {formData.industry && (
                        <Chip label={formData.industry} size="small" color="primary" variant="outlined" />
                      )}
                      {formData.companySize && (
                        <Chip label={companySizeLabel} size="small" variant="outlined" />
                      )}
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {formData.companyName || '—'}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Details grid */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>HQ</Typography>
                          <Typography variant="body2">{formData.locationCity ? `${formData.locationCity}, Kenya` : '—'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <PeopleIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Size</Typography>
                          <Typography variant="body2">{companySizeLabel || '—'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Company Bio</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {formData.companyBio || '—'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Contact</Typography>
                      <Typography variant="body2">{formData.contactPersonName || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">{formData.contactEmail || '—'}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Links</Typography>
                      {formData.websiteUrl && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LanguageIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>{formData.websiteUrl}</Typography>
                        </Stack>
                      )}
                      {formData.linkedinUrl && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LinkedInIcon fontSize="small" sx={{ color: '#0077b5' }} />
                          <Typography variant="body2" noWrap>LinkedIn</Typography>
                        </Stack>
                      )}
                      {formData.twitterHandle && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <XIcon fontSize="small" />
                          <Typography variant="body2" noWrap>{formData.twitterHandle}</Typography>
                        </Stack>
                      )}
                      {!formData.websiteUrl && !formData.linkedinUrl && !formData.twitterHandle && (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>None provided</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* What happens next */}
              <Alert severity="info" sx={{ borderRadius: 2 }} icon={<CheckCircleOutlineIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>What happens next?</Typography>
                <Typography variant="body2">
                  Your profile will be reviewed by our admin team. Approval usually takes less than 24 hours.
                  Once approved, you will be able to browse developers and post jobs.
                </Typography>
              </Alert>

              {/* Terms */}
              <FormControlLabel
                sx={{ alignItems: 'flex-start' }}
                control={
                  <Checkbox
                    size="small"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    color="primary"
                    sx={{ pt: 0.5 }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ fontWeight: 700 }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" style={{ fontWeight: 700 }}>
                      Privacy Policy
                    </Link>
                    .
                  </Typography>
                }
              />
            </Stack>
          )}

          {/* Navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 5,
              pt: 4,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ fontWeight: 700 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              type="submit"
              sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 700 }}
              disabled={
                isSubmitting ||
                (activeStep === steps.length - 1 && !agreedToTerms)
              }
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Submit for Approval'
              ) : (
                'Next →'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
