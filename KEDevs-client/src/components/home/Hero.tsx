// src/components/home/Hero.tsx
'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PillBadge } from '@/components/shared/PillBadge';
import Link from 'next/link';
import { Card, Avatar, Chip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { JobSummary, DeveloperSummary } from '@/lib/types';

interface HeroProps {
  randomJob?: JobSummary | null;
  randomDev?: DeveloperSummary | null;
}

export const Hero = ({ randomJob, randomDev }: HeroProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        py: { xs: 10, lg: 16 },
      }}
    >
      {/* Background blobs */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '& > div': {
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.1,
          },
        }}
      >
        <Box sx={{ top: -160, right: -160, width: 600, height: 600, bgcolor: 'primary.main' }} />
        <Box sx={{ bottom: -80, left: -80, width: 400, height: 400, bgcolor: 'secondary.main' }} />
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={8} sx={{ alignItems: 'center', position: 'relative' }}>
          {/* Left Content */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <PillBadge variant="mint">🇰🇪 Kenya's Developer Community</PillBadge>
            <Typography variant="h1" component="h1" sx={{ mt: 3, mb: 3 }}>
              Find Kenyan tech{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>talent</Box>{' '}
              and{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>opportunity</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mb: 5 }}>
              Browse jobs from top companies, showcase your skills to employers, and connect with
              Kenya's best developers. No account needed to explore.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                component={Link} 
                href="/jobs"
              >
                Browse Jobs →
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                size="large" 
                component={Link} 
                href="/register"
              >
                Join as Developer
              </Button>
            </Stack>
            
            {/* Trust stats */}
            <Box sx={{ display: 'flex', gap: 6, mt: 8, pt: 4, borderTop: 1, borderColor: 'divider' }}>
              {[
                { n: '2.5k+', label: 'Developers' },
                { n: '150+', label: 'Companies' },
                { n: '800+', label: 'Jobs Posted' },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography variant="h4">{s.n}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right Floating Visuals */}
          <Grid size={{ xs: 12, lg: 6 }} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', height: 550 }}>
            {/* Developer Card */}
            {randomDev && (
              <Card sx={{ 
                position: 'absolute', top: 20, right: 40, width: 320, p: 3, zIndex: 3,
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: 'none'
              }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                    {randomDev.firstName.charAt(0)}{randomDev.lastName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{randomDev.firstName} {randomDev.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{randomDev.currentLastRole}</Typography>
                  </Box>
                  {randomDev.isVerified && <VerifiedIcon color="primary" sx={{ ml: 'auto' }} />}
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {randomDev.skills.slice(0, 3).map(s => <Chip key={s} label={s} size="small" />)}
                </Box>
              </Card>
            )}

            {/* Job Card */}
            {randomJob && (
              <Card sx={{ 
                position: 'absolute', bottom: 60, left: 0, width: 340, p: 3, zIndex: 2,
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: 'none'
              }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>NEW OPPORTUNITY</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>{randomJob.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{randomJob.companyName} • {randomJob.locationCity}</Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>Open Position</Typography>
                  <Button component={Link} href={`/jobs/${randomJob.id}`} size="small" variant="contained" sx={{ borderRadius: 1.5 }}>View</Button>
                </Stack>
              </Card>
            )}

            {/* Accent Circle */}
            <Box sx={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 400, height: 400, borderRadius: '50%', border: '2px dashed', borderColor: 'divider', zIndex: 1
            }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
