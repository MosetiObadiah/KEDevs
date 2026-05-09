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
  TextField,
  Collapse,
} from '@mui/material';
import { jobService } from '@/services/jobService';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LaunchIcon from '@mui/icons-material/Launch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MessageIcon from '@mui/icons-material/Message';
import DownloadIcon from '@mui/icons-material/Download';
import toast from 'react-hot-toast';

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
  const [employerMessage, setEmployerMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

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

  const handleStatusChange = async (appId: string, newStatus: string, message?: string) => {
    setActionLoading(true);
    try {
      const res = await jobService.updateApplicationStatus(id as string, appId, newStatus, message);
      if (res.success) {
        const label = newStatus === 'SHORTLISTED' ? 'accepted' : newStatus === 'REJECTED' ? 'rejected' : 'updated';
        toast.success(`Applicant ${label} successfully.`);
        setApplicants((prev: any[]) => prev.map((app: any) => app.id === appId ? { ...app, status: newStatus } : app));
        if (selectedApplicant && selectedApplicant.id === appId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus }));
        }
        // Close modal after accept/reject
        if (newStatus === 'SHORTLISTED' || newStatus === 'REJECTED') {
          setSelectedApplicant(null);
          setEmployerMessage('');
          setShowMessageBox(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.click();
  };

  const openModal = (app: any) => {
    setSelectedApplicant(app);
    setEmployerMessage('');
    setShowMessageBox(false);
    // Mark as VIEWED if still PENDING
    if (app.status === 'PENDING') {
      handleStatusChange(app.id, 'VIEWED');
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
            {applicants.length} application{applicants.length !== 1 ? 's' : ''} received
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
                  onClick={() => openModal(app)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{app.applicantName?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {app.applicantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Developer</Typography>
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
                          onClick={() => { openModal(app); setShowMessageBox(true); }}
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
        onClose={() => { setSelectedApplicant(null); setEmployerMessage(''); setShowMessageBox(false); }}
        maxWidth="md"
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

                {/* Applicant Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.5rem', fontWeight: 700 }}>
                    {selectedApplicant.applicantName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedApplicant.applicantName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedApplicant.applicantEmail}
                    </Typography>
                  </Box>
                  <Chip 
                    label={statusLabels[selectedApplicant.status] || selectedApplicant.status}
                    color={statusColors[selectedApplicant.status] || 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>APPLIED ON</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedApplicant.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Resume Section */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      RESUME / CV
                    </Typography>
                    {selectedApplicant.resumeUrl ? (
                      <Tooltip title="Download Resume">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon fontSize="small" />}
                          onClick={() => openDownload(selectedApplicant.resumeUrl, `Resume_${selectedApplicant.applicantName.replace(/\s+/g, '_')}`)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Download
                        </Button>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Not available</Typography>
                    )}
                  </Box>
                  {selectedApplicant.resumeUrl ? (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.subtle' }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, fontSize: '0.6rem' }}>PDF</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Resume / CV File</Typography>
                        <Typography variant="caption" color="text.secondary">Click Download to view or save the file</Typography>
                      </Box>
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                      No resume uploaded.
                    </Typography>
                  )}
                </Box>

                <Divider />

                {/* Cover Letter Section */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      COVER LETTER
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {selectedApplicant.coverLetterUrl && (
                        <Tooltip title="Download Cover Letter file">
                          <IconButton size="small" onClick={() => openDownload(selectedApplicant.coverLetterUrl, `Cover_Letter_${selectedApplicant.applicantName.replace(/\s+/g, '_')}`)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {selectedApplicant.coverLetter && (
                        <Tooltip title="Copy to clipboard">
                          <IconButton size="small" onClick={() => handleCopy(selectedApplicant.coverLetter)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      bgcolor: 'background.subtle', 
                      minHeight: '120px', 
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedApplicant.coverLetter || 
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No written cover letter provided.
                      </Typography>
                    }
                  </Paper>
                </Box>

                {/* View Profile Button */}
                {selectedApplicant.applicantProfileId ? (
                  <Button
                    variant="outlined"
                    component={Link}
                    href={`/developers/${selectedApplicant.applicantProfileId}`}
                    target="_blank"
                    startIcon={<LaunchIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
                  >
                    View Full Developer Profile
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Developer profile not available.
                  </Typography>
                )}

                {/* Employer Message Section (for accepting) */}
                <Collapse in={showMessageBox}>
                  <Box sx={{ p: 2.5, bgcolor: 'success.light', borderRadius: 2, border: '1px solid', borderColor: 'success.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <MessageIcon color="success" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                        Add a message (optional)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      This message will be included in the notification sent to the developer.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="e.g. Congratulations! We'd love to schedule an interview. Please reply to this notification or email us at..."
                      value={employerMessage}
                      onChange={(e) => setEmployerMessage(e.target.value)}
                      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    />
                  </Box>
                </Collapse>

              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button 
                onClick={() => { setSelectedApplicant(null); setEmployerMessage(''); setShowMessageBox(false); }} 
                color="inherit" 
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Close
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                color="error"
                disabled={selectedApplicant.status === 'REJECTED' || actionLoading}
                onClick={() => handleStatusChange(selectedApplicant.id, 'REJECTED')}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Reject'}
              </Button>

              {!showMessageBox ? (
                <Button
                  variant="contained"
                  color="success"
                  disabled={selectedApplicant.status === 'SHORTLISTED' || actionLoading}
                  onClick={() => setShowMessageBox(true)}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                >
                  Accept ✓
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedApplicant.id, 'SHORTLISTED', employerMessage)}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                >
                  {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm & Notify Developer'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
