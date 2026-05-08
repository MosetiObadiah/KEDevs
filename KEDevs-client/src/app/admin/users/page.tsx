// src/app/admin/users/page.tsx
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
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Drawer,
  Stack,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import { adminService } from '@/services/adminService';

export default function UserManagement() {
  const [tab, setTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, pendingResponse] = await Promise.all([
        adminService.getUsers({ page: 0, size: 50 }),
        adminService.getPendingEmployers(0, 50),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.content || []);
      }
      if (pendingResponse.success) {
        setPendingEmployers(pendingResponse.data.content || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApproveEmployer = async (profileId: string) => {
    try {
      await adminService.approveEmployer(profileId, { approved: true });
      setPendingEmployers((prev) => prev.filter((item) => item.id !== profileId));
      fetchUsers();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRejectEmployer = async (profileId: string) => {
    try {
      await adminService.approveEmployer(profileId, { approved: false, reason: 'Profile does not meet criteria' });
      setPendingEmployers((prev) => prev.filter((item) => item.id !== profileId));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await adminService.performUserAction(userId, action, 'Action taken via admin dashboard');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGrantBadge = async (userId: string) => {
    try {
      await adminService.grantBadge(userId, true);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>User <Box component="span" sx={{ color: 'primary.main' }}>Management</Box></Typography>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Users" sx={{ fontWeight: 700 }} />
          <Tab label={`Pending Employers (${pendingEmployers.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ mb: 3 }}
          />

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
                    <TableCell sx={{ fontWeight: 700 }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>VERIFIED</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(tab === 0 ? filteredUsers : pendingEmployers).map((user) => (
                    <TableRow key={user.id} hover onClick={() => setSelectedUser(user)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>{user.fullName?.charAt(0) || user.email?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.fullName || user.email}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'EMPLOYER' ? (user.isApproved ? 'Approved' : 'Pending') : 'Active'}
                          size="small"
                          color={user.role === 'EMPLOYER' ? (user.isApproved ? 'success' : 'warning') : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? <CheckCircleIcon color="primary" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                      </TableCell>
                      <TableCell align="right">
                        {tab === 1 ? (
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); handleApproveEmployer(user.id); }}>Approve</Button>
                            <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); handleRejectEmployer(user.id); }}>Reject</Button>
                          </Stack>
                        ) : (
                          <IconButton onClick={(e) => e.stopPropagation()}><MoreVertIcon /></IconButton>
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

      <Drawer anchor="right" open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <Box sx={{ width: 400, p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>User Details</Typography>
          {selectedUser && (
            <Stack spacing={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>{selectedUser.fullName?.charAt(0) || selectedUser.email?.charAt(0)}</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedUser.fullName || selectedUser.email}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedUser.role}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Info</Typography>
                <Typography variant="body2"><strong>ID:</strong> {selectedUser.id}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedUser.role}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedUser.email}</Typography>
                <Typography variant="body2"><strong>Joined:</strong> {new Date(selectedUser.createdAt || selectedUser.joinedAt || Date.now()).toLocaleDateString()}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Admin Actions</Typography>
                <Stack spacing={1.5}>
                  <Button variant="outlined" startIcon={<WarningIcon />} color="warning" fullWidth sx={{ borderRadius: 2 }} onClick={() => handleUserAction(selectedUser.id, 'WARN')}>
                    Warn User
                  </Button>
                  <Button variant="outlined" startIcon={<CancelIcon />} color="error" fullWidth sx={{ borderRadius: 2 }} onClick={() => handleUserAction(selectedUser.id, 'BAN')}>
                    Suspend Account
                  </Button>
                  <Button variant="outlined" startIcon={<CheckCircleIcon />} color="primary" fullWidth sx={{ borderRadius: 2 }} onClick={() => handleGrantBadge(selectedUser.id)}>
                    Grant Verified Badge
                  </Button>
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
