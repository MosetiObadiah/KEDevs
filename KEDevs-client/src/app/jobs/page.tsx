// src/app/jobs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  IconButton,
  Button,
  Tooltip,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FlagIcon from '@mui/icons-material/Flag';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '@/context/AuthContext';
import { PillBadge } from '@/components/shared/PillBadge';
import { jobService } from '@/services/jobService';
import { JobSummary } from '@/lib/types';

export default function JobsPage() {
  const { user, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [workType, setWorkType] = useState('All');
  const [upvotedJobs, setUpvotedJobs] = useState<Set<string>>(new Set());
  const [downvotedJobs, setDownvotedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobs({
          page: 0,
          size: 20,
          title: searchTerm,
          workType: workType === 'All' ? undefined : workType
        });
        if (response.success) {
          setJobs(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, workType]);

  const handleVote = async (id: string, vote: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;

    const wasUpvoted = upvotedJobs.has(id);
    const wasDownvoted = downvotedJobs.has(id);
    const prevUpvoted = new Set(upvotedJobs);
    const prevDownvoted = new Set(downvotedJobs);

    if (vote === 'UP') {
      if (wasUpvoted) {
        prevUpvoted.delete(id);
      } else {
        prevUpvoted.add(id);
        prevDownvoted.delete(id);
      }
    } else {
      if (wasDownvoted) {
        prevDownvoted.delete(id);
      } else {
        prevDownvoted.add(id);
        prevUpvoted.delete(id);
      }
    }

    setUpvotedJobs(prevUpvoted);
    setDownvotedJobs(prevDownvoted);

    try {
      await jobService.voteJob(id, vote);
    } catch (err: any) {
      setUpvotedJobs(upvotedJobs);
      setDownvotedJobs(downvotedJobs);
      console.error(err);
    }
  };

  const handleFlagJob = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    try {
      await jobService.flagJob(id, 'Suspicious or spam job listing');
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
          <Box>
            <PillBadge variant="mint">OPPORTUNITIES</PillBadge>
            <Typography variant="h2" sx={{ mt: 2 }}>
              Job <Box component="span" sx={{ color: 'primary.main' }}>Board</Box>
            </Typography>
          </Box>
          {isLoggedIn && (
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link} 
              href="/jobs/post"
              sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.5 }}
            >
              Post a Job
            </Button>
          )}
        </Box>
        
        <Grid container spacing={4}>
          {/* Filters Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={3}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>Search</Typography>
                <TextField
                  fullWidth
                  placeholder="Title, company, etc."
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

                <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>Work Type</Typography>
                <TextField
                  select
                  fullWidth
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  sx={{ mb: 4 }}
                  slotProps={{
                    select: {
                      MenuProps: {
                        slotProps: {
                          paper: {
                            sx: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="REMOTE">Remote</MenuItem>
                  <MenuItem value="ONSITE">On-site</MenuItem>
                  <MenuItem value="HYBRID">Hybrid</MenuItem>
                </TextField>

                <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>Sort By</Typography>
                <TextField
                  select
                  fullWidth
                  defaultValue="newest"
                  slotProps={{
                    select: {
                      MenuProps: {
                        slotProps: {
                          paper: {
                            sx: {
                              maxHeight: 300,
                              overflow: 'auto'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="upvotes">Most Upvoted</MenuItem>
                </TextField>
              </Paper>


            </Stack>
          </Grid>

          {/* Job List */}
          <Grid size={{ xs: 12, md: 9 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Stack spacing={3}>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <Card key={i} sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" sx={{ mb: 3 }} />
                        <Stack direction="row" spacing={1}>
                          <Skeleton variant="rectangular" width={60} height={24} />
                          <Skeleton variant="rectangular" width={60} height={24} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Card>
                ))
              ) : jobs.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                  <Typography variant="h5" color="text.secondary">No jobs found matching your criteria.</Typography>
                </Paper>
              ) : (
                jobs.map((job) => (
                  <Card 
                    key={job.id} 
                    sx={{ 
                      p: 1,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography 
                              variant="h4" 
                              component={Link} 
                              href={`/jobs/${job.id}`}
                              sx={{ fontWeight: 800, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                            >
                              {job.title}
                            </Typography>
                            {job.status === 'OPEN' && <VerifiedIcon color="primary" fontSize="small" />}
                          </Box>
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 3 }}>
                            {job.companyName} • {job.locationCity}, {job.locationCountry}
                            {job.applicationDeadline && ` • Deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}`}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <Chip label={formatJobType(job.jobType)} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                            <Chip label={job.workType} size="small" sx={{ borderRadius: 1.5 }} />
                            {job.tags.slice(0, 3).map(tag => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                            ))}
                          </Stack>
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title={isLoggedIn ? "Upvote" : "Login to upvote"}>
                              <IconButton 
                                onClick={(e) => handleVote(job.id, 'UP', e)}
                                color={upvotedJobs.has(job.id) ? 'primary' : 'default'}
                                disabled={!isLoggedIn}
                                sx={{ bgcolor: upvotedJobs.has(job.id) ? 'primary.light' : 'background.subtle' }}
                              >
                                <ThumbUpIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={isLoggedIn ? "Downvote" : "Login to downvote"}>
                              <IconButton 
                                onClick={(e) => handleVote(job.id, 'DOWN', e)}
                                color={downvotedJobs.has(job.id) ? 'error' : 'default'}
                                disabled={!isLoggedIn}
                                sx={{ bgcolor: downvotedJobs.has(job.id) ? 'error.light' : 'background.subtle' }}
                              >
                                <ThumbDownIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Report Job">
                              <IconButton sx={{ bgcolor: 'background.subtle' }} disabled={!isLoggedIn}>
                                <FlagIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          
                          <Box sx={{ width: '100%', textAlign: { md: 'right' }, mt: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
                              {job.upvoteCount} Upvotes
                            </Typography>
                            <Button 
                              variant={user?.role === 'DEVELOPER' ? 'contained' : 'outlined'} 
                              fullWidth 
                              component={Link}
                              href={isLoggedIn ? `/jobs/${job.id}` : '/register'}
                              sx={{ borderRadius: 2, fontWeight: 800 }}
                            >
                              {isLoggedIn ? (user?.role === 'DEVELOPER' ? 'Apply Now' : 'View Details') : 'Register to Apply'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
