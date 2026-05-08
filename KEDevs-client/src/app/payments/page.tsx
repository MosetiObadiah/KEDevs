// src/app/payments/page.tsx
'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const paymentHistory = [
  { id: 'pay1', date: '2024-05-01', amount: 'KES 200', service: 'Profile Verification', status: 'Success' },
  { id: 'pay2', date: '2024-04-15', amount: 'KES 100', service: 'Dev of the Day', status: 'Success' },
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const isDev = user?.role === 'DEVELOPER';
  const isEmp = user?.role === 'EMPLOYER';

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        Payments & <Box component="span" sx={{ color: 'primary.main' }}>Status</Box>
      </Typography>

      <Grid container spacing={4}>
        {/* Status Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <VerifiedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Verification</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status: <Chip label={user?.isVerified ? 'Verified' : 'Unverified'} size="small" color={user?.isVerified ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ display: 'block' }}>{isDev ? 'Lifetime verification for your profile.' : 'Authenticity verification for your company.'}</Typography>
              </CardContent>
            </Card>

            {isDev ? (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SpeedIcon color="warning" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Spotlight</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Status: <Chip label={user?.spotlightStatus?.isActive ? 'Active' : 'Inactive'} size="small" color={user?.spotlightStatus?.isActive ? 'warning' : 'default'} sx={{ fontWeight: 700 }} />
                  </Typography>
                  {user?.spotlightStatus?.isActive && (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>03:12:45</Typography>
                      <Typography variant="caption" color="text.secondary">Remaining time in spotlight</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SpeedIcon color="secondary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Hiring Assist</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Status: <Chip label="Inactive" size="small" sx={{ fontWeight: 700 }} />
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" sx={{ display: 'block' }}>Get advanced filters and direct outreach for 24 hours.</Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Buy Actions Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Available Services</Typography>
            <Grid container spacing={3}>
              {isDev ? (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>Dev of the Day</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>KES 100</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>24-hour spotlight boost</Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>Buy Now</Button>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
                      <Typography variant="h6" gutterBottom>Dev of the Week</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>KES 400</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>7-day spotlight boost</Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>Buy Now</Button>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>Get Verified</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>KES 200</Typography>
                      <Typography variant="body1" align="center">Please pay <strong>{user?.role === 'DEVELOPER' ? 'KES 200' : 'KES 400'}</strong> via M-Pesa to initiate the verification process.</Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }} component={Link} href="/verify">Get Started</Button>
                    </Paper>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
                      <Typography variant="h6" gutterBottom>Hiring Assist</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>KES 500</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>24-hour full tool access</Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }} component={Link} href="/hiring-assist">Activate Now</Button>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>Company Verification</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>KES 400</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Lifetime company badge</Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }} component={Link} href="/verify">Get Verified</Button>
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HistoryIcon color="action" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Payment History</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#fcfcfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>SERVICE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.service}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>
                        <Chip label={row.status} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
