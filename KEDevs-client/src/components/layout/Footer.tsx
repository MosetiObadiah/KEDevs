// src/components/layout/Footer.tsx
'use client';
import React from 'react';
import { Box, Container, Typography, Link, Grid, Stack, Divider, Button } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.inverse', 
        color: 'white', 
        pt: 10, 
        pb: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-1.5px',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}
            >
              <WorkIcon sx={{ fontSize: 32 }} /> KEDevs
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 320, mb: 4, lineHeight: 1.8 }}>
              Connecting Kenya's elite tech talent with the world's most innovative companies. Built for developers, by developers.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Platform</Typography>
            <Stack spacing={2}>
              {['Browse Jobs', 'Developer Directory', 'Company Board', 'Success Stories'].map(link => (
                <Link key={link} href="#" sx={{ color: 'white', opacity: 0.6, textDecoration: 'none', '&:hover': { opacity: 1, color: 'primary.main' } }}>
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Resources</Typography>
            <Stack spacing={2}>
              {['Pricing', 'Verification Guide', 'Career Advice', 'Community Forum'].map(link => (
                <Link key={link} href="#" sx={{ color: 'white', opacity: 0.6, textDecoration: 'none', '&:hover': { opacity: 1, color: 'primary.main' } }}>
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Stay Connected</Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
              Subscribe to our newsletter for the latest jobs and tech news from Kenya.
            </Typography>
            {/* Newsletter input placeholder */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flexGrow: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>Email Address</Typography>
              </Box>
              <Button variant="contained" color="primary" sx={{ fontWeight: 800, borderRadius: 2 }}>Join</Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} KEDevs Connect. All rights reserved. Made in Nairobi.
          </Typography>
          <Stack direction="row" spacing={4}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
              <Link key={link} href="#" sx={{ color: 'white', opacity: 0.4, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { opacity: 1 } }}>
                {link}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
