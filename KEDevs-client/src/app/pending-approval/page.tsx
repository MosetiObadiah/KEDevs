// src/app/pending-approval/page.tsx
'use client';

import React from 'react';
import { Container, Paper, Typography, Box, Button, Stack } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LogoutIcon from '@mui/icons-material/Logout';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 15 }}>
      <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Box sx={{ bgcolor: 'rgba(255, 165, 0, 0.1)', p: 3, borderRadius: '50%', display: 'inline-block', mb: 3 }}>
          <HourglassEmptyIcon sx={{ fontSize: 60, color: 'warning.main' }} />
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Account Under <Box component="span" sx={{ color: 'warning.main' }}>Review</Box>
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {user?.name}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          Thank you for joining KEDevs! Our administrative team is currently reviewing your company profile for authenticity. 
          You will receive a notification and full access once approved.
        </Typography>
        
        <Stack spacing={2}>
          <Typography variant="body2" color="text.disabled">
            Usually takes less than 24 hours.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<LogoutIcon />} 
            onClick={logout}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
          >
            Logout for now
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
