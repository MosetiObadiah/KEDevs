// src/app/reset-password/page.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Box,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <LockResetIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Reset Password</Typography>
        
        {step === 1 ? (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a code to reset your password.
            </Typography>
            <TextField fullWidth label="Email Address" type="email" />
            <Button variant="contained" fullWidth size="large" onClick={() => setStep(2)} sx={{ py: 1.5 }}>
              Send Reset Code
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the code sent to your email and your new password.
            </Typography>
            <TextField fullWidth label="Reset Code" placeholder="000000" />
            <TextField fullWidth label="New Password" type="password" />
            <TextField fullWidth label="Confirm New Password" type="password" />
            <Button variant="contained" fullWidth size="large" sx={{ py: 1.5 }}>
              Reset Password
            </Button>
          </Stack>
        )}

        <Box sx={{ mt: 4 }}>
          <Link href="/login" style={{ color: '#2563eb', fontSize: '0.875rem' }}>
            Back to Login
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
