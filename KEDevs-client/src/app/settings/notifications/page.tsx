'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  NotificationsActive as NotificationsIcon,
  Email as EmailIcon,
  AppRegistration as AppIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';

const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await notificationService.getPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await notificationService.updatePreferences(preferences);
      if (response.success) {
        setSnackbar({ open: true, message: 'Preferences updated successfully', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update preferences', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sections = [
    {
      title: 'Email Notifications',
      description: 'Choose which updates you want to receive via email',
      icon: <EmailIcon sx={{ color: 'primary.main' }} />,
      items: [
        { key: 'emailOnPaymentReceipt', label: 'Payment Receipts', desc: 'Get an email for every successful payment' },
        { key: 'emailOnJobApplication', label: 'Job Applications', desc: 'Notify me when someone applies to my job' },
        { key: 'emailOnJobFlagged', label: 'Content Flags', desc: 'Notify me if my job post is flagged for review' },
        { key: 'emailOnSubscriptionExpiry', label: 'Subscription Alerts', desc: 'Alert me before my subscription expires' },
        { key: 'emailOnSpotlightExpired', label: 'Spotlight Updates', desc: 'Notify me when my spotlight slot ends' },
        { key: 'emailOnVerifiedBadge', label: 'Verification Status', desc: 'Updates on your verified badge application' },
      ],
    },
    {
      title: 'In-App Notifications',
      description: 'Control the alerts you see while browsing KEDevs',
      icon: <AppIcon sx={{ color: 'secondary.main' }} />,
      items: [
        { key: 'inAppOnJobApplication', label: 'Applications', desc: 'Show alert for new job applications' },
        { key: 'inAppOnCommentReply', label: 'Community Replies', desc: 'Notify me of replies to my forum comments' },
        { key: 'inAppOnEndorsement', label: 'Endorsements', desc: 'Show alert when someone endorses my profile' },
        { key: 'inAppOnFlagReviewed', label: 'Review Updates', desc: 'Notify me when an admin reviews my flagged content' },
        { key: 'inAppOnSpotlightExpired', label: 'Spotlight Status', desc: 'Show alert when spotlight slot expires' },
      ],
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          Notification Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Manage how and when you receive updates from the platform
        </Typography>
      </Box>

      {sections.map((section, sIdx) => (
        <Paper
          key={sIdx}
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.subtle' }}>
            {section.icon}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {section.description}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ p: 0 }}>
            {section.items.map((item, iIdx) => (
              <React.Fragment key={item.key}>
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences?.[item.key] || false}
                    onChange={() => handleToggle(item.key)}
                    color="primary"
                  />
                </Box>
                {iIdx < section.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 4 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            px: 4,
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
          }}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationSettingsPage;
