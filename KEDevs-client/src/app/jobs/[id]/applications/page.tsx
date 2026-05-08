// src/app/jobs/[id]/applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { jobService } from '@/services/jobService';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LaunchIcon from '@mui/icons-material/Launch';

const statusColors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  'PENDING': 'warning',
  'VIEWED': 'info',
  'SHORTLISTED': 'success',
  'REJECTED': 'error',
};

const statusLabels: Record<string, string> = {
  'PENDING': 'Pending',
  'VIEWED': 'Under Review',
  'SHORTLISTED': 'Accepted',
  'REJECTED': 'Rejected',
};

export default function ApplicationsInbox() {
  const { id } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobAndApplications = async () => {
    if (!id) return;
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobService.getJobDetails(id as string),
        jobService.getJobApplications(id as string),
      ]);

      if (jobRes.success) {
        setJob(jobRes.data);
      }
      if (appsRes.success) {
        setApplicants(appsRes.data?.content || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await jobService.updateApplicationStatus(id as string, appId, newStatus);
      if (res.success) {
        // Refresh local applicants list
        setApplicants((prev: any[]) => prev.map((app: any) => app.id === appId ? { ...app, status: newStatus } : app));
        if (selectedApplicant && selectedApplicant.id === appId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Job post not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/jobs/my-posts')} sx={{ mt: 3 }}>
          Back to My Posts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/jobs/my-posts" style={{ textDecoration: 'none', color: 'inherit' }}>My Posts</Link>
        <Typography color="text.primary">Applications</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push('/jobs/my-posts')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Applicants for <Box component="span" sx={{ color: 'primary.main' }}>{job.title}</Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your hiring pipeline for this position.
          </Typography>
        </Box>
      </Box>

      {applicants.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'background.subtle' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>APPLICANT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>EMAIL ADDRESS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>APPLIED DATE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.map((app) => (
                <TableRow 
                  key={app.id} 
                  hover 
                  onClick={() => setSelectedApplicant(app)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{app.applicantName?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {app.applicantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Applicant</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{app.applicantEmail}</TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Chip 
                      label={statusLabels[app.status] || app.status} 
                      size="small"
                      color={statusColors[app.status] || 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Accept Candidate">
                        <IconButton 
                          color="success" 
                          onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                          disabled={app.status === 'SHORTLISTED' || actionLoading}
                          sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Candidate">
                        <IconButton 
                          color="error" 
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          disabled={app.status === 'REJECTED' || actionLoading}
                          sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ textAlign: 'center', py: 10, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No applications received for this job post yet.
          </Typography>
        </Paper>
      )}

      {/* Applicant Review Modal */}
      <Dialog 
        open={Boolean(selectedApplicant)} 
        onClose={() => setSelectedApplicant(null)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 1 } }}
      >
        {selectedApplicant && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
              Review Application
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.5rem', fontWeight: 700 }}>
                    {selectedApplicant.applicantName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedApplicant.applicantName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedApplicant.applicantEmail}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>APPLIED ON</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedApplicant.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>STATUS</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={statusLabels[selectedApplicant.status] || selectedApplicant.status} 
                        size="small"
                        color={statusColors[selectedApplicant.status] || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
                    COVER LETTER
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, borderRadius: 2, bgcolor: 'background.subtle', minHeight: '100px', whiteSpace: 'pre-wrap' }}
                  >
                    {selectedApplicant.coverLetter || "No cover letter submitted."}
                  </Paper>
                </Box>

                <Button
                  variant="outlined"
                  component={Link}
                  href={`/developers/${selectedApplicant.applicantId}`}
                  target="_blank"
                  startIcon={<LaunchIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
                >
                  View Full Developer Profile
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => setSelectedApplicant(null)} 
                color="inherit" 
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Close
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                color="error"
                disabled={selectedApplicant.status === 'REJECTED' || actionLoading}
                onClick={() => handleStatusChange(selectedApplicant.id, 'REJECTED')}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={selectedApplicant.status === 'SHORTLISTED' || actionLoading}
                onClick={() => handleStatusChange(selectedApplicant.id, 'SHORTLISTED')}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                Accept
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
