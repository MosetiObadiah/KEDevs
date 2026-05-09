// src/components/layout/Navbar.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme as useNextTheme } from 'next-themes';
import { useTheme } from '@mui/material/styles';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationPopover from '../notifications/NotificationPopover';
import { notificationService } from '@/services/notificationService';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const { theme: mode, setTheme } = useNextTheme();
  const muiTheme = useTheme();

  const { style, setStyle } = useThemeStyle();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElStyle, setAnchorElStyle] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isDev = user?.role === 'DEVELOPER';
  const isEmp = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Developers', href: '/developers' },
    { label: 'Companies', href: '/companies' },
    { label: 'Contact Us', href: '/contact' },
    ...(isEmp ? [{ label: 'Hiring Assist', href: '/hiring-assist' }] : []),
    ...(isAdmin ? [{ label: 'Admin Panel', href: '/admin/dashboard' }] : []),
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleOpenStyleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElStyle(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleCloseStyleMenu = () => setAnchorElStyle(null);

  const handleNavigate = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
    handleCloseUserMenu();
  };

  const fetchUnreadCount = async () => {
    if (isLoggedIn) {
      try {
        const response = await notificationService.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
      color: 'text.primary',
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: { xs: 70, md: 80 } }}>
          <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 4 }}>
            <Box component="img" src="/logo.svg" sx={{ height: { xs: 40, md: 50 }, width: 'auto' }} />
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={() => handleNavigate(item.href)}>
                  <Typography sx={{ textAlign: 'center', fontWeight: 600 }}>{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box component={Link} href="/" sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <Box component="img" src="/logo.svg" sx={{ height: 36, width: 'auto' }} />
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavigate(item.href)}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  px: 2,
                  '&:hover': { color: 'primary.main', bgcolor: 'background.subtle' }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {/* Theme Style Dropdown */}
            <Tooltip title="Switch Style">
              <IconButton onClick={handleOpenStyleMenu} sx={{ color: 'text.secondary' }}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElStyle}
              open={Boolean(anchorElStyle)}
              onClose={handleCloseStyleMenu}
              sx={{ mt: '45px', '& .MuiPaper-root': { borderRadius: 3, boxShadow: muiTheme.shadows[3] } }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setStyle('catppuccin'); handleCloseStyleMenu(); }} selected={style === 'catppuccin'}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Catppuccin Frappé</Typography>
              </MenuItem>
              <MenuItem onClick={() => { setStyle('material'); handleCloseStyleMenu(); }} selected={style === 'material'}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Material Default</Typography>
              </MenuItem>
            </Menu>

            {/* Theme Toggle */}
            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={() => setTheme(mode === 'dark' ? 'light' : 'dark')} sx={{ color: 'text.secondary' }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {!isLoggedIn ? (
              <>
                <Button color="inherit" component={Link} href="/login" sx={{ fontWeight: 700 }}>Login</Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/register"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 800,
                    px: 3
                  }}
                >
                  Join Community
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Notifications">
                  <IconButton onClick={handleOpenNotifications} sx={{ bgcolor: 'background.subtle' }}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <NotificationPopover
                  anchorEl={anchorElNotifications}
                  onClose={handleCloseNotifications}
                  onMarkAllAsRead={fetchUnreadCount}
                />

                {isEmp && (
                  <Tooltip title="Hiring Pipeline">
                    <IconButton onClick={() => router.push('/hiring-assist/pipeline')} sx={{ bgcolor: 'background.subtle' }}>
                      <GroupIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Open Profile">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.main' }}>
                    <Avatar alt={user?.fullName} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>{user?.fullName?.charAt(0)}</Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px', '& .MuiPaper-root': { borderRadius: 3, boxShadow: muiTheme.shadows[3] } }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{user?.role} ACCOUNT</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => handleNavigate('/profile/me')}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>My Profile</Typography>
                  </MenuItem>
                  {isDev ? (
                    <>
                      <MenuItem onClick={() => handleNavigate('/jobs/my-applications')}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>My Applications</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => handleNavigate('/jobs/my-posts')}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>My Job Posts</Typography>
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={() => handleNavigate('/jobs/my-posts')}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Jobs</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => handleNavigate('/hiring-assist/pipeline')}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Hiring Pipeline</Typography>
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={() => handleNavigate('/payments')}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Payments & Status</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/verify')}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Verification</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/settings/notifications')}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Notification Settings</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }} sx={{ color: 'error.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
