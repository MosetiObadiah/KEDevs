// src/app/hiring-assist/pipeline/page.tsx
'use client';

import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import { developers } from '@/data/mockData';

const mockBookmarks = developers.filter(d => d.userType === 'DEVELOPER').slice(0, 2);
const mockRequests = [
  { id: 'r1', devName: 'Jane Doe', jobTitle: 'Senior Frontend Engineer', status: 'Accepted', date: '2024-05-02', email: 'jane.doe@example.com' },
  { id: 'r2', devName: 'John Smith', jobTitle: 'Senior Frontend Engineer', status: 'Pending', date: '2024-05-04' },
  { id: 'r3', devName: 'Alice W.', jobTitle: 'Product Designer', status: 'Declined', date: '2024-05-05' },
];

export default function HiringPipeline() {
  const [tab, setTab] = useState(0);

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

        <Box sx={{ p: 0 }}>
          {tab === 0 && (
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
                  {mockBookmarks.map((dev) => (
                    <TableRow key={dev.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>{dev.name.charAt(0)}</Avatar>
                          <Typography variant="subtitle2" component={Link} href={`/developers/${dev.id}`} sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
                            {dev.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{dev.role}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button variant="contained" size="small" startIcon={<SendIcon />} sx={{ borderRadius: 1.5 }}>Request</Button>
                          <Tooltip title="Remove Bookmark">
                            <IconButton color="error"><DeleteIcon /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mockBookmarks.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}>No bookmarks yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
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
                  {mockRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{req.devName}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.date}</Typography>
                      </TableCell>
                      <TableCell>{req.jobTitle}</TableCell>
                      <TableCell>
                        <Chip 
                          label={req.status} 
                          size="small" 
                          color={req.status === 'Accepted' ? 'success' : req.status === 'Declined' ? 'error' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {req.status === 'Accepted' ? (
                          <Button variant="outlined" size="small" startIcon={<EmailIcon />} component="a" href={`mailto:${req.email}`}>
                            Email Developer
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Revealed on acceptance</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
