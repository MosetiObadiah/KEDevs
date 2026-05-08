// src/app/payments/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';;
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '@/context/AuthContext';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { paymentService } from '@/services/paymentService';
import { spotlightService } from '@/services/spotlightService';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { getPrice } = usePlatformSettings();
  const isDev = user?.role === 'DEVELOPER';

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [spotlightStatus, setSpotlightStatus] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [historyRes, subRes] = await Promise.all([
          paymentService.getHistory(),
          paymentService.getSubscriptions(),
        ]);
        if (historyRes.success) setPaymentHistory(historyRes.data?.content || historyRes.data || []);
        if (subRes.success) setSubscriptions(subRes.data);

        if (isDev) {
          const slRes = await spotlightService.getMyStatus();
          if (slRes.success) setSpotlightStatus(slRes.data);
        }
      } catch (err) {
        console.error('Failed to load payment data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isDev]);

  const handleConfirmSpotlight = async () => {
    setConfirming(true);
    try {
      const res = await paymentService.confirmSpotlight();
      if (res.success) {
        toast.success('Spotlight activated! You are now featured.');
        const slRes = await spotlightService.getMyStatus();
        if (slRes.success) setSpotlightStatus(slRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'No pending spotlight payment found.');
    } finally {
      setConfirming(false);
    }
  };

  const formatPaymentType = (type: string) => {
    return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || type;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeLeft = (endDate: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    return `${h}h ${m}m left`;
  };

  const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'FAILED') return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        Payments &{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>Billing</Box>
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Track your payment history and manage your active services.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Left: Status cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Verification Status */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VerifiedIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Verification</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip
                      label={user?.isVerified ? 'Verified' : 'Unverified'}
                      size="small"
                      color={user?.isVerified ? 'success' : 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {!user?.isVerified && (
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      component={Link}
                      href="/verify"
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Get Verified
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Spotlight Status (Developers only) */}
              {isDev && (
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <SpeedIcon color="warning" />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Spotlight</Typography>
                    </Box>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={spotlightStatus?.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={spotlightStatus?.active ? 'warning' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    {spotlightStatus?.active && spotlightStatus?.endDate && (
                      <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.light' }}>
                        <Typography variant="caption" color="text.secondary">Time Remaining</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'warning.dark' }}>
                          {formatTimeLeft(spotlightStatus.endDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires {formatDate(spotlightStatus.endDate)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 2 }} />
                    {!spotlightStatus?.active && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          component={Link}
                          href="/profile/me?buySpotlight=true"
                          sx={{ borderRadius: 2, fontWeight: 700, mb: 1 }}
                        >
                          Buy Spotlight Slot
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={handleConfirmSpotlight}
                          disabled={confirming}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {confirming ? <CircularProgress size={18} /> : 'Confirm Pending Payment'}
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                          Already paid? Click above to activate your slot.
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Membership */}
              {subscriptions && (
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Membership</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Annual:</Typography>
                      <Chip
                        label={subscriptions.annualMembershipActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={subscriptions.annualMembershipActive ? 'success' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    {subscriptions.membershipExpiresAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Expires {formatDate(subscriptions.membershipExpiresAt)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Right: History */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <HistoryIcon color="action" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Payment History</Typography>
              </Box>

              {paymentHistory.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                  <Typography color="text.secondary">No payments yet.</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'background.subtle' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>SERVICE</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>RECEIPT</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentHistory.map((row: any) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(row.paidAt || row.createdAt)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatPaymentType(row.type)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                            KES {Number(row.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'background.subtle', px: 1, py: 0.5, borderRadius: 1 }}>
                              {row.mpesaReceiptNo || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={
                                row.status === 'COMPLETED' ? <CheckCircleOutlineIcon fontSize="small" /> :
                                row.status === 'PENDING' ? <AccessTimeIcon fontSize="small" /> :
                                <ErrorOutlineIcon fontSize="small" />
                              }
                              label={row.status}
                              size="small"
                              color={statusColor(row.status) as any}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
