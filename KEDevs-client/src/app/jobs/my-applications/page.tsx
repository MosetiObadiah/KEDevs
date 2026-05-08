// src/app/jobs/my-applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { jobService } from '@/services/jobService';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const statusColors: Record<string, "warning" | "info" | "success" | "error" | "default"> = {
  'PENDING': 'warning',
  'REVIEWED': 'info',
  'ACCEPTED': 'success',
  'REJECTED': 'error',
};

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await jobService.getMyApplications();
        if (response.success) {
          setApplications(response.data?.content || []);
        } else {
          setError('Failed to fetch applications.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const formatStatus = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, mb: 4 }}>
        My <Box component="span" sx={{ color: 'primary.main' }}>Applications</Box>
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {applications.length > 0 ? (
        <Stack spacing={3}>
          {applications.map((app) => (
            <Card 
              key={app.id} 
              component={Link}
              href={`/jobs/${app.jobId}`}
              sx={{ 
                textDecoration: 'none',
                borderRadius: 3,
                transition: 'border-color 0.2s, transform 0.2s',
                '&:hover': { 
                  borderColor: 'primary.main', 
                  border: '1px solid',
                  transform: 'translateX(8px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {app.jobTitle}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {app.companyName} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 3 }}>
                    <Chip 
                      label={formatStatus(app.status)} 
                      color={statusColors[app.status] || 'default'}
                      sx={{ fontWeight: 700, borderRadius: 1.5, px: 1 }}
                    />
                    <ArrowForwardIosIcon fontSize="small" color="action" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't applied to any jobs yet.
          </Typography>
          <Button variant="contained" component={Link} href="/jobs" sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}>
            Browse Jobs
          </Button>
        </Box>
      )}
    </Container>
  );
}
