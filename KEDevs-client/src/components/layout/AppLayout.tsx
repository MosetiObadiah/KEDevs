'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  Stack,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';
import { useTheme as useNextTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import Link from 'next/link';

const DRAWER_WIDTH = 260;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useTheme();
  const { theme: mode, setTheme } = useNextTheme();
  const { style, setStyle } = useThemeStyle();
  const [anchorElStyle, setAnchorElStyle] = useState<null | HTMLElement>(null);

  const isDev = user?.role === 'DEVELOPER';
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh' }}>
          {children}
        </Box>
        <Footer />
      </>
    );
  }

  // Define sidebar links based on role
  const sidebarLinks = isDev
    ? [
        { label: 'Jobs', href: '/jobs', icon: <WorkIcon /> },
        { label: 'Developers', href: '/developers', icon: <PeopleIcon /> },
        { label: 'Companies', href: '/companies', icon: <BusinessIcon /> },
        { label: 'My Jobs', href: '/jobs/my-posts', icon: <AssignmentIcon /> },
        { label: 'My Applications', href: '/jobs/my-applications', icon: <DescriptionIcon /> },
        { label: 'Spotlight', href: '/admin/spotlight', icon: <StarIcon /> },
      ]
    : [
        { label: 'Browse Developers', href: '/developers', icon: <PeopleIcon /> },
        { label: 'Companies', href: '/companies', icon: <BusinessIcon /> },
        { label: 'My Job Posts', href: '/jobs/my-posts', icon: <AssignmentIcon /> },
        { label: 'Received Applications', href: '/jobs/my-applications', icon: <DescriptionIcon /> },
        { label: 'Spotlight', href: '/admin/spotlight', icon: <StarIcon /> },
      ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Brand Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WorkIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 900,
            color: 'text.primary',
            textDecoration: 'none',
            letterSpacing: '-1px',
          }}
        >
          KEDevs
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {sidebarLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.href);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'primary.light' : 'transparent',
                  color: active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: active ? 'primary.light' : 'background.subtle',
                    color: 'primary.main',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 800 : 600 }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Settings & Profile Section */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => {
            router.push('/profile/me');
            setMobileOpen(false);
          }}
          sx={{
            borderRadius: 2,
            mb: 1,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            alt={user?.fullName}
            sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}
          >
            {user?.fullName?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'text.primary' }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              My Profile
            </Typography>
          </Box>
        </ListItemButton>

        <ListItemButton
          onClick={() => {
            router.push('/profile/me');
            setMobileOpen(false);
          }}
          sx={{
            borderRadius: 2,
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'background.subtle' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Settings
              </Typography>
            }
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': { bgcolor: 'error.light' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top slim appbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 64, px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <TextField
              size="small"
              placeholder="Search..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, bgcolor: 'background.subtle', width: { xs: 150, md: 300 } },
                },
              }}
            />
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {/* Style Switcher */}
            <Tooltip title="Switch Style">
              <IconButton onClick={(e) => setAnchorElStyle(e.currentTarget)} sx={{ color: 'text.secondary' }}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElStyle}
              open={Boolean(anchorElStyle)}
              onClose={() => setAnchorElStyle(null)}
              sx={{ mt: '45px', '& .MuiPaper-root': { borderRadius: 3, boxShadow: muiTheme.shadows[3] } }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  setStyle('catppuccin');
                  setAnchorElStyle(null);
                }}
                selected={style === 'catppuccin'}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Catppuccin Frappé</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setStyle('material');
                  setAnchorElStyle(null);
                }}
                selected={style === 'material'}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Material Default</Typography>
              </MenuItem>
            </Menu>

            {/* Dark Mode Toggle */}
            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={() => setTheme(mode === 'dark' ? 'light' : 'dark')} sx={{ color: 'text.secondary' }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton onClick={() => router.push('/notifications')} sx={{ bgcolor: 'background.subtle' }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawers */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Temporary Drawer for Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Permanent Drawer for Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          pt: '64px',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
