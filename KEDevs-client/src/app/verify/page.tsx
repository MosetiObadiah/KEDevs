// src/app/verify/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useAuth } from '@/context/AuthContext';

const steps = ['Profile Check', 'Payment', 'Documents', 'Waiting'];

export default function VerificationFlow() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'NONE' | 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED'>('NONE');

  const handleNext = () => {
    if (activeStep === 2) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setActiveStep(3);
        setStatus('REVIEW');
      }, 2000);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReapply = () => {
    setStatus('NONE');
    setActiveStep(0);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 6 }}>
          Profile <Box component="span" sx={{ color: 'primary.main' }}>Verification</Box>
        </Typography>

        {status === 'REJECTED' ? (
          <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
              <Typography variant="h6">Verification Rejected</Typography>
              Your documents did not meet our requirements. Please check your email for details.
            </Alert>
            <Button variant="contained" onClick={handleReapply} sx={{ borderRadius: 2, fontWeight: 700 }}>
              Reapply Now
            </Button>
          </Stack>
        ) : (
          <>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ minHeight: 300 }}>
              {activeStep === 0 && (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 1: Profile Completeness</Typography>
                  <Typography variant="body1">We check if your profile meets the minimum requirements for verification.</Typography>
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Your profile is 90% complete. You are eligible for verification!
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}><Typography variant="body2">✓ Basic Info (Bio, Role)</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2">✓ Skills (At least 5)</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2">✓ Experience (Detailed)</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2">✓ Featured Projects (At least 1)</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="body2">✓ Contact Info (LinkedIn, GitHub)</Typography></Grid>
                  </Grid>
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={3} sx={{ alignItems: 'center' }}>
                  <PhoneIphoneIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 2: M-Pesa Payment</Typography>
                  <Typography variant="body1" align="center">Please pay <strong>{user?.userType === 'DEVELOPER' ? 'KES 200' : 'KES 400'}</strong> via M-Pesa to initiate the verification process.</Typography>
                  <TextField 
                    fullWidth 
                    label="M-Pesa Phone Number" 
                    defaultValue="254700000000" 
                    variant="outlined" 
                    helperText="A STK push will be sent to this number"
                  />
                  <Button variant="contained" size="large" sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                    Send Payment Request
                  </Button>
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 3: Document Upload</Typography>
                  <Typography variant="body1">Please upload the following documents for identity verification.</Typography>
                  
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="subtitle1">Click or drag {user?.userType === 'DEVELOPER' ? 'National ID / Passport' : 'Certificate of Incorporation'}</Typography>
                    <Typography variant="caption" color="text.secondary">PDF, JPG or PNG (Max 5MB)</Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="subtitle1">Click or drag {user?.userType === 'DEVELOPER' ? 'Degree / Certifications' : 'KRA Pin / Tax Compliance'}</Typography>
                    <Typography variant="caption" color="text.secondary">PDF, JPG or PNG (Max 5MB)</Typography>
                  </Paper>
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: status === 'REVIEW' ? 'warning.main' : 'success.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {status === 'REVIEW' ? 'Under Review' : 'Verification Successful!'}
                  </Typography>
                  <Typography variant="body1">
                    {status === 'REVIEW' 
                      ? 'Your documents have been submitted successfully. Our team will review them and get back to you within 3-5 business days.'
                      : 'Congratulations! Your profile is now verified. You can now boost your visibility with Spotlight.'}
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: '#f5f5f5', width: '100%', borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Submission Date:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>May 7, 2026</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Current Status:</Typography>
                        <Chip 
                          label={status === 'REVIEW' ? 'Under Review' : 'Approved'} 
                          size="small" 
                          color={status === 'REVIEW' ? 'warning' : 'success'} 
                        />
                      </Box>
                    </Stack>
                  </Paper>
                  {status === 'APPROVED' && (
                    <Button variant="contained" component={Link} href="/profile/me" sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}>
                      Back to Profile
                    </Button>
                  )}
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0 || activeStep === 3}
                onClick={handleBack}
                sx={{ fontWeight: 700 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 3}
                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 
                 activeStep === 2 ? 'Submit Documents' : 
                 activeStep === 3 ? 'Done' : 'Continue'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
