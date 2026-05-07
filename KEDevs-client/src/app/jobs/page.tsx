// src/app/jobs/page.tsx
'use client';
import React, { useState } from 'react';
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
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { jobs } from '@/data/mockData';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [workType, setWorkType] = useState('All');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = workType === 'All' || job.workType === workType;
    return matchesSearch && matchesType;
  });

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
                }
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
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="On-site">On-site</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Sort By"
              defaultValue="newest"
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="upvotes">Most Upvoted</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Results */}
      <Stack spacing={3}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              component={Link} 
              href={`/jobs/${job.id}`}
              sx={{ 
                textDecoration: 'none',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main', border: '1px solid' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {job.title}
                      </Typography>
                      {job.isVerified && <VerifiedIcon color="primary" fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {job.company} • {job.location}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Chip label={job.type} size="small" variant="filled" color="primary" />
                      <Chip label={job.workType} size="small" variant="outlined" />
                      {job.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {job.upvoteCount} Upvotes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Posted on {job.postedDate}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
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
