// src/app/jobs/[id]/applications/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Stack,
} from '@mui/material';
import { jobs, developers } from '@/data/mockData';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock applicants
const mockApplicants = [
  { id: 'app1', developerId: 'd1', name: 'Jane Doe', role: 'Senior Frontend Engineer', date: '2024-05-02', status: 'Reviewed' },
  { id: 'app2', developerId: 'd2', name: 'John Smith', role: 'DevOps Engineer', date: '2024-05-04', status: 'Pending' },
  { id: 'app3', developerId: 'd1', name: 'Alice W.', role: 'Backend Developer', date: '2024-05-05', status: 'Pending' },
];

export default function ApplicationsInbox() {
  const { id } = useParams();
  const router = useRouter();
  const job = jobs.find(j => j.id === id);
  const [applicants, setApplicants] = useState(mockApplicants);

  const handleStatusChange = (appId: string, newStatus: string) => {
    setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
  };

  if (!job) return <Typography>Job not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/jobs/my-posts" style={{ textDecoration: 'none', color: 'inherit' }}>My Posts</Link>
        <Typography color="text.primary">Applications</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Applicants for <Box component="span" sx={{ color: 'primary.main' }}>{job.title}</Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your hiring pipeline for this position.
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#fcfcfc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>APPLICANT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>APPLIED DATE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.map((app) => (
              <TableRow key={app.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{app.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        component={Link} 
                        href={`/developers/${app.developerId}`}
                        sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                      >
                        {app.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{app.role}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={app.status} 
                    size="small"
                    color={app.status === 'Accepted' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Accept Application">
                      <IconButton 
                        color="success" 
                        onClick={() => handleStatusChange(app.id, 'Accepted')}
                        disabled={app.status === 'Accepted'}
                        sx={{ bgcolor: '#e8f5e9' }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject Application">
                      <IconButton 
                        color="error" 
                        onClick={() => handleStatusChange(app.id, 'Rejected')}
                        disabled={app.status === 'Rejected'}
                        sx={{ bgcolor: '#ffebee' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
