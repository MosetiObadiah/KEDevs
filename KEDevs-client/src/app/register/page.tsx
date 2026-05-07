// src/app/register/page.tsx
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
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { PillBadge } from '@/components/shared/PillBadge';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [role, setRole] = useState<'DEVELOPER' | 'EMPLOYER'>('DEVELOPER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { googleLogin } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token, role);
      } catch (err: any) {
        setError(err.message || 'Google Sign Up failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Sign Up failed.')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await authService.register({ fullName, email, password, role });
      if (response.success) {
        router.push(`/verify-email/${response.data.userId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 10 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PillBadge variant="mint">JOIN THE COMMUNITY</PillBadge>
        </Box>
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>Sign Up</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
            Start your journey with KEDevs
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, textAlign: 'center' }}>I AM JOINING AS A:</Typography>
                <ToggleButtonGroup
                  color="primary"
                  value={role}
                  exclusive
                  onChange={(e, newRole) => newRole && setRole(newRole)}
                  fullWidth
                  sx={{ borderRadius: 3 }}
                >
                  <ToggleButton value="DEVELOPER" sx={{ fontWeight: 700, py: 1.5 }}>Developer</ToggleButton>
                  <ToggleButton value="EMPLOYER" sx={{ fontWeight: 700, py: 1.5 }}>Employer</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField 
                fullWidth 
                label="Full Name" 
                placeholder="Jane Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
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

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                type="submit"
                disabled={loading}
                sx={{ py: 2, borderRadius: 3, fontWeight: 800 }}
              >
                {loading ? 'Creating Account...' : 'Create My Account'}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>OR CONTINUE WITH</Typography>
              </Divider>

              <Button 
                variant="outlined" 
                color="secondary"
                fullWidth 
                startIcon={<GoogleIcon />} 
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {loading ? 'Processing...' : 'Sign up with Google'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                Already have an account? <Link href="/login" style={{ color: '#1d9459', fontWeight: 800, textDecoration: 'none' }}>Log In</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

