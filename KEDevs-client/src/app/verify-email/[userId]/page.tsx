// src/app/verify-email/[userId]/page.tsx
'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Box,
  Alert,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuthData } = useAuth();

  const handleVerify = async () => {
    if (!userId || code.length !== 6) return;

    setError(null);
    setLoading(true);
    try {
      const response = await authService.verifyEmail(userId as string, code);
      if (response.success) {
        const { accessToken, refreshToken, userId, email, fullName, role, emailVerified, requiresApproval } = response.data;

        const userData = {
          id: userId,
          email,
          fullName,
          role,
          isEmailVerified: true,
          isApproved: !requiresApproval,
          isVerified: false
        };

        setAuthData(userData, accessToken, refreshToken);

        if (role === 'DEVELOPER') router.push('/onboarding/developer');
        else if (role === 'EMPLOYER') router.push('/onboarding/employer');
        else if (role === 'ADMIN') router.push('/admin/dashboard');
        else router.push('/feed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <MarkEmailReadIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Verify Email</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          We've sent a 6-digit code to your email. Enter it below to activate your account.
        </Typography>

        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            slotProps={{
              htmlInput: {
                style: { textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }
              }
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?
            </Typography>
            <Button color="primary" sx={{ fontWeight: 600 }}>Resend Code</Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
