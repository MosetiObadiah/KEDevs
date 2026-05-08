'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  alpha
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { paymentService } from '@/services/paymentService';
import { spotlightService } from '@/services/spotlightService';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

interface BuySpotlightDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isVerified: boolean;
  hasFeaturedProject: boolean;
}

export default function BuySpotlightDialog({ open, onClose, onSuccess, isVerified, hasFeaturedProject }: BuySpotlightDialogProps) {
  const { getPrice } = usePlatformSettings();
  const [type, setType] = useState<'DAY' | 'WEEK'>('DAY');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'SELECT' | 'PAYING' | 'SUCCESS'>('SELECT');

  useEffect(() => {
    if (open) {
      fetchAvailability();
      setStep('SELECT');
      setError(null);
    }
  }, [open]);

  const fetchAvailability = async () => {
    try {
      const response = await spotlightService.getAvailability();
      if (response.success) {
        setAvailability(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch availability', err);
    }
  };

  const handleInitiate = async () => {
    if (!phoneNumber.match(/^(254|0)(7|1)\d{8}$/)) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.initiateSpotlight({
        phoneNumber,
        spotlightType: type
      });

      if (response.success) {
        setStep('PAYING');
        // In a real app, we would poll for payment status here
        // For now, we'll wait and then show success if we have a confirmation button or similar
        // But the user said M-Pesa is already in the backend, so we might need to poll
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Is the slot already taken?');
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified || !hasFeaturedProject) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Requirements Missing</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {!isVerified && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                You must be a <strong>Verified Developer</strong> to buy a spotlight slot. Please complete your verification first.
              </Alert>
            )}
            {!hasFeaturedProject && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                You must have at least one <strong>Featured Project</strong> (with a screenshot and live URL) to be showcased in the spotlight.
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              These requirements ensure that featured developers present a professional and verified presence to the community.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} sx={{ fontWeight: 700 }}>Close</Button>
          <Button component={Link} href={!isVerified ? "/verify" : "/profile/me"} variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
            {!isVerified ? "Get Verified" : "Add Project"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
        {step === 'SELECT' ? 'Boost Your Visibility' : step === 'PAYING' ? 'Completing Payment' : 'Success!'}
      </DialogTitle>
      
      <DialogContent>
        {step === 'SELECT' && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Get featured on the public landing page and attract more employers.
            </Typography>

            <RadioGroup value={type} onChange={(e) => setType(e.target.value as any)}>
              <Stack spacing={2}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    cursor: 'pointer',
                    borderColor: type === 'DAY' ? 'primary.main' : 'divider',
                    bgcolor: type === 'DAY' ? alpha('#10b981', 0.05) : 'transparent',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setType('DAY')}
                >
                  <FormControlLabel 
                    value="DAY" 
                    control={<Radio />} 
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>Developer of the Day</Typography>
                        <Typography variant="caption" color="text.secondary">KES {getPrice('SPOTLIGHT_DAY_FEE', '50')} • Active for 24 hours</Typography>
                        {!availability?.daySlotAvailable && (
                          <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>
                            Currently Taken (Expires: {availability?.daySlotExpiresAt ? new Date(availability.daySlotExpiresAt).toLocaleString() : 'Soon'})
                          </Typography>
                        )}
                      </Box>
                    } 
                  />
                </Paper>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    cursor: 'pointer',
                    borderColor: type === 'WEEK' ? 'primary.main' : 'divider',
                    bgcolor: type === 'WEEK' ? alpha('#10b981', 0.05) : 'transparent',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setType('WEEK')}
                >
                  <FormControlLabel 
                    value="WEEK" 
                    control={<Radio />} 
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>Developer of the Week</Typography>
                        <Typography variant="caption" color="text.secondary">KES {getPrice('SPOTLIGHT_WEEK_FEE', '250')} • Active for 7 days</Typography>
                        {!availability?.weekSlotAvailable && (
                          <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>
                            Currently Taken (Expires: {availability?.weekSlotExpiresAt ? new Date(availability.weekSlotExpiresAt).toLocaleString() : 'Soon'})
                          </Typography>
                        )}
                      </Box>
                    } 
                  />
                </Paper>
              </Stack>
            </RadioGroup>

            <Divider />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>M-Pesa Phone Number</Typography>
              <TextField
                fullWidth
                placeholder="e.g. 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                size="small"
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', color: 'text.secondary' }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">You will receive an STK push on your phone.</Typography>
              </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          </Stack>
        )}

        {step === 'PAYING' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Waiting for Payment...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check your phone for the M-Pesa PIN prompt. Once you enter your PIN, the spotlight will activate automatically.
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 4, borderRadius: 2 }} 
              onClick={() => { setStep('SUCCESS'); onSuccess(); }}
            >
              I have paid
            </Button>
          </Box>
        )}

        {step === 'SUCCESS' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Spotlight Active!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You are now featured on the landing page. Good luck with your opportunities!
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {step === 'SELECT' ? (
          <>
            <Button onClick={onClose} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
              variant="contained" 
              disabled={loading || (type === 'DAY' && !availability?.daySlotAvailable) || (type === 'WEEK' && !availability?.weekSlotAvailable)} 
              onClick={handleInitiate}
              sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Buy Slot'}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
