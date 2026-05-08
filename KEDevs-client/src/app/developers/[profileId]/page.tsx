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
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';

export default function DeveloperProfilePage() {
  const { profileId } = useParams();
  const { isLoggedIn } = useAuth();
  const [dev, setDev] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const fullName = dev ? (dev.fullName || `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || dev.email || 'Developer') : '';

  useEffect(() => {
    const loadDeveloper = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getDeveloperProfile(profileId as string);
        if (response.success) {
          const data = response.data;
          setDev(data);
          const computedName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'Developer';
          setMessage(`Hi ${computedName}, I found your profile on KEDevs and would like to invite you to apply for an opportunity.`);
        }
      } catch (err: any) {
        console.error(err);
        setError('Unable to load developer profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeveloper();
  }, [profileId]);

  const handleContactDeveloper = async () => {
    if (!dev) return;
    setIsRequesting(true);
    try {
      const response = await employerService.contactDeveloper(dev.id, { message });
      if (response.success) {
        alert('Contact request sent successfully.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to send contact request.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEndorseDeveloper = async () => {
    if (!dev) return;
    try {
      await developerService.endorseDeveloper(dev.id, { message: 'Strong recommendation from the KEDevs community.' });
      alert('Developer endorsed successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to endorse developer.');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" gutterBottom>Loading profile...</Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !dev) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4">Developer not found</Typography>
        <Button component={Link} href="/developers" sx={{ mt: 2 }}>Back to Directory</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, alignItems: 'center', borderRadius: 3 }}>
            <Avatar
              sx={{
                width: { xs: 100, md: 150 },
                height: { xs: 100, md: 150 },
                bgcolor: 'primary.light',
                color: 'primary.main',
                fontSize: { xs: '2rem', md: '4rem' },
                fontWeight: 700,
              }}
            >
              {fullName.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{fullName}</Typography>
                {dev.isVerified && <VerifiedIcon color="primary" sx={{ fontSize: '2rem' }} />}
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom>{dev.currentRole || dev.role}</Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{dev.city || 'Nairobi'}, Kenya</Typography>
                </Stack>
                <Chip
                  label={dev.availability || 'Available'}
                  size="small"
                  color={(dev.availability || 'Available') === 'Available' ? 'success' : 'warning'}
                  sx={{ fontWeight: 700 }}
                />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <StarIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{dev.endorsementsCount || dev.endorsementCount || 0} endorsements</Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack spacing={2} sx={{ minWidth: { xs: '100%', md: 220 } }}>
              {!isLoggedIn ? (
                <Button variant="contained" fullWidth component={Link} href="/register" sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Sign up to Connect
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                  onClick={handleContactDeveloper}
                  disabled={isRequesting}
                >
                  Contact Developer
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                disabled={!isLoggedIn}
                sx={{ borderRadius: 2, fontWeight: 700 }}
                onClick={handleEndorseDeveloper}
              >
                {isLoggedIn ? 'Endorse' : 'Login to Endorse'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>About</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {dev.bio || 'No biography provided yet.'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Tech Stack</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(dev.skills || []).map((skill: string) => (
                <Chip key={skill} label={skill} variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Featured Projects</Typography>
            {(dev.projects || []).length > 0 ? (
              <Stack spacing={3}>
                {(dev.projects || []).map((project: any, index: number) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main' }, overflow: 'hidden' }}>
                    <Grid container>
                      {project.screenshotUrl && (
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              minHeight: { xs: 180, md: '100%' },
                              backgroundImage: `url(${project.screenshotUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'top center',
                            }}
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, md: project.screenshotUrl ? 8 : 12 }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{project.title}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1, mb: 2 }}>
                            {project.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {(project.techStack || []).map((tech: string) => (
                              <Chip key={tech} label={tech} size="small" />
                            ))}
                          </Box>
                          <Stack direction="row" spacing={1.5}>
                            {(project.projectUrl || project.url) && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<LanguageIcon />}
                                component="a"
                                href={project.projectUrl || project.url}
                                target="_blank"
                                sx={{ borderRadius: 1.5, fontWeight: 700 }}
                              >
                                View Live Demo
                              </Button>
                            )}
                            {project.repoUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<GitHubIcon />}
                                component="a"
                                href={project.repoUrl}
                                target="_blank"
                                sx={{ borderRadius: 1.5, fontWeight: 700 }}
                              >
                                Code Repository
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No public projects listed.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Contact Information</Typography>
            <Divider sx={{ mb: 3 }} />

            {!isLoggedIn ? (
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Private information is hidden for guests.
                </Typography>
                <Button variant="contained" component={Link} href="/register" sx={{ mt: 1, borderRadius: 1.5, fontWeight: 700 }}>
                  Sign up to view
                </Button>
              </Box>
            ) : (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <EmailIcon color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.email || 'Not shared'}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.phone || 'Not shared'}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <LinkedInIcon color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.linkedin ? 'LinkedIn Profile' : 'Not linked'}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <GitHubIcon color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.github ? 'GitHub Profile' : 'Not linked'}</Typography>
                </Stack>
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Professional Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>EXPERIENCE</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.experience || 'Not specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>PREFERRED WORK TYPE</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.preferredWorkType || 'Full-time, Remote'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
