// src/app/admin/spotlight/page.tsx
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
  Chip, 
  Button, 
  Stack, 
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const mockSlots = [
  { id: 's1', name: 'John Smith', role: 'DevOps Engineer', type: 'Week', status: 'Active', expires: '2024-05-15' },
  { id: 's2', name: 'Jane Doe', role: 'Frontend Engineer', type: 'Day', status: 'Active', expires: '2024-05-08' },
  { id: 's3', name: 'Alice W.', role: 'Product Designer', type: 'Day', status: 'Expired', expires: '2024-05-01' },
];

export default function SpotlightManagement() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Spotlight <Box component="span" sx={{ color: 'primary.main' }}>Management</Box></Typography>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Active & Recent Slots</Typography>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>Add Manual Slot</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>DEVELOPER</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SLOT TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>EXPIRES AT</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSlots.map((slot) => (
                <TableRow key={slot.id} hover sx={{ bgcolor: slot.status === 'Active' ? 'rgba(0,166,81,0.03)' : 'inherit' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{slot.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{slot.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{slot.role}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={slot.type} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    <Chip label={slot.status} size="small" color={slot.status === 'Active' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{slot.expires}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit Slot">
                        <IconButton size="small"><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Override">
                        <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
