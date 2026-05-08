// src/app/companies/[companyId]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Paper,
  Avatar,
  Skeleton,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import GroupIcon from '@mui/icons-material/Group';
import { companyService, CompanyProfile } from '@/services/companyService';

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const response = await companyService.getCompanyDetails(companyId as string);
        if (response.success) {
          setCompany(response.data);
        }
      } catch (err: any) {
        setError('Company not found');
      } finally {
        setIsLoading(false);
      }
    };
    if (companyId) fetchCompany();
  }, [companyId]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} /></Grid>
        </Grid>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4">Company not found</Typography>
        <Button component={Link} href="/companies" sx={{ mt: 2 }}>Back to Directory</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Header */}
        <Grid size={12}>
          <Paper sx={{ p: 4, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', borderRadius: 4 }}>
            <Avatar 
              src={company.logoUrl}
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'grey.100',
                color: 'primary.main',
                border: 1,
                borderColor: 'divider'
              }}
            >
              {!company.logoUrl && <BusinessIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{company.companyName}</Typography>
                {company.isApproved && <VerifiedIcon color="primary" fontSize="large" />}
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom>{company.industry}</Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2, alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">{company.locationHQ}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <GroupIcon fontSize="small" color="action" />
                  <Typography variant="body2">{company.companySize?.replace('_', ' ')}</Typography>
                </Stack>
                {company.companyWebsite && (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <LanguageIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="a" href={company.companyWebsite} target="_blank" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                      Website
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
            <Button variant="contained" size="large" component={Link} href="/register" sx={{ borderRadius: 2, fontWeight: 800 }}>
              Sign up to Work Here
            </Button>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>About {company.companyName}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {company.companyBio || 'No biography available.'}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
              Open Positions
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">Visit the job feed to see all active positions from this company.</Typography>
              <Button variant="outlined" component={Link} href="/jobs" sx={{ borderRadius: 2, fontWeight: 700 }}>Browse Jobs</Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>Contact Info</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">CONTACT PERSON</Typography>
              <Typography variant="body1" gutterBottom sx={{ fontWeight: 700 }}>{company.contactPersonName}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>OFFICIAL EMAIL</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{company.contactEmail}</Typography>

              {company.linkedinUrl && (
                <Button variant="text" startIcon={<LanguageIcon />} sx={{ mt: 2 }} component="a" href={company.linkedinUrl} target="_blank">
                  LinkedIn
                </Button>
              )}
            </Box>

            <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 4, borderRadius: 2, fontWeight: 700 }} component={Link} href="/register">
              Join KEDevs to apply
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
