// src/app/admin/flags/page.tsx
'use client';

import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import GavelIcon from '@mui/icons-material/Gavel';

const mockFlags = {
  jobs: [
    { id: 'f1', target: 'Junior React Dev', reason: 'Spam / Misleading', reporter: 'User A', date: '2024-05-04', author: '' },
  ],
  users: [
    { id: 'f2', target: 'Bad Actor', reason: 'Harassment', reporter: 'User B', date: '2024-05-05', author: '' },
  ],
  comments: [
    { id: 'f3', target: 'This job is a scam...', author: 'Troll123', reason: 'Toxic behavior', reporter: 'User C', date: '2024-05-06' },
  ]
};

export default function FlaggedContent() {
  const [tab, setTab] = useState(0);

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
                {(tab === 0 ? mockFlags.jobs : tab === 1 ? mockFlags.users : mockFlags.comments).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{item.target}</Typography>
                      {tab === 2 && <Typography variant="caption" color="text.secondary">Author: {item.author}</Typography>}
                    </TableCell>
                    <TableCell><Chip label={item.reason} size="small" color="error" variant="outlined" /></TableCell>
                    <TableCell>{item.reporter}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton size="small"><VisibilityIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss Flag">
                          <IconButton size="small" color="success"><CheckIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Take Action">
                          <IconButton size="small" color="error"><GavelIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Content">
                          <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}
