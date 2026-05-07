// src/app/jobs/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
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
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import { jobService } from '@/services/jobService';
import { JobSummary } from '@/lib/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workType, setWorkType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query: Record<string, string> = { page: '0', size: '20' };
        if (searchTerm.trim()) query.title = searchTerm.trim();
        if (workType !== 'All') query.workType = workType;

        const response = await jobService.getJobs(query);
        if (response.success) {
          setJobs(response.data.content);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load jobs right now. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchJobs, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, workType]);

  const sortedJobs = React.useMemo(() => {
    return [...jobs].sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvoteCount - a.upvoteCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, sortBy]);

  const formatWorkType = (value: string) => {
    return value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
        Browse <Box component="span" sx={{ color: 'primary.main' }}>Jobs</Box>
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 6, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by title or company..."
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
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Work Type"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="REMOTE">Remote</MenuItem>
              <MenuItem value="ON_SITE">On-site</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="upvotes">Most Upvoted</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Box sx={{ mb: 4 }}>
          <Typography color="error.main" sx={{ fontWeight: 700 }}>{error}</Typography>
        </Box>
      )}

      <Stack spacing={3}>
        {isLoading ? (
          [1, 2, 3, 4].map((placeholder) => (
            <Card key={placeholder} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="40%" height={36} />
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Stack>
            </Card>
          ))
        ) : sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <Card 
              key={job.id} 
              component={Link} 
              href={`/jobs/${job.id}`}
              sx={{ 
                textDecoration: 'none',
                transition: 'border-color 0.2s',
                border: '1px solid transparent',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {job.title}
                      </Typography>
                      {job.status === 'OPEN' && <VerifiedIcon color="primary" fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {job.companyName} • {job.locationCity}, {job.locationCountry}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Chip label={formatWorkType(job.jobType)} size="small" variant="outlined" />
                      <Chip label={formatWorkType(job.workType)} size="small" />
                      {job.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {job.upvoteCount} Upvotes
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography 
                        variant="button" 
                        sx={{ 
                          color: 'primary.main', 
                          fontWeight: 700,
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Sign up to apply →
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No jobs found matching your criteria.
            </Typography>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
