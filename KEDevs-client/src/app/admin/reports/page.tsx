// src/app/admin/reports/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid, 
  Stack, 
  Button, 
  TextField, 
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const reportTabs = [
  'User Report', 'Revenue Report', 'Jobs Report', 'Applications Report', 
  'Verification Report', 'Flags Report', 'Spotlight Report', 'Audit Log Report'
];

export default function PlatformReports() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Platform <Box component="span" sx={{ color: 'primary.main' }}>Reports</Box></Typography>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {reportTabs.map((label, index) => (
            <Tab key={label} label={label} sx={{ fontWeight: 700 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 4 }}>
          {/* Controls */}
          <Grid container spacing={3} sx={{ mb: 4, alignItems: 'flex-end' }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth select label="Date Range" defaultValue="last30">
                <MenuItem value="last7">Last 7 Days</MenuItem>
                <MenuItem value="last30">Last 30 Days</MenuItem>
                <MenuItem value="last90">Last 90 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button variant="contained" fullWidth size="large" sx={{ height: 56, borderRadius: 2, fontWeight: 700 }}>Generate Report</Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<PrintIcon />} sx={{ borderRadius: 2 }}>Print</Button>
                <Button variant="outlined" startIcon={<PictureAsPdfIcon />} color="error" sx={{ borderRadius: 2 }}>Export PDF</Button>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Report Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[1, 2, 3, 4].map(i => (
              <Grid size={{ xs: 12, sm: 3 }} key={i}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>METRIC {i}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{Math.floor(Math.random() * 1000)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Report Table Mock */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Data Summary</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>VALUE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>GROWTH</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i}>
                    <TableCell>2024-05-0{i}</TableCell>
                    <TableCell>Active Items</TableCell>
                    <TableCell>{Math.floor(Math.random() * 500)}</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>+{Math.floor(Math.random() * 20)}%</TableCell>
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
