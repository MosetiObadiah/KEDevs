// src/app/verify/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { useAuth } from '@/context/AuthContext';
import { verificationService, VerificationStatus, VerificationStatusResponse } from '@/services/verificationService';
import { toast } from 'react-hot-toast';

const steps = ['Profile Check', 'Payment', 'Documents', 'Waiting'];

export default function VerificationFlow() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatusResponse | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('254');

  const [idFile, setIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);

  const idRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    try {
      const response = await verificationService.getStatus();
      if (response.success) {
        setVerifyStatus(response.data);
        // Map status to step
        const status = response.data.status;
        if (status === VerificationStatus.NONE) setActiveStep(0);
        else if (status === VerificationStatus.PENDING_PAYMENT) setActiveStep(1);
        else if (status === VerificationStatus.PENDING_DOCS) setActiveStep(2);
        else if (status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED || status === VerificationStatus.REJECTED) setActiveStep(3);
      }
    } catch (err) {
      console.error('Failed to fetch verification status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInitiate = async () => {
    if (!phoneNumber || phoneNumber.length < 12) {
      toast.error('Please enter a valid M-Pesa phone number (254...)');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await verificationService.initiate(phoneNumber);
      if (response.success) {
        toast.success(response.data.customerMessage || 'Payment request sent!');
        // Keep checking for status update (polling or websocket will handle it, but for now we wait for manual refresh or notify)
        fetchStatus();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDocuments = async () => {
    if (!idFile || !passportFile) {
      toast.error('ID/Passport and Passport Photo are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('idDoc', idFile);
      formData.append('passportPhoto', passportFile);
      certFiles.forEach(file => formData.append('certificates', file));

      const response = await verificationService.submitDocuments(formData);
      if (response.success) {
        toast.success('Documents submitted successfully!');
        fetchStatus();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!verifyStatus?.isEligible) {
        toast.error('Your profile is not complete enough. Please update your profile first.');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      handleInitiate();
    } else if (activeStep === 2) {
      handleSubmitDocuments();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 6 }}>
          Profile <Box component="span" sx={{ color: 'primary.main' }}>Verification</Box>
        </Typography>

        {verifyStatus?.status === VerificationStatus.REJECTED ? (
          <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Verification Rejected</Typography>
              Reason: {verifyStatus.rejectionReason || 'Documents did not meet our requirements.'}
            </Alert>
            <Typography variant="body1">
              You can re-initiate the verification process after addressing the issues.
              Note: Re-application requires a new review fee of KES 200.
            </Typography>
            <Button variant="contained" onClick={() => setActiveStep(0)} sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>
              Start Over
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

                  {verifyStatus?.isEligible ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      Your profile meets all requirements. You are eligible for verification!
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      Please complete your profile to continue.
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    {verifyStatus && Object.entries(verifyStatus.profileCompleteness).map(([req, met]) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={req}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ color: met ? 'success.main' : 'divider', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: met ? 'text.primary' : 'text.secondary' }}>
                            {req}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {!verifyStatus?.isEligible && (
                    <Button component={Link} href="/profile/me" variant="outlined" sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}>
                      Complete Profile in Dashboard
                    </Button>
                  )}
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <PhoneIphoneIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 2: M-Pesa Payment</Typography>
                  <Typography variant="body1">
                    Please pay <strong>KES {user?.role === 'DEVELOPER' ? '250' : '400'}</strong> via M-Pesa to initiate the manual review process.
                  </Typography>
                  <TextField
                    fullWidth
                    label="M-Pesa Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="2547XXXXXXXX"
                    variant="outlined"
                    sx={{ maxWidth: 400 }}
                    helperText="A prompt will be sent to your phone to enter your PIN."
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleInitiate}
                    disabled={isSubmitting}
                    sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Send Payment Request'}
                  </Button>
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 3: Document Upload</Typography>
                  <Typography variant="body1">Please upload the following documents for identity verification.</Typography>

                  <input type="file" hidden ref={idRef} onChange={(e) => setIdFile(e.target.files?.[0] || null)} accept="image/*,application/pdf" />
                  <Paper
                    variant="outlined"
                    onClick={() => idRef.current?.click()}
                    sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', bgcolor: idFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: idFile ? 'success.main' : 'text.secondary', mb: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {idFile ? idFile.name : `Click to upload National ID / Passport`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">PDF, JPG or PNG (Max 5MB)</Typography>
                  </Paper>

                  <input type="file" hidden ref={passportRef} onChange={(e) => setPassportFile(e.target.files?.[0] || null)} accept="image/*" />
                  <Paper
                    variant="outlined"
                    onClick={() => passportRef.current?.click()}
                    sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', bgcolor: passportFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: passportFile ? 'success.main' : 'text.secondary', mb: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {passportFile ? passportFile.name : `Click to upload Passport Photo`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">JPG or PNG (Max 5MB)</Typography>
                  </Paper>

                  <input type="file" hidden ref={certRef} multiple onChange={(e) => setCertFiles(Array.from(e.target.files || []))} accept="image/*,application/pdf" />
                  <Paper
                    variant="outlined"
                    onClick={() => certRef.current?.click()}
                    sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', bgcolor: certFiles.length > 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: certFiles.length > 0 ? 'success.main' : 'text.secondary', mb: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {certFiles.length > 0 ? `${certFiles.length} certificates selected` : `Click to upload Certificates (Optional)`}
                    </Typography>
                  </Paper>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmitDocuments}
                    disabled={isSubmitting || !idFile || !passportFile}
                    sx={{ py: 2, borderRadius: 2, fontWeight: 800, mt: 2 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit for Review'}
                  </Button>
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: verifyStatus?.status === VerificationStatus.APPROVED ? 'success.main' : 'warning.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {verifyStatus?.status === VerificationStatus.APPROVED ? 'Verification Successful!' : 'Request Under Review'}
                  </Typography>
                  <Typography variant="body1">
                    {verifyStatus?.status === VerificationStatus.APPROVED
                      ? 'Congratulations! Your profile is now verified. You can now boost your visibility with Spotlight.'
                      : 'Your documents have been submitted successfully. Our team will review them and get back to you within 2-5 business days.'}
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: 'background.subtle', width: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Submitted on:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {verifyStatus?.createdAt ? new Date(verifyStatus.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Current Status:</Typography>
                        <Chip
                          label={verifyStatus?.status === VerificationStatus.APPROVED ? 'Approved' : 'Under Review'}
                          size="small"
                          color={verifyStatus?.status === VerificationStatus.APPROVED ? 'success' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                  <Button variant="contained" component={Link} href="/profile/me" sx={{ mt: 2, borderRadius: 2, fontWeight: 700, px: 4 }}>
                    Back to Dashboard
                  </Button>
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
                disabled={activeStep === 3 || (activeStep === 0 && !verifyStatus?.isEligible)}
                sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
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
