// src/app/developers/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  Avatar,
  Button,
  Tooltip,
  IconButton,
  Paper,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '@/context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import StarIcon from '@mui/icons-material/Star';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { PillBadge } from '@/components/shared/PillBadge';
import { developerService } from '@/services/developerService';
import { DeveloperSummary } from '@/lib/types';

export default function DevelopersPage() {
  const { isLoggedIn, user } = useAuth();
  const [devs, setDevs] = useState<DeveloperSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('All');

  useEffect(() => {
    const fetchDevs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await developerService.getPublicDevelopers(0, 50);
        if (response.success) {
          setDevs(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch developers. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevs();
  }, []);

  const filteredDevs = devs.filter(dev => 
    (
      `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dev.currentLastRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ) && (availability === 'All' || dev.availabilityStatus === availability)
  );

  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <PillBadge variant="mint">TALENT DIRECTORY</PillBadge>
          <Typography variant="h2" sx={{ mt: 2 }}>
            Kenyan <Box component="span" sx={{ color: 'primary.main' }}>Developers</Box>
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {/* Filters Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>Search Talent</Typography>
              <TextField
                fullWidth
                placeholder="Name, role, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 4 }}
              />

              <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>Availability</Typography>
              <TextField
                select
                fullWidth
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <MenuItem value="All">Any Availability</MenuItem>
                <MenuItem value="AVAILABLE_NOW">Available Now</MenuItem>
                <MenuItem value="OPEN_TO_OFFERS">Open to Offers</MenuItem>
              </TextField>
            </Paper>
          </Grid>

          {/* Results */}
          <Grid size={{ xs: 12, md: 9 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Grid container spacing={3}>
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                      <Skeleton variant="circular" width={90} height={90} sx={{ mx: 'auto', mb: 2 }} />
                      <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="text" width="40%" sx={{ mx: 'auto', mb: 3 }} />
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                        <Skeleton variant="rectangular" width={50} height={24} />
                        <Skeleton variant="rectangular" width={50} height={24} />
                      </Stack>
                    </Card>
                  </Grid>
                ))
              ) : filteredDevs.length > 0 ? (
                filteredDevs.map((dev) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={dev.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
                        <Box component={Link} href={`/developers/${dev.id}`} sx={{ textDecoration: 'none' }}>
                          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                            <Avatar 
                              src={dev.profilePhoto}
                              sx={{ 
                                width: 90, 
                                height: 90, 
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                mx: 'auto',
                                fontSize: '2.5rem',
                                fontWeight: 800
                              }}
                            >
                              {!dev.profilePhoto && dev.firstName.charAt(0)}
                            </Avatar>
                            {dev.isVerified && (
                              <VerifiedIcon 
                                color="primary" 
                                sx={{ 
                                  position: 'absolute', 
                                  bottom: 4, 
                                  right: 4, 
                                  bgcolor: 'background.paper', 
                                  borderRadius: '50%',
                                  p: 0.2
                                }} 
                                fontSize="small"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                            {dev.firstName} {dev.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                            {dev.currentLastRole}
                          </Typography>
                        </Box>

                        <Chip 
                          label={dev.availabilityStatus.replace('_', ' ')} 
                          size="small" 
                          color={dev.availabilityStatus === 'AVAILABLE_NOW' ? 'success' : 'warning'} 
                          sx={{ mb: 3, fontWeight: 700, borderRadius: 1.5 }}
                        />
                        
                        {(isLoggedIn && (user?.role === 'EMPLOYER' || user?.id === dev.id)) && (
                          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', mb: 3, color: 'text.secondary' }}>
                            <Tooltip title="Email"><IconButton size="small"><EmailIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="LinkedIn Profile"><IconButton size="small"><LinkedInIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Phone"><IconButton size="small"><PhoneIcon fontSize="small" /></IconButton></Tooltip>
                          </Stack>
                        )}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                          {dev.skills.slice(0, 3).map(skill => (
                            <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                          ))}
                        </Box>
                      </CardContent>

                      <Divider />

                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          LOCATION: {dev.locationCity}, {dev.locationCountry}
                        </Typography>
                        {user?.role === 'DEVELOPER' ? (
                          <Button 
                            size="small" 
                            disabled={!isLoggedIn}
                            startIcon={<StarIcon />}
                            sx={{ fontWeight: 800 }}
                          >
                            Endorse
                          </Button>
                        ) : (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Bookmark">
                              <IconButton size="small" color="primary" sx={{ bgcolor: 'background.subtle' }}>
                                <BookmarkBorderIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button 
                              size="small" 
                              variant="contained" 
                              component={Link} 
                              href="/hiring-assist"
                              sx={{ fontWeight: 800, borderRadius: 1.5 }}
                            >
                              Request
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      No developers found.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

