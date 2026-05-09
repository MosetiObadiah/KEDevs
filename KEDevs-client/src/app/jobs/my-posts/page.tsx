// src/app/jobs/my-posts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { jobService } from '@/services/jobService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import toast from 'react-hot-toast';

const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
  'OPEN': 'success',
  'UNDER_REVIEW': 'warning',
  'CLOSED': 'error',
  'EXPIRED': 'default',
};

export default function MyJobPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
    try {
      const response = await jobService.getMyPosts();
      if (response.success) {
        setPosts(response.data?.content || []);
      } else {
        setError('Failed to fetch job posts.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading job posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleClosePost = async (id: string) => {
    if (!confirm('Are you sure you want to close this job post?')) return;
    try {
      const res = await jobService.updateJobStatus(id, 'CLOSED');
      if (res.success) {
        toast.success('Job post closed successfully.');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to close job post.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job post? This action cannot be undone.')) return;
    try {
      const res = await jobService.deleteJob(id);
      if (res.success) {
        toast.success('Job post deleted successfully.');
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete job post.');
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Open';
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {posts.length > 0 ? (
        <Stack spacing={3}>
          {posts.map((post) => (
            <Card key={post.id} sx={{ borderRadius: 3, overflow: 'visible' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="h5" 
                        component={Link} 
                        href={`/jobs/${post.id}`}
                        sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                      >
                        {post.title}
                      </Typography>
                      <Chip 
                        label={formatStatus(post.status)} 
                        size="small"
                        color={statusColors[post.status] || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Posted on {new Date(post.createdAt).toLocaleDateString()} • {post.locationCity}, {post.locationCountry}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: { md: 'flex-end' }, alignItems: 'center' }}>
                      <Tooltip title="View Applicants">
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<PeopleIcon />}
                          component={Link}
                          href={`/jobs/${post.id}/applications`}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Manage
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit Post">
                        <IconButton 
                          size="small" 
                          component={Link}
                          href={`/jobs/post?edit=${post.id}`}
                          sx={{ bgcolor: '#f5f5f5' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {post.status !== 'CLOSED' && (
                        <Tooltip title="Close Post">
                          <IconButton 
                            size="small" 
                            onClick={() => handleClosePost(post.id)}
                            sx={{ bgcolor: '#f5f5f5' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Post">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeletePost(post.id)}
                          sx={{ bgcolor: '#fee', color: 'error.main' }}
                        >
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
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't posted any jobs yet.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            href="/jobs/post" 
            sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
          >
            Post a Job
          </Button>
        </Box>
      )}
    </Container>
  );
}
