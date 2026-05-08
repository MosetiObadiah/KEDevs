// src/app/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Avatar,
  Skeleton,
  TextField,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Hero } from '@/components/home/Hero';
import { PillBadge } from '@/components/shared/PillBadge';
import { jobService } from '@/services/jobService';
import { developerService } from '@/services/developerService';
import { JobSummary, DeveloperSummary } from '@/lib/types';

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<JobSummary[]>([]);
  const [spotlightDevs, setSpotlightDevs] = useState<DeveloperSummary[]>([]);
  const [randomJob, setRandomJob] = useState<JobSummary | null>(null);
  const [randomDev, setRandomDev] = useState<DeveloperSummary | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingDevs, setIsLoadingDevs] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch Jobs (spotlight jobs ordered by upvotes + recency)
        const jobsResponse = await jobService.getPublicJobs(0, 4);
        if (jobsResponse.success) {
          setFeaturedJobs(jobsResponse.data.content);
        }
        setIsLoadingJobs(false);

        // Fetch Developers (Spotlight first, then fallback to public)
        const spotlightResponse = await developerService.getCurrentSpotlight();
        let devs: DeveloperSummary[] = [];

        if (spotlightResponse.success) {
          const { daySlot, weekSlot } = spotlightResponse.data;

          [daySlot, weekSlot].forEach(slot => {
            if (slot) {
              devs.push({
                id: slot.developerId,
                firstName: slot.developerName.split(' ')[0],
                lastName: slot.developerName.split(' ')[1] || '',
                profilePhoto: slot.profilePhoto,
                currentLastRole: slot.currentLastRole,
                skills: slot.featuredProjects.length > 0
                  ? (Array.isArray(slot.featuredProjects[0].techStack)
                      ? slot.featuredProjects[0].techStack
                      : (slot.featuredProjects[0].techStack || '').split(',').map((s: string) => s.trim()))
                  : [],
                availabilityStatus: 'AVAILABLE_NOW',
                isVerified: slot.isVerified,
                locationCity: slot.locationCity || 'Nairobi',
                locationCountry: slot.locationCountry || 'Kenya'
              });
            }
          });
        }


        if (devs.length < 3) {
          const publicResponse = await developerService.getPublicDevelopers(0, 3);
          if (publicResponse.success) {
            const publicDevs = publicResponse.data.content;
            devs = [...devs, ...publicDevs].slice(0, 3);
          }
        }

        setSpotlightDevs(devs);
        setIsLoadingDevs(false);
      } catch (err) {
        console.error('Failed to fetch landing page data:', err);
        setError('Failed to load some content. Please try again later.');
        setIsLoadingJobs(false);
        setIsLoadingDevs(false);
      }
    };

    fetchLandingData();
  }, []);

  // Set random job and developer for hero display
  React.useEffect(() => {
    if (featuredJobs.length > 0) {
      const randomJobIdx = Math.floor(Math.random() * featuredJobs.length);
      setRandomJob(featuredJobs[randomJobIdx]);
    }
  }, [featuredJobs]);

  React.useEffect(() => {
    if (spotlightDevs.length > 0) {
      const randomDevIdx = Math.floor(Math.random() * spotlightDevs.length);
      setRandomDev(spotlightDevs[randomDevIdx]);
    }
  }, [spotlightDevs]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = contactForm;
    const mailtoLink = `mailto:support@kedevs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoLink;
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const formatJobType = (type: string) => {
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <Box>
      <Hero randomJob={randomJob} randomDev={randomDev} />

      {/* Featured Jobs Section */}
      <Box sx={{ bgcolor: 'background.subtle', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <PillBadge variant="sage">OPPORTUNITIES</PillBadge>
              <Typography variant="h2" sx={{ mt: 2 }}>
                Spotlight <Box component="span" sx={{ color: 'primary.main' }}>Jobs</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 520 }}>
                The most upvoted and newest jobs currently available for developers.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/jobs"
              endIcon={<ArrowForwardIcon />}
              sx={{ fontWeight: 700, mb: 1 }}
            >
              View Jobs Board
            </Button>
          </Box>

          <Grid container spacing={4}>
            {isLoadingJobs ? (
              [1, 2, 3].map((i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Card sx={{ p: 1, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="60%" sx={{ mb: 3 }} />
                      <Stack direction="row" spacing={1}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              featuredJobs.map((job) => (
                <Grid size={{ xs: 12, md: 4 }} key={job.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 1
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Chip label={formatJobType(job.jobType)} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                        {job.status === 'OPEN' && <VerifiedIcon color="primary" fontSize="small" />}
                      </Stack>
                      <Typography
                        variant="h4"
                        component={Link}
                        href={`/jobs/${job.id}`}
                        sx={{
                          fontWeight: 800,
                          color: 'text.primary',
                          textDecoration: 'none',
                          display: 'block',
                          mb: 1,
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 3 }}>
                        {job.companyName} • {job.locationCity}, {job.locationCountry}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.tags.slice(0, 3).map(tag => (
                          <Chip key={tag} label={tag} size="small" sx={{ borderRadius: 1 }} />
                        ))}
                      </Box>
                    </CardContent>
                    <Divider />
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {job.workType}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/jobs/${job.id}`}
                        sx={{ fontWeight: 700 }}
                      >
                        Apply →
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
          {featuredJobs.length === 0 && !isLoadingJobs && (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              No featured jobs available right now.
            </Typography>
          )}
        </Container>
      </Box>

      {/* Developers Section */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <PillBadge variant="mint">TALENT SPOTLIGHT</PillBadge>
            <Typography variant="h2" sx={{ mt: 2 }}>
              Top <Box component="span" sx={{ color: 'primary.main' }}>Developers</Box>
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {isLoadingDevs ? (
              [1, 2, 3].map((i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Card sx={{ textAlign: 'center', p: 4 }}>
                    <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', mb: 3 }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant="text" width="40%" sx={{ mx: 'auto', mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Skeleton variant="rectangular" width={50} height={24} />
                      <Skeleton variant="rectangular" width={50} height={24} />
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              spotlightDevs.map((dev) => (
                <Grid size={{ xs: 12, md: 4 }} key={dev.id}>
                  <Card sx={{ textAlign: 'center', p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Avatar
                      src={dev.profilePhoto}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 3,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 800
                      }}
                    >
                      {!dev.profilePhoto && dev.firstName.charAt(0)}
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{dev.firstName} {dev.lastName}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 3 }}>{dev.currentLastRole}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 4, flexGrow: 1 }}>
                      {dev.skills.slice(0, 4).map(skill => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      component={Link}
                      href={`/developers/${dev.id}`}
                      sx={{ borderRadius: 2, fontWeight: 700, mt: 'auto' }}
                    >
                      View Full Profile
                    </Button>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/developers"
              sx={{ px: 6, py: 2, fontWeight: 800, borderRadius: 3 }}
            >
              Browse Developer Directory
            </Button>
          </Box>
        </Container>
      </Box>


      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 900 }}>
            Ready to grow your team?
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, fontSize: '1.25rem', opacity: 0.9 }}>
            Join hundreds of companies hiring top Kenyan developers every day.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/register"
              sx={{ px: 6, py: 2, fontWeight: 800, borderRadius: 2 }}
            >
              Post a Job for Free
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
