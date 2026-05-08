// src/app/admin/flags/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Button, 
  Stack, 
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import GavelIcon from '@mui/icons-material/Gavel';
import { adminService } from '@/services/adminService';

export default function FlaggedContent() {
  const [tab, setTab] = useState(0);
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = tab === 0
        ? await adminService.getFlaggedJobs()
        : tab === 1
          ? await adminService.getFlaggedUsers()
          : await adminService.getFlaggedComments();

      if (response.success) {
        setFlags(response.data.content || []);
      }
    } catch (err: any) {
      setError('Failed to load flagged items.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [tab]);

  const handleReview = async (flagId: string, action: string) => {
    try {
      if (tab === 0) {
        await adminService.reviewJobFlag(flagId, { action });
      } else if (tab === 1) {
        await adminService.reviewUserFlag(flagId, { action });
      } else {
        await adminService.reviewCommentFlag(flagId, { action });
      }
      setFlags((prev) => prev.filter((item) => item.id !== flagId));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Flagged <Box component="span" sx={{ color: 'primary.main' }}>Content</Box></Typography>

      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, fontWeight: 500 }}>
        Please review flagged items carefully. Actions taken here are logged in the audit trail.
      </Alert>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Flagged Jobs" sx={{ fontWeight: 700 }} />
          <Tab label="Flagged Users" sx={{ fontWeight: 700 }} />
          <Tab label="Flagged Comments" sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>CONTENT / TARGET</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>REASON</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>REPORTER</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flags.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{item.target || item.commentText || item.description || 'Flagged item'}</Typography>
                        {tab === 2 && <Typography variant="caption" color="text.secondary">Author: {item.author || item.reporter || 'Unknown'}</Typography>}
                      </TableCell>
                      <TableCell><Chip label={item.reason || item.flagReason || 'Review required'} size="small" color="error" variant="outlined" /></TableCell>
                      <TableCell>{item.reporter || item.reportedBy || 'System'}</TableCell>
                      <TableCell>{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small"><VisibilityIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Approve" >
                            <IconButton size="small" color="success" onClick={() => handleReview(item.id, 'APPROVE')}><CheckIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="warning" onClick={() => handleReview(item.id, 'REJECT')}><GavelIcon /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
