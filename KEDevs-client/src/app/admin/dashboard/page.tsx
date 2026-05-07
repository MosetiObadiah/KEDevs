// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Stack, Button, Card, CardContent, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { adminService } from '@/services/adminService';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getDashboard();
        if (response.success) {
          setData(response.data);
        }
      } catch (err: any) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: <PeopleIcon />, color: 'primary.main' },
    { label: 'Active Jobs', value: data?.totalActiveJobs || 0, icon: <WorkIcon />, color: '#2563eb' },
    { label: 'Verified Devs', value: data?.totalVerifiedDevelopers || 0, icon: <TrendingUpIcon />, color: '#ea580c' },
    { label: 'Employer Pro', value: data?.totalProEmployers || 0, icon: <PaymentsIcon />, color: '#7c3aed' },
  ];

  if (isLoading) {
    return (
      <Box>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.subtle', color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>{stat.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stat.value.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, height: 450, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Platform Activity</Typography>
            <Box sx={{ flexGrow: 1, bgcolor: 'background.subtle', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Analytics Charting Coming Soon</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Pending Actions</Typography>
              <Stack spacing={2}>
                <Button 
                  component={Link}
                  href="/admin/users"
                  variant="outlined"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    justifyContent: 'space-between', 
                    p: 2.5, 
                    borderRadius: 3, 
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'background.subtle', borderColor: 'primary.main' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem' }}>
                      {data?.pendingEmployers || 0}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>Pending Employers</Typography>
                  </Box>
                </Button>

                <Button 
                  component={Link}
                  href="/admin/flags"
                  variant="outlined"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    justifyContent: 'space-between', 
                    p: 2.5, 
                    borderRadius: 3, 
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'background.subtle', borderColor: 'primary.main' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem' }}>
                      {data?.flaggedJobs + data?.flaggedUsers || 0}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>Flagged Content</Typography>
                  </Box>
                </Button>
              </Stack>
            </Paper>

            <Card sx={{ bgcolor: 'background.inverse', color: 'white', p: 1 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Platform Health</Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.6 }}>All systems are operational. Backend connected successfully.</Typography>
                <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 800, py: 1.5 }}>View System Logs</Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

