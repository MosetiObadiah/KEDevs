'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import { employerService } from '@/services/employerService';

export default function HiringPipeline() {
  const [tab, setTab] = useState(0);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookmarksRes, requestsRes] = await Promise.all([
        employerService.getBookmarks(),
        employerService.getContactRequests(),
      ]);
      if (bookmarksRes.success) setBookmarks(bookmarksRes.data.content || bookmarksRes.data || []);
      if (requestsRes.success) setRequests(requestsRes.data.content || requestsRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveBookmark = async (developerId: string) => {
    try {
      await employerService.removeBookmark(developerId);
      setBookmarks((prev) => prev.filter((item) => item.developerId !== developerId && item.id !== developerId));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRespondRequest = async (requestId: string, status: string) => {
    try {
      await employerService.respondContactRequest(requestId, { status });
      loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        Hiring <Box component="span" sx={{ color: 'primary.main' }}>Pipeline</Box>
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track your bookmarked talent and active outreach.
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Bookmarked Developers" sx={{ fontWeight: 700 }} />
          <Tab label="Contact Requests" sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : tab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#fcfcfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>DEVELOPER</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ROLE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookmarks.length > 0 ? bookmarks.map((bookmark) => (
                    <TableRow key={bookmark.id || bookmark.developerId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>{bookmark.developerName?.charAt(0) || bookmark.fullName?.charAt(0) || 'D'}</Avatar>
                          <Typography variant="subtitle2" component={Link} href={`/developers/${bookmark.developerId || bookmark.id}`} sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
                            {bookmark.developerName || bookmark.fullName || 'Developer'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{bookmark.role || bookmark.currentRole || 'Developer'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button variant="contained" size="small" startIcon={<SendIcon />} component={Link} href={`/developers/${bookmark.developerId || bookmark.id}`} sx={{ borderRadius: 1.5 }}>Request</Button>
                          <Tooltip title="Remove Bookmark">
                            <IconButton color="error" onClick={() => handleRemoveBookmark(bookmark.developerId || bookmark.id)}><DeleteIcon /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}>No bookmarks yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#fcfcfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>DEVELOPER</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>JOB REQUEST</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">CONTACT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length > 0 ? requests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{req.developerName || req.fullName || 'Developer'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(req.createdAt || req.date || '').toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>{req.jobTitle || req.position || 'Job Request'}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status || 'Pending'}
                          size="small"
                          color={req.status === 'Accepted' ? 'success' : req.status === 'Declined' ? 'error' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {req.status === 'Accepted' ? (
                          <Button variant="outlined" size="small" startIcon={<EmailIcon />} component="a" href={`mailto:${req.email || ''}`}>
                            Email Developer
                          </Button>
                        ) : (
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="contained" size="small" onClick={() => handleRespondRequest(req.id, 'Accepted')}>
                              Accept
                            </Button>
                            <Button variant="outlined" size="small" onClick={() => handleRespondRequest(req.id, 'Declined')}>
                              Decline
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6 }}>No contact requests yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
