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
  Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BusinessIcon from '@mui/icons-material/Business';
import InfoIcon from '@mui/icons-material/Info';
import DoneIcon from '@mui/icons-material/Done';
import { employerService } from '@/services/employerService';
import { KENYA_COUNTIES } from '@/lib/constants';

const steps = ['Company Details', 'Account Details', 'Finish'];

export default function EmployerOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Software Development',
    companySize: '11-50 employees',
    bio: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterHandle: '',
    locationCity: 'Nairobi',
    contactEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await employerService.createProfile({
          companyName: formData.companyName,
          companyBio: formData.bio,
          websiteUrl: formData.websiteUrl,
          linkedinUrl: formData.linkedinUrl,
          twitterHandle: formData.twitterHandle,
          industry: formData.industry,
          companySize: formData.companySize,
          locationCity: formData.locationCity,
          locationCountry: 'Kenya',
          contactEmail: formData.contactEmail
        });
        if (response.success) {
          completeOnboarding();
          router.push('/pending-approval');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create employer profile.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1 }}>
          Build Your <Box component="span" sx={{ color: 'primary.main' }}>Company Profile</Box>
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Join KEDevs to find and hire the best tech talent in Kenya.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} sx={{ minHeight: 350 }}>
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Company Information</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Company Name" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. TechFlow Solutions" 
                    required 
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    fullWidth 
                    select 
                    label="Industry" 
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <MenuItem value="Software Development">Software Development</MenuItem>
                    <MenuItem value="Fintech">Fintech</MenuItem>
                    <MenuItem value="E-commerce">E-commerce</MenuItem>
                    <MenuItem value="AI/ML">AI/ML</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    fullWidth 
                    select 
                    label="Company Size" 
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                  >
                    <MenuItem value="1-10 employees">1-10 employees</MenuItem>
                    <MenuItem value="11-50 employees">11-50 employees</MenuItem>
                    <MenuItem value="51-200 employees">51-200 employees</MenuItem>
                    <MenuItem value="200+ employees">200+ employees</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={4} 
                    label="Company Bio" 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell developers what makes your company a great place to work..." 
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Online Presence & Contact</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Website URL" 
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://..." 
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    fullWidth 
                    label="LinkedIn URL" 
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/..." 
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Twitter/X Handle" 
                    name="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={handleChange}
                    placeholder="@..." 
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    select
                    fullWidth 
                    label="County" 
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleChange}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            overflow: 'auto'
                          },
                        },
                      },
                    }}
                  >
                    {KENYA_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>
                        {county}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Direct Contact Email" 
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="hiring@company.com" 
                    helperText="Used for recruitment inquiries" 
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={4} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <Box sx={{ bgcolor: 'primary.light', p: 3, borderRadius: '50%', mb: 2 }}>
                <DoneIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Ready to Submit!</Typography>
              <Typography variant="body1" color="text.secondary">
                Your profile will be reviewed by our admin team for quality and authenticity. 
                Approval usually takes less than 24 hours.
              </Typography>
            </Stack>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ fontWeight: 700 }}>
              Back
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : activeStep === steps.length - 1 ? 'Complete & Submit' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
