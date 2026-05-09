'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page + 1 : 0;
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(currentPage, 20);
      if (response.success) {
        const newNotifications = response.data.content;
        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setPage(currentPage);
        } else {
          setNotifications(newNotifications);
          setPage(0);
        }
        setHasMore(!response.data.last);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'JOB': return 'primary';
      case 'PAYMENT': return 'success';
      case 'ADMIN': return 'error';
      case 'ENDORSEMENT': return 'secondary';
      case 'SPOTLIGHT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            Stay updated with your activities and opportunities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Notification Settings">
            <IconButton onClick={() => router.push('/settings/notifications')}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, py: 2, bgcolor: 'background.subtle', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Recent Activity
          </Typography>
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.isRead)}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Mark all as read
          </Button>
        </Box>
        <Divider />

        {loading && notifications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'background.subtle',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              You don't have any notifications at the moment.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((n, index) => (
              <React.Fragment key={n.id}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 2.5,
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.selected' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <Box sx={{ mr: 2.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: n.isRead ? 'background.subtle' : 'primary.main',
                        color: n.isRead ? 'text.secondary' : 'primary.contrastText',
                        width: 48,
                        height: 48,
                      }}
                    >
                      <NotificationsIcon />
                    </Avatar>
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: n.isRead ? 700 : 900 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mb: 1.5, opacity: 0.8, lineHeight: 1.6, fontWeight: 500 }}
                        >
                          {n.message}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={n.category}
                            size="small"
                            color={getCategoryColor(n.category) as any}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                          />
                          {!n.isRead && (
                            <Chip
                              label="NEW"
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 900, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {hasMore && (
          <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={() => fetchNotifications(true)}
              disabled={loading}
              sx={{ fontWeight: 800 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Load More'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
