// src/app/admin/verification/page.tsx
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
  Modal,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const mockVerifications = [
  { id: 'v1', name: 'Jane Doe', type: 'DEVELOPER', status: 'Under Review', date: '2024-05-01', docs: ['National ID', 'Degree Cert'] },
  { id: 'v2', name: 'John Smith', type: 'DEVELOPER', status: 'Under Review', date: '2024-05-02', docs: ['Passport'] },
  { id: 'v3', name: 'TechFlow Solutions', type: 'EMPLOYER', status: 'Under Review', date: '2024-05-03', docs: ['Cert of Inc', 'KRA Pin'] },
];

export default function VerificationQueue() {
  const [tab, setTab] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const filtered = mockVerifications.filter(v => tab === 0 ? v.type === 'DEVELOPER' : v.type === 'EMPLOYER');

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Verification <Box component="span" sx={{ color: 'primary.main' }}>Queue</Box></Typography>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Developers" sx={{ fontWeight: 700 }} />
          <Tab label="Employers" sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>APPLICANT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DATE SUBMITTED</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DOCUMENTS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{req.name}</TableCell>
                    <TableCell>{req.date}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {req.docs.map(doc => <Chip key={doc} label={doc} size="small" variant="outlined" />)}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} size="small" color="warning" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          startIcon={<VisibilityIcon />} 
                          onClick={() => { setSelectedReq(req); setIsPreviewOpen(true); }}
                        >
                          View
                        </Button>
                        <IconButton color="success" size="small"><CheckIcon /></IconButton>
                        <IconButton color="error" size="small"><CloseIcon /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Document Viewer Modal */}
      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', height: '80%', bgcolor: 'background.paper', borderRadius: 4, p: 4,
          display: 'flex', flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Document Review: {selectedReq?.name}</Typography>
            <IconButton onClick={() => setIsPreviewOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">[ Document Preview Image/PDF Mock ]</Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="error" sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}>Reject with Reason</Button>
            <Button variant="contained" color="success" sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}>Approve Verification</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
