'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  Button,
  alpha
} from '@mui/material';
import Link from 'next/link';
import { developerService } from '@/services/developerService';
import SpotlightSection from '@/components/home/SpotlightSection';
import { PillBadge } from '@/components/shared/PillBadge';
import SpeedIcon from '@mui/icons-material/Speed';

export default function SpotlightPage() {
  const [dayDev, setDayDev] = useState<any>(null);
  const [weekDev, setWeekDev] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlights = async () => {
      try {
        const response = await developerService.getCurrentSpotlight();
        if (response.success) {
          setDayDev(response.data.daySlot);
          setWeekDev(response.data.weekSlot);
        }
      } catch (err) {
        console.error('Failed to fetch spotlights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlights();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.subtle', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <PillBadge variant="sage">TALENT DISCOVERY</PillBadge>
          <Typography variant="h1" sx={{ mt: 2, fontWeight: 900, fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Developer <Box component="span" sx={{ color: 'primary.main' }}>Spotlight</Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 700, mx: 'auto', fontSize: '1.2rem' }}>
            Meet the most exceptional developers in our community, featured for their skills and outstanding projects.
          </Typography>
        </Box>

        <SpotlightSection dayDev={dayDev} weekDev={weekDev} loading={false} />

        {(!dayDev && !weekDev) && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              No developers currently in the spotlight.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Are you a developer? Boost your profile and be the first to appear here!
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              href="/profile/me"
              sx={{ mt: 4, borderRadius: 3, fontWeight: 800, px: 6, py: 1.5 }}
            >
              Get Spotlight
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 12, p: 6, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>How to get Featured?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            The Spotlight feature allows you to stand out to employers and the wider community. 
            Featured developers get 10x more profile views and higher engagement.
          </Typography>
          
          <Grid container spacing={4} sx={{ textAlign: 'left' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <PaperItem 
                number="01" 
                title="Get Verified" 
                desc="Complete your profile and undergo our verification process to ensure quality and trust." 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <PaperItem 
                number="02" 
                title="Catalog Projects" 
                desc="Add your best work with a live URL and a high-quality screenshot to your portfolio." 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <PaperItem 
                number="03" 
                title="Purchase Slot" 
                desc="Choose between 'Dev of the Day' or 'Dev of the Week' and complete payment via M-Pesa." 
              />
            </Grid>
          </Grid>

          <Button 
            variant="outlined" 
            component={Link} 
            href="/profile/me"
            sx={{ mt: 6, borderRadius: 3, fontWeight: 800, px: 6, py: 1.5 }}
          >
            Go to My Profile
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function PaperItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <Box>
      <Typography variant="h2" sx={{ fontWeight: 900, color: alpha('#10b981', 0.1), mb: -2 }}>{number}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, position: 'relative' }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{desc}</Typography>
    </Box>
  );
}
