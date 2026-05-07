// src/components/ThemeRegistry/ThemeRegistry.tsx
'use client';
import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'; // Using v15 since Next is 16
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';

import { AuthProvider } from '@/context/AuthContext';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <RouteGuard>
            <CssBaseline />
            {children}
          </RouteGuard>
        </AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
