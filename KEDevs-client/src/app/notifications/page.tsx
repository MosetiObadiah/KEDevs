// src/app/notifications/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PaymentIcon from '@mui/icons-material/Payment';
import MessageIcon from '@mui/icons-material/Message';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircleIcon from '@mui/icons-material/Circle';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import { notificationService } from '@/services/notificationService';

const getIcon = (type: string) => {
  switch (type) {
    case 'ApplicationUpdate': return <WorkIcon />;
    case 'Upvote': return <ThumbUpIcon />;
    case 'Payment': return <PaymentIcon />;
    case 'Message': return <MessageIcon />;
    case 'Verification': return <VerifiedIcon />;
    case 'ContactRequest': return <GroupIcon />;
    case 'SpotlightExpiry': return <SpeedIcon />;
    default: return <CircleIcon />;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'ApplicationUpdate': return 'primary.main';
    case 'Upvote': return 'warning.main';
    case 'Payment': return 'success.main';
    case 'Verification': return 'info.main';
    case 'ContactRequest': return 'secondary.main';
    case 'SpotlightExpiry': return 'error.main';
    default: return 'text.secondary';
  }
};

export default function NotificationsPage() {
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data.content || response.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const response = await notificationService.markAllRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (tab === 0) return true;
    if (tab === 1) return n.type === 'ApplicationUpdate';
    if (tab === 2) return n.type === 'Upvote' || n.type === 'ContactRequest';
    if (tab === 3) return n.type === 'Payment' || n.type === 'Verification' || n.type === 'SpotlightExpiry';
    return true;
  });

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Notifications
        </Typography>
        <Button onClick={markAllRead} size="small" sx={{ fontWeight: 700 }}>Mark all as read</Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" sx={{ fontWeight: 700 }} />
          <Tab label="Jobs" sx={{ fontWeight: 700 }} />
          <Tab label="Social" sx={{ fontWeight: 700 }} />
          <Tab label="System" sx={{ fontWeight: 700 }} />
        </Tabs>

        {isLoading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, px: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n, index) => (
                <React.Fragment key={n.id}>
                  <ListItem 
                    sx={{ 
                      py: 3, 
                      px: 3, 
                      bgcolor: n.isRead ? 'transparent' : 'rgba(0,0,0,0.02)',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                    secondaryAction={
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getColor(n.type), color: 'white' }}>
                        {getIcon(n.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: n.isRead ? 500 : 700 }}>
                            {n.title}
                          </Typography>
                          {!n.isRead && <CircleIcon sx={{ fontSize: 10, color: 'primary.main' }} />}
                        </Box>
                      }
                      secondary={
                        <Box component="div">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                          <Typography variant="caption" color="text.disabled">{new Date(n.date).toLocaleDateString()}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {n.type === 'ApplicationUpdate' && (
                              <Button variant="contained" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>View Job</Button>
                            )}
                            {n.type === 'ContactRequest' && (
                              <>
                                <Button variant="contained" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Accept</Button>
                                <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Decline</Button>
                              </>
                            )}
                            {n.type === 'SpotlightExpiry' && (
                              <Button variant="contained" color="warning" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }} component={Link} href="/payments">
                                Buy Spotlight Again
                              </Button>
                            )}
                            {n.type === 'Verification' && (
                              <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }} component={Link} href="/verify">
                                View Status
                              </Button>
                            )}
                          </Box>
                        </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: 10, textAlign: 'center' }}>
                <Typography color="text.secondary">No notifications found.</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>

      <Paper sx={{ mt: 4, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Preferences</Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Email Notifications</Typography>
            <Chip label="On" size="small" color="success" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Push Notifications</Typography>
            <Chip label="On" size="small" color="success" variant="outlined" />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
