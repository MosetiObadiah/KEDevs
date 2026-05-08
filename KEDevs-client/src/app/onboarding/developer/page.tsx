// src/app/onboarding/developer/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Autocomplete,
  MenuItem,
  Stack,
  Fade,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { KENYA_COUNTIES } from '@/lib/constants';

const steps = ['Basic Info', 'Skills & Status', 'Experience'];

const skillsOptions = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Java', 'Spring Boot',
  'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'Tailwind CSS', 'MUI', 'Figma',
];

const experienceLevels = [
  { value: 'ZERO_TO_ONE', label: '0 - 1 Year' },
  { value: 'ONE_TO_THREE', label: '1 - 3 Years' },
  { value: 'THREE_TO_FIVE', label: '3 - 5 Years' },
  { value: 'FIVE_TO_TEN', label: '5 - 10 Years' },
  { value: 'TEN_PLUS', label: '10+ Years' },
];

export default function DeveloperOnboarding() {
  const router = useRouter();
  const { isLoggedIn, isOnboarded, completeOnboarding, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    role: '',
    city: 'Nairobi',
    bio: '',
    skills: [] as string[],
    availability: 'Available',
    yearsOfExperience: 'ZERO_TO_ONE',
    summary: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (isOnboarded) {
      router.push('/developers');
    }
  }, [isLoggedIn, isOnboarded, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          currentLastRole: formData.role,
          locationCity: formData.city.split(',')[0].trim(),
          locationCountry: formData.city.split(',')[1]?.trim() || 'Kenya',
          availabilityStatus: formData.availability === 'Available' ? 'AVAILABLE' : 'OPEN_TO_OFFERS',
          yearsOfExperience: formData.yearsOfExperience,
          visibility: 'PUBLIC',
          skills: formData.skills,
          portfolioUrl: '',
          githubUrl: '',
          linkedinUrl: ''
        };
        const response = await developerService.createProfile(payload);
        if (response.success) {
          completeOnboarding();
          router.push('/developers');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create profile. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };


  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isLoggedIn || isOnboarded) return null;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Complete Your <Box component="span" sx={{ color: 'primary.main' }}>Profile</Box>
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Tell us more about yourself to get started on KEDevs.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Stepper activeStep={activeStep} sx={{ mb: 8 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} sx={{ minHeight: 400 }}>
          {activeStep === 0 && (
            <Fade in={activeStep === 0}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Current Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="County / Location"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    slotProps={{
                      select: {
                        MenuProps: {
                          slotProps: {
                            paper: {
                              sx: {
                                maxHeight: 300,
                                overflow: 'auto'
                              }
                            }
                          }
                        }
                      }
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
                    multiline
                    rows={4}
                    label="Short Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="A brief description of your professional background..."
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in={activeStep === 1}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    multiple
                    options={skillsOptions}
                    value={formData.skills}
                    onChange={(_, newValue) => setFormData({ ...formData, skills: newValue })}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Skills" placeholder="Add skills" />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Work Availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    slotProps={{
                      select: {
                        MenuProps: {
                          slotProps: {
                            paper: {
                              sx: {
                                maxHeight: 300,
                                overflow: 'auto'
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Open to Offers">Open to Offers</MenuItem>
                    <MenuItem value="Busy">Busy</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Fade>
          )}

          {activeStep === 2 && (
            <Fade in={activeStep === 2}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Years of Experience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    slotProps={{
                      select: {
                        MenuProps: {
                          slotProps: {
                            paper: {
                              sx: {
                                maxHeight: 300,
                                overflow: 'auto'
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    {experienceLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Professional Summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Describe your career highlights and expertise..."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    sx={{ alignItems: 'flex-start', mt: 1 }}
                    control={
                      <Checkbox 
                        size="small"
                        checked={agreedToTerms} 
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        color="primary"
                        required
                        sx={{ pt: 0.5 }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
                        I agree to the <Link href="/terms" style={{ color: 'inherit', fontWeight: 700 }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'inherit', fontWeight: 700 }}>Privacy Policy</Link>.
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
              disabled={loading || (activeStep === steps.length - 1 && !agreedToTerms)}
            >
              {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Finish Profile' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
