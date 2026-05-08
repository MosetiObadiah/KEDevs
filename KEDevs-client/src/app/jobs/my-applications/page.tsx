// src/app/jobs/my-applications/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { myApplications } from '@/data/mockData';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const statusColors: Record<string, "warning" | "info" | "success" | "error" | "default"> = {
  'Pending': 'warning',
  'Reviewed': 'info',
  'Accepted': 'success',
  'Rejected': 'error',
};

export default function MyApplications() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, mb: 4 }}>
        My <Box component="span" sx={{ color: 'primary.main' }}>Applications</Box>
      </Typography>

      {myApplications.length > 0 ? (
        <Stack spacing={3}>
          {myApplications.map((app) => (
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
                      {app.companyName} • Applied on {app.appliedDate}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 3 }}>
                    <Chip 
                      label={app.status} 
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
          <Button variant="contained" component={Link} href="/developers" sx={{ mt: 2 }}>
            Browse Developers
          </Button>
        </Box>
      )}
    </Container>
  );
}
