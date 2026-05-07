// src/app/admin/audit/page.tsx
'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  InputAdornment, 
  Chip,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';

const mockLogs = [
  { id: 'l1', admin: 'Admin User', action: 'Approved Employer', target: 'TechFlow Solutions', date: '2024-05-06 14:20:12', ip: '192.168.1.1' },
  { id: 'l2', admin: 'Admin User', action: 'Update Setting', target: 'spotlight_day_fee: 100 -> 150', date: '2024-05-06 10:05:45', ip: '192.168.1.1' },
  { id: 'l3', admin: 'Admin User', action: 'Suspended User', target: 'Troll123', date: '2024-05-05 16:45:30', ip: '192.168.1.1' },
  { id: 'l4', admin: 'Admin User', action: 'Deleted Comment', target: 'Comment ID: 8942', date: '2024-05-05 09:12:11', ip: '192.168.1.1' },
];

export default function AuditLog() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Audit <Box component="span" sx={{ color: 'primary.main' }}>Log</Box></Typography>
        <Button variant="outlined" startIcon={<PrintIcon />} sx={{ borderRadius: 2 }}>Print Log</Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <TextField 
          fullWidth 
          placeholder="Filter logs by admin, action, or target..." 
          variant="outlined" 
          size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          sx={{ mb: 3 }}
        />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>TIMESTAMP</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ADMIN</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ACTION</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>TARGET / CHANGE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP ADDRESS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{log.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{log.admin}</TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{log.target}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
