'use client';
import React, { useEffect, useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DoneAll as DoneAllIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { notificationService } from '@/services/notificationService';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMarkAllAsRead?: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  onClose,
  onMarkAllAsRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(0, 5);
      if (response.success) {
        setNotifications(response.data.content);
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
      if (onMarkAllAsRead) onMarkAllAsRead(); // Refresh count in parent
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onMarkAllAsRead) onMarkAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 500,
          borderRadius: 3,
          mt: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
          Notifications
        </Typography>
        <Button
          size="small"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
          sx={{ fontWeight: 700, textTransform: 'none' }}
        >
          Mark all as read
        </Button>
      </Box>
      <Divider />

      <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((n) => (
              <React.Fragment key={n.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  onClick={() => {
                    handleMarkAsRead(n.id);
                    // Optionally navigate based on metadata
                  }}
                >
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color="primary"
                      invisible={n.isRead}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <NotificationsIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </Badge>
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: n.isRead ? 600 : 800 }}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5, lineHeight: 1.4 }}
                        >
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          onClick={() => {
            router.push('/notifications');
            onClose();
          }}
          sx={{ fontWeight: 700, textTransform: 'none' }}
        >
          See all notifications
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
