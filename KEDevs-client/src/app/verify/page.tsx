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
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { toast } from 'react-hot-toast';

const steps = ['Profile Check', 'Payment', 'Documents', 'Waiting'];

export default function VerificationFlow() {
  const { user } = useAuth();
  const { getPrice, loading: settingsLoading } = usePlatformSettings();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatusResponse | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('254');

  const [idFile, setIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

  const validateFile = (file: File | null) => {
    if (!file) return false;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.name}. Please upload PNG, JPEG, WEBP or PDF.`);
      return false;
    }
    return true;
  };

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

  // Polling for status when on payment step or documents step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeStep === 1 || activeStep === 2) {
      interval = setInterval(() => {
        fetchStatus();
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeStep]);

  // Handle automatic step transition when status changes
  useEffect(() => {
    if (verifyStatus) {
      const status = verifyStatus.status;
      if (status === VerificationStatus.NONE && activeStep !== 0) setActiveStep(0);
      else if (status === VerificationStatus.PENDING_PAYMENT && activeStep === 0) setActiveStep(1);
      else if (status === VerificationStatus.PENDING_DOCS && activeStep === 1) {
        toast.success('Payment confirmed! Please upload your documents.');
        setActiveStep(2);
      }
      else if ((status === VerificationStatus.UNDER_REVIEW || status === VerificationStatus.APPROVED || status === VerificationStatus.REJECTED) && activeStep < 3) setActiveStep(3);
    }
  }, [verifyStatus?.status]);

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
    if (activeStep === 2) {
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
              Note: Re-application requires a new review fee of KES {user?.role === 'DEVELOPER' ? getPrice('VERIFIED_BADGE_DEVELOPER', '250') : getPrice('VERIFIED_BADGE_EMPLOYER', '500')}.
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
                    Please pay <strong>KES {user?.role === 'DEVELOPER' ? getPrice('VERIFIED_BADGE_DEVELOPER', '250') : getPrice('VERIFIED_BADGE_EMPLOYER', '500')}</strong> via M-Pesa to initiate the manual review process.
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
                    disabled={isSubmitting || 
                              verifyStatus?.status === VerificationStatus.PENDING_DOCS || 
                              verifyStatus?.status === VerificationStatus.UNDER_REVIEW || 
                              verifyStatus?.status === VerificationStatus.APPROVED}
                    sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 
                     verifyStatus?.status === VerificationStatus.PENDING_DOCS ? 'Payment Confirmed' : 
                     (verifyStatus?.status === VerificationStatus.UNDER_REVIEW || verifyStatus?.status === VerificationStatus.APPROVED) ? 'Already Pending' :
                     'Send Payment Request'}
                  </Button>
                  
                  {verifyStatus?.status === VerificationStatus.PENDING_DOCS && (
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 700, mt: 1 }}>
                      We've received your payment. Click "Next" to upload documents.
                    </Typography>
                  )}
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Step 3: Document Upload</Typography>
                  <Typography variant="body1">Please upload the following documents for identity verification.</Typography>

                  <input
                    type="file"
                    hidden
                    ref={idRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (validateFile(file)) setIdFile(file);
                    }}
                    accept="image/*,application/pdf"
                  />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      cursor: 'pointer',
                      bgcolor: idFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      borderColor: idFile ? 'success.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => idRef.current?.click()}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: idFile ? 'success.main' : 'text.secondary', mb: 1 }} />
                      <Typography sx={{ fontWeight: 600 }}>
                        {idFile ? idFile.name : 'Upload National ID / Passport Copy'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">PNG, JPEG, WEBP or PDF (Max 5MB)</Typography>
                    </Box>
                  </Paper>

                  <input
                    type="file"
                    hidden
                    ref={passportRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (validateFile(file)) {
                        if (file?.type === 'application/pdf') {
                          toast.error('Passport photo must be an image (PNG, JPEG, or WEBP)');
                          return;
                        }
                        setPassportFile(file);
                      }
                    }}
                    accept="image/*"
                  />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      cursor: 'pointer',
                      bgcolor: passportFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      borderColor: passportFile ? 'success.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => passportRef.current?.click()}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: passportFile ? 'success.main' : 'text.secondary', mb: 1 }} />
                      <Typography sx={{ fontWeight: 600 }}>
                        {passportFile ? passportFile.name : 'Upload Passport Photo'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">PNG, JPEG or WEBP (Images only)</Typography>
                    </Box>
                  </Paper>

                  <input
                    type="file"
                    hidden
                    multiple
                    ref={certRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const validFiles = files.filter(validateFile);
                      setCertFiles(prev => [...prev, ...validFiles]);
                    }}
                    accept="image/*,application/pdf"
                  />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      cursor: 'pointer',
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => certRef.current?.click()}
                  >
                    <Typography sx={{ fontWeight: 600, textAlign: 'center' }}>
                      {certFiles.length > 0 ? `${certFiles.length} certificates selected` : `Click to upload Certificates (Optional)`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                      PNG, JPEG, WEBP or PDF
                    </Typography>
                  </Paper>
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
                sx={{ borderRadius: 2, fontWeight: 700 }}
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
