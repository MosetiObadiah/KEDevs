// src/app/jobs/my-posts/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { jobs } from '@/data/mockData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';

// Mocking "my posts" by taking a subset of jobs
const myPosts = jobs.map(job => ({
  ...job,
  status: job.id === '1' ? 'Open' : job.id === '2' ? 'Under Review' : 'Closed',
  applicantCount: Math.floor(Math.random() * 20) + 5
}));

const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
  'Open': 'success',
  'Under Review': 'warning',
  'Closed': 'error',
};

export default function MyJobPosts() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
          My <Box component="span" sx={{ color: 'primary.main' }}>Job Posts</Box>
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href="/jobs/post"
          sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 0 }}
        >
          Post New Job
        </Button>
      </Box>

      <Stack spacing={3}>
        {myPosts.map((post) => (
          <Card key={post.id} sx={{ borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography 
                      variant="h5" 
                      component={Link} 
                      href={`/jobs/${post.id}`}
                      sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                    >
                      {post.title}
                    </Typography>
                    <Chip 
                      label={post.status} 
                      size="small"
                      color={statusColors[post.status] || 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Posted on {post.postedDate} • {post.location}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {post.applicantCount}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Applicants
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: { md: 'flex-end' } }}>
                    <Tooltip title="View Applicants">
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<PeopleIcon />}
                        component={Link}
                        href={`/jobs/${post.id}/applicants`}
                        sx={{ borderRadius: 2 }}
                      >
                        Manage
                      </Button>
                    </Tooltip>
                    <Tooltip title="Edit Post">
                      <IconButton size="small" sx={{ bgcolor: '#f5f5f5' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close Post">
                      <IconButton size="small" sx={{ bgcolor: '#f5f5f5' }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Post">
                      <IconButton size="small" sx={{ bgcolor: '#fee', color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
