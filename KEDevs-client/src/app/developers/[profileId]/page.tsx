// src/app/developers/[profileId]/page.tsx
'use client';
import React from 'react';
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
  IconButton,
} from '@mui/material';
import { developers } from '@/data/mockData';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';

import { useAuth } from '@/context/AuthContext';

export default function DeveloperProfilePage() {
  const { profileId } = useParams();
  const { isLoggedIn } = useAuth();
  const dev = developers.find(d => d.id === profileId);

  if (!dev) {
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
        {/* Header Section */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, alignItems: 'center', borderRadius: 3 }}>
            <Avatar 
              sx={{ 
                width: { xs: 100, md: 150 }, 
                height: { xs: 100, md: 150 }, 
                bgcolor: 'primary.light',
                color: 'primary.main',
                fontSize: { xs: '2rem', md: '4rem' },
                fontWeight: 700
              }}
            >
              {dev.name.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{dev.name}</Typography>
                {dev.isVerified && <VerifiedIcon color="primary" sx={{ fontSize: '2rem' }} />}
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom>{dev.role}</Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{dev.city}, Kenya</Typography>
                </Stack>
                <Chip 
                  label={dev.availability} 
                  size="small" 
                  color={dev.availability === 'Available' ? 'success' : 'warning'} 
                  sx={{ fontWeight: 700 }}
                />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <StarIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{dev.endorsementCount} endorsements</Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack spacing={2} sx={{ minWidth: { xs: '100%', md: 200 } }}>
              {!isLoggedIn ? (
                <Button variant="contained" fullWidth component={Link} href="/register" sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Sign up to Connect
                </Button>
              ) : (
                <Button variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Contact Developer
                </Button>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                disabled={!isLoggedIn} 
                sx={{ borderRadius: 2, fontWeight: 700 }}
                onClick={() => isLoggedIn && alert('Endorsed!')}
              >
                {isLoggedIn ? 'Endorse' : 'Login to Endorse'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* About & Projects */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>About</Typography>
            {isLoggedIn ? (
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ whiteSpace: 'pre-line' }}>
                {dev.bio}
              </Typography>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Typography variant="body1" color="text.secondary" sx={{ filter: 'blur(4px)', opacity: 0.5, userSelect: 'none' }}>
                  Professional background and career summary are private. Register to see the full story of this developer's journey and expertise in the Kenyan tech ecosystem.
                  Kenyan tech ecosystem. Professional background and career summary are private. Register to see the full story of this developer's journey and expertise in the Kenyan tech ecosystem.
                </Typography>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                  <Button variant="contained" component={Link} href="/register" sx={{ fontWeight: 800, borderRadius: 2 }}>Sign up to view Bio</Button>
                </Box>
              </Box>
            )}

            <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Tech Stack</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dev.skills.map(skill => (
                <Chip key={skill} label={skill} variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
              ))}
            </Box>

            <Typography variant="h5" sx={{ mt: 4, mb: 3, fontWeight: 700 }}>Featured Projects</Typography>
            {!isLoggedIn ? (
              <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Project portfolio is only visible to registered users.</Typography>
                <Button component={Link} href="/register" sx={{ mt: 1, fontWeight: 700 }}>Create Account</Button>
              </Box>
            ) : dev.projects.length > 0 ? (
              <Stack spacing={3}>
                {dev.projects.map((project, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{project.title}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                        {project.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {project.techStack.map(ts => (
                          <Chip key={ts} label={ts} size="small" />
                        ))}
                      </Box>
                      {project.url && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<LanguageIcon />} 
                          component="a" 
                          href={project.url} 
                          target="_blank"
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          View Live Demo
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No public projects listed.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Sidebar Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Contact Information</Typography>
            <Divider sx={{ mb: 3 }} />
            
            {!isLoggedIn ? (
              <>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Private information is hidden for guests.
                  </Typography>
                  <Button variant="contained" component={Link} href="/register" sx={{ mt: 1, borderRadius: 1.5, fontWeight: 700 }}>Sign up to view</Button>
                </Box>

                <Stack spacing={3} sx={{ mt: 4, opacity: 0.2, pointerEvents: 'none' }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <EmailIcon color="action" />
                    <Typography variant="body2">j********@example.com</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body2">+254 7** *** ***</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <LinkedInIcon color="action" />
                    <Typography variant="body2">linkedin.com/in/j***</Typography>
                  </Stack>
                </Stack>
              </>
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

          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Professional Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>EXPERIENCE</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{dev.experience}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>PREFERRED WORK TYPE</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Full-time, Remote</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
