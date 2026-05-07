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

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const { theme: mode, setTheme } = useNextTheme();
  const muiTheme = useTheme();
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const isDev = user?.userType === 'DEVELOPER';
  const isEmp = user?.userType === 'EMPLOYER';
  const isAdmin = user?.userType === 'ADMIN';

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
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavigate = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
    handleCloseUserMenu();
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
          <Typography
            variant="h5"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 900,
              letterSpacing: '-1.5px',
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 1
            }}
          >
            <WorkIcon sx={{ fontSize: 32 }} /> KEDevs
          </Typography>

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

          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 900,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '-1px'
            }}
          >
            KEDevs
          </Typography>

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
                  <IconButton onClick={() => router.push('/notifications')} sx={{ bgcolor: 'background.subtle' }}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                {isEmp && (
                   <Tooltip title="Hiring Pipeline">
                    <IconButton onClick={() => router.push('/hiring-assist/pipeline')} sx={{ bgcolor: 'background.subtle' }}>
                      <GroupIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Open Profile">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.main' }}>
                    <Avatar alt={user?.name} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>{user?.name?.charAt(0)}</Avatar>
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{user?.userType} ACCOUNT</Typography>
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
