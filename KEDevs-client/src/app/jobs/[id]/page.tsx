// src/app/jobs/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SendIcon from '@mui/icons-material/Send';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { forumService } from '@/services/forumService';
import ApplyDialog from '@/components/jobs/ApplyDialog';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobDetails(id as string);
        if (response.success) {
          setJob(response.data);
        }
      } catch (err: any) {
        setError('Failed to fetch job details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const response = await forumService.getJobComments(id as string);
        if (response.success) {
          setComments(response.data || []);
        }
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchJob();
    fetchComments();
  }, [id]);

  const isPoster = user?.id === job?.postedById;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };


  const handleFlagJob = async () => {
    if (!id) return;
    try {
      await jobService.flagJob(id as string, 'Suspicious job listing');
      alert('Job flagged for review.');
    } catch (err: any) {
      alert(err.message || 'Failed to flag job.');
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !id) return;
    setCommentSubmitting(true);
    try {
      const response = await forumService.postJobComment(id as string, comment.trim());
      if (response.success) {
        setComments((prev) => [{ ...response.data, content: comment.trim(), author: { fullName: 'You' }, createdAt: new Date().toISOString() }, ...prev]);
        setComment('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatJobType = (type: string) => {
    return type?.replace('_', '-').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) || '';
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width="60%" height={80} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4">{error || 'Job not found'}</Typography>
        <Button component={Link} href="/developers" sx={{ mt: 2 }}>Back to Directory</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                  {job.title}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6" color="primary" component={Link} href={`/companies/${job.companyId}`} sx={{ textDecoration: 'none', fontWeight: 700 }}>
                    {job.companyName}
                  </Typography>
                  {job.status === 'OPEN' && <VerifiedIcon color="primary" fontSize="small" />}
                </Stack>
              </Box>
              
              {isLoggedIn && (
                <>
                  <IconButton onClick={handleOpenMenu}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                  >
                    {isPoster ? (
                      [
                        <MenuItem key="edit" onClick={handleCloseMenu}>
                          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                          <ListItemText>Edit Job</ListItemText>
                        </MenuItem>,
                        <MenuItem key="close" onClick={handleCloseMenu}>
                          <ListItemIcon><CloseIcon fontSize="small" /></ListItemIcon>
                          <ListItemText>Close Job</ListItemText>
                        </MenuItem>,
                        <MenuItem key="delete" onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
                          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                          <ListItemText>Delete Job</ListItemText>
                        </MenuItem>
                      ]
                    ) : (
                      <MenuItem onClick={() => { handleFlagJob(); handleCloseMenu(); }}>
                        <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Flag for Review</ListItemText>
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              About the Role
            </Typography>
            <Typography variant="body1" gutterBottom color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
              {job.description}
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Requirements
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
              {job.requirements}
            </Typography>

            <Divider sx={{ my: 4 }} />

            {/* Forum Section */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Forum Discussion
            </Typography>
            
            {!isLoggedIn ? (
              <>
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  Sign in to join the discussion and see what other developers are saying about this role.
                </Alert>
              </>
            ) : (
              <Box sx={{ mt: 3 }}>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fcfcfc' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>{user?.fullName} (You)</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Ask a question or share an insight..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      variant="standard"
                      sx={{ mt: 1 }}
                      slotProps={{ input: { disableUnderline: true } }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        endIcon={<SendIcon />}
                        disabled={!comment.trim() || commentSubmitting}
                        onClick={handlePostComment}
                        sx={{ borderRadius: 1.5, boxShadow: 0 }}
                      >
                        Post
                      </Button>
                    </Box>
                  </Paper>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100, borderRadius: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  LOCATION
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{job.locationCity}, {job.locationCountry} ({job.workType})</Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  JOB TYPE
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatJobType(job.jobType)}</Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  POSTED ON
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{new Date(job.createdAt).toLocaleDateString()}</Typography>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  EMPLOYER CONTACT
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{job.posterName}</Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>{job.contactEmail}</Typography>
              </Box>

              <Divider />

              {job.isPeerSourced ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  component="a"
                  href={job.sourceUrl}
                  target="_blank"
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
                >
                  Apply on External Site
                </Button>
              ) : isLoggedIn ? (
                user?.role === 'DEVELOPER' && (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setApplyOpen(true)}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
                  >
                    Apply for this Role
                  </Button>
                )
              ) : (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    component={Link}
                    href="/register"
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 0 }}
                  >
                    Sign up to Apply
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Registration is required to submit applications and vote.
                  </Typography>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <ApplyDialog
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        job={job}
        onSuccess={() => {
          alert('Application submitted successfully!');
          router.push('/jobs/my-applications');
        }}
      />
    </Container>
  );
}

