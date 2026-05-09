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
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SendIcon from '@mui/icons-material/Send';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';
import { forumService } from '@/services/forumService';
import ApplyDialog from '@/components/jobs/ApplyDialog';
import Forum from '@/components/forum/Forum';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobDetails(id as string);
        if (response.success) {
          setJob(response.data);
          setUpvoteCount(response.data.upvoteCount || 0);
          setIsUpvoted(response.data.currentUserVote === 'UPVOTE');
          setIsDownvoted(response.data.currentUserVote === 'DOWNVOTE');
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
          const raw = response.data;
          setComments(Array.isArray(raw) ? raw : raw?.content || []);
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
      toast.success('Job flagged for review.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to flag job.');
    }
  };

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isLoggedIn || !id) return;

    const originalUpvoted = isUpvoted;
    const originalDownvoted = isDownvoted;
    const originalCount = upvoteCount;

    // Optimistic UI update
    if (type === 'UPVOTE') {
      if (isUpvoted) {
        setIsUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      } else {
        setIsUpvoted(true);
        setUpvoteCount(prev => prev + (isDownvoted ? 1 : 1)); // This is simple toggle, backend handles real count
        // Wait, if it was downvoted, count increases by 1? No, upvoteCount usually just tracks upvotes.
        // If I toggle upvote on, count increases.
        setIsDownvoted(false);
      }
    } else {
      if (isDownvoted) {
        setIsDownvoted(false);
      } else {
        setIsDownvoted(true);
        if (isUpvoted) {
          setUpvoteCount(prev => prev - 1);
          setIsUpvoted(false);
        }
      }
    }

    try {
      await jobService.voteJob(id as string, type);
    } catch (err: any) {
      setIsUpvoted(originalUpvoted);
      setIsDownvoted(originalDownvoted);
      setUpvoteCount(originalCount);
      console.error(err);
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
                  {(() => {
                    const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                    if (isExpired) {
                      return <Chip label="Expired" size="small" color="error" sx={{ fontWeight: 800, borderRadius: 1.5 }} />;
                    }
                    if (job.status === 'OPEN') {
                      return <Chip label="Open" size="small" color="success" sx={{ fontWeight: 800, borderRadius: 1.5 }} />;
                    }
                    return <Chip label="Closed" size="small" color="default" sx={{ fontWeight: 800, borderRadius: 1.5 }} />;
                  })()}
                </Stack>
              </Box>
              
              {isLoggedIn && (
                <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                  <Tooltip title="Upvote">
                    <IconButton 
                      onClick={() => handleVote('UPVOTE')}
                      color={isUpvoted ? 'primary' : 'default'}
                      sx={{ bgcolor: isUpvoted ? 'primary.light' : 'background.subtle', '&:hover': { bgcolor: isUpvoted ? 'primary.light' : 'background.subtle' } }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Downvote">
                    <IconButton 
                      onClick={() => handleVote('DOWNVOTE')}
                      color={isDownvoted ? 'error' : 'default'}
                      sx={{ bgcolor: isDownvoted ? 'error.light' : 'background.subtle', '&:hover': { bgcolor: isDownvoted ? 'error.light' : 'background.subtle' } }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              
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
            <Box sx={{ mb: 4, pl: 1 }}>
              <Stack spacing={1.5}>
                {job.experienceLevel && (
                  <Typography variant="body1" color="text.secondary">
                    • <strong>Experience Level:</strong> {job.experienceLevel?.replace('_', ' ')}
                  </Typography>
                )}
                {job.minExperienceYears !== null && job.minExperienceYears !== undefined && (
                  <Typography variant="body1" color="text.secondary">
                    • <strong>Minimum Experience:</strong> {job.minExperienceYears} {job.minExperienceYears === 1 ? 'Year' : 'Years'}
                  </Typography>
                )}
                {job.minQualification && (
                  <Typography variant="body1" color="text.secondary">
                    • <strong>Minimum Qualification:</strong> {
                      job.minQualification === 'NONE' ? 'No Minimum Requirement' :
                      job.minQualification === 'HIGH_SCHOOL' ? 'High School Diploma' :
                      job.minQualification === 'CERTIFICATE' ? 'Professional Certificate' :
                      job.minQualification === 'DIPLOMA' ? 'Diploma' :
                      job.minQualification === 'ASSOCIATES' ? "Associate's Degree" :
                      job.minQualification === 'BACHELORS' ? "Bachelor's Degree" :
                      job.minQualification === 'MASTERS' ? "Master's Degree" :
                      job.minQualification === 'PHD' ? 'PhD' :
                      job.minQualification === 'SELF_TAUGHT' ? 'Self-Taught / Bootcamp' :
                      job.minQualification === 'EQUIVALENT_EXPERIENCE' ? 'Equivalent Work Experience' :
                      job.minQualification
                    }
                  </Typography>
                )}
                {job.requirements && (
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                    {job.requirements}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Forum Section */}
            <Forum 
              jobId={id as string} 
              initialComments={comments} 
              onRefresh={() => {
                const fetchComments = async () => {
                  if (!id) return;
                  try {
                    const response = await forumService.getJobComments(id as string);
                    if (response.success) {
                      const raw = response.data;
                      setComments(Array.isArray(raw) ? raw : raw?.content || []);
                    }
                  } catch (err: any) {
                    console.error(err);
                  }
                };
                fetchComments();
              }}
            />
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

              {job.applicationDeadline && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                    APPLICATION DEADLINE
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize="small" color="error" />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  EMPLOYER CONTACT
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{job.posterName}</Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>{job.contactEmail}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                  COMMUNITY RATING
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {upvoteCount} Upvotes
                </Typography>
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
                isPoster ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    disabled
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    You Posted This Job
                  </Button>
                ) : (
                  user?.role === 'DEVELOPER' && (
                    job.hasApplied ? (
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        size="large"
                        disabled
                        sx={{ 
                          py: 1.5, 
                          borderRadius: 2, 
                          fontWeight: 700, 
                          '&.Mui-disabled': { 
                            color: 'success.main', 
                            borderColor: 'success.light' 
                          } 
                        }}
                      >
                        Already Applied
                      </Button>
                    ) : (
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
                  )
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
          toast.success('Application submitted successfully! Redirecting...', {
            duration: 4000,
            icon: '🚀'
          });
          router.push('/jobs/my-applications');
        }}
      />
    </Container>
  );
}
