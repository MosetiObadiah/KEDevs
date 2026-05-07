// src/app/login/page.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { PillBadge } from '@/components/shared/PillBadge';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token);
      } catch (err: any) {
        setError(err.message || 'Google Login failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login failed.')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 10 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PillBadge variant="mint">WELCOME BACK</PillBadge>
        </Box>
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>Login</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
            Access your developer dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              
              <Button 
                variant="outlined" 
                color="secondary"
                fullWidth 
                startIcon={<GoogleIcon />} 
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {loading ? 'Processing...' : 'Continue with Google'}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>OR EMAIL</Typography>
              </Divider>

              <TextField 
                fullWidth 
                label="Email Address" 
                type="email" 
                placeholder="jane@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField 
                fullWidth 
                label="Password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Box sx={{ textAlign: 'right' }}>
                <Link href="#" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d9459', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                type="submit"
                disabled={loading}
                sx={{ py: 2, borderRadius: 3, fontWeight: 800 }}
              >
                {loading ? 'Logging in...' : 'Log In to KEDevs'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                Don't have an account? <Link href="/register" style={{ color: '#1d9459', fontWeight: 800, textDecoration: 'none' }}>Join Community</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

