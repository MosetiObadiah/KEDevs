// src/app/admin/settings/page.tsx
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
  Button, 
  Stack, 
  Alert,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const settings = [
  { key: 'spotlight_day_fee', label: 'Spotlight Day Fee', value: '100', unit: 'KES' },
  { key: 'spotlight_week_fee', label: 'Spotlight Week Fee', value: '400', unit: 'KES' },
  { key: 'dev_badge_fee', label: 'Developer Badge Fee', value: '200', unit: 'KES' },
  { key: 'emp_badge_fee', label: 'Employer Badge Fee', value: '400', unit: 'KES' },
  { key: 'hiring_assist_fee', label: 'Hiring Assist Fee', value: '500', unit: 'KES' },
  { key: 'contact_limit', label: 'Contact Request Daily Limit', value: '10', unit: 'Requests' },
  { key: 'comment_edit_window', label: 'Comment Edit Window', value: '15', unit: 'Minutes' },
  { key: 'comment_delete_window', label: 'Comment Delete Window', value: '30', unit: 'Minutes' },
];

export default function PlatformSettings() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Platform <Box component="span" sx={{ color: 'primary.main' }}>Settings</Box></Typography>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        All changes to platform configuration are applied instantly and recorded in the audit log.
      </Alert>

      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>General Configuration</Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>SETTING</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>VALUE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>UNIT</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.key} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{s.label}</TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <TextField fullWidth size="small" defaultValue={s.value} />
                  </TableCell>
                  <TableCell>{s.unit}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<SaveIcon />} variant="outlined">Save</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>Reset to Defaults</Button>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>Save All Changes</Button>
        </Box>
      </Paper>
    </Box>
  );
}
