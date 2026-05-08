// src/app/admin/layout.tsx
'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  IconButton, 
  Toolbar, 
  AppBar, 
  Avatar, 
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PillBadge } from '@/components/shared/PillBadge';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Verification Queue', icon: <VerifiedUserIcon />, path: '/admin/verification' },
  { text: 'Flagged Content', icon: <FlagIcon />, path: '/admin/flags' },
  { text: 'Spotlight Management', icon: <StarIcon />, path: '/admin/spotlight' },
  { text: 'Platform Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
  { text: 'Audit Log', icon: <HistoryIcon />, path: '/admin/audit' },
  { text: 'Platform Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.inverse', color: 'white' }}>
      <Toolbar sx={{ px: 3, py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '-1px' }}>
          <WorkIcon sx={{ fontSize: 28 }} /> KEDevs <PillBadge variant="mint">ADMIN</PillBadge>
        </Typography>
      </Toolbar>
      
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href={item.path}
              selected={pathname === item.path}
              sx={{ 
                borderRadius: 2,
                py: 1.25,
                color: 'rgba(255,255,255,0.6)',
                '&.Mui-selected': { 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={
                  <Typography sx={{ fontWeight: pathname === item.path ? 800 : 600, fontSize: '0.875rem' }}>
                    {item.text}
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 3 }}>
        <ListItemButton 
          onClick={logout} 
          sx={{ 
            borderRadius: 2, 
            color: 'error.light', 
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><LogoutIcon /></ListItemIcon>
          <ListItemText 
            primary={
              <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>
                Logout
              </Typography>
            } 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.subtle', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 80 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {menuItems.find(item => item.path === pathname)?.text || 'Admin Panel'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button 
              component={Link} 
              href="/" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              Public Site
            </Button>
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{user?.fullName?.charAt(0)}</Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 10 }}
      >
        {children}
      </Box>
    </Box>
  );
}
