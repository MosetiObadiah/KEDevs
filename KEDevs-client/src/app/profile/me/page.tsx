// src/app/profile/me/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PillBadge } from '@/components/shared/PillBadge';

export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: user?.fullName || '',
    role: '', // Job title
    city: 'Nairobi',
    bio: '',
    skills: [] as string[],
    experience: '',
    availability: 'Available',
    visibility: 'Public',
    email: user?.email || '',
    phone: '',
    github: '',
    linkedin: '',
    portfolio: '',
    languages: [],
    education: [],
    projects: [],
    isVerified: user?.isVerified || false,
    spotlightStatus: user?.spotlightStatus || { isActive: false }
  });

  const handleToggleEdit = () => {
    if (isEditing) {
      alert('Profile updated successfully!');
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
                fontWeight: 900,
                boxShadow: (theme) => `0 0 0 4px ${theme.palette.background.paper}, 0 0 0 8px ${theme.palette.primary.main}40`
              }}
            >
              {profile.name.charAt(0)}
            </Avatar>
            <Box>
              <PillBadge variant="mint">MY PROFILE</PillBadge>
              <Typography variant="h2" sx={{ mt: 1, fontWeight: 900 }}>{profile.name}</Typography>
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>{profile.role} • {profile.city}</Typography>
            </Box>
          </Box>
          <Button
            variant={isEditing ? "contained" : "outlined"}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.5 }}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* About */}
              <Paper sx={{ p: 5, borderRadius: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>About Me</Typography>
                {isEditing ? (
                  <TextField fullWidth multiline rows={4} label="Professional Bio" name="bio" value={profile.bio} onChange={handleChange} />
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: 1.8 }}>
                    {profile.bio || "No bio provided yet."}
                  </Typography>
                )}
              </Paper>

              {/* Skills */}
              <Paper sx={{ p: 5, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>Expertise</Typography>
                  {isEditing && <Button startIcon={<AddIcon />} variant="outlined" size="small">Add Skill</Button>}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {profile.skills.map((skill: string) => (
                    <Chip
                      key={skill}
                      label={skill}
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 2,
                        borderRadius: 2,
                        bgcolor: 'background.subtle'
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Experience */}
              <Paper sx={{ p: 5, borderRadius: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Professional Experience</Typography>
                {isEditing ? (
                  <TextField fullWidth multiline rows={6} label="Detailed Experience" name="experience" value={profile.experience} onChange={handleChange} />
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    {profile.experience || "No experience details added."}
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              {/* Status Section */}
              <Card sx={{ p: 1, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <VerifiedIcon sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Verification</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Trust is key in our community</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>CURRENT STATUS</Typography>
                      <PillBadge variant="neutral">{profile.isVerified ? 'VERIFIED' : 'ACTION REQUIRED'}</PillBadge>
                    </Box>
                    {!profile.isVerified && (
                      <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 900, '&:hover': { bgcolor: '#f0f0f0' } }} onClick={() => router.push('/verify')}>
                        Get Verified
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Availability & Visibility</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Open to Work</Typography>
                    <Switch checked={profile.availability === 'Available'} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Public Profile</Typography>
                    <Switch checked={profile.visibility === 'Public'} />
                  </Box>
                </Stack>
              </Paper>

              {/* Socials */}
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Online Presence</Typography>
                <Stack spacing={2}>
                  {[
                    { icon: <GitHubIcon />, label: 'GitHub', value: profile.github },
                    { icon: <LinkedInIcon />, label: 'LinkedIn', value: profile.linkedin },
                    { icon: <LanguageIcon />, label: 'Portfolio', value: profile.portfolio },
                  ].map((social) => (
                    <Box key={social.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ color: 'text.secondary' }}>{social.icon}</Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>{social.label.toUpperCase()}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{social.value || 'Not linked'}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
