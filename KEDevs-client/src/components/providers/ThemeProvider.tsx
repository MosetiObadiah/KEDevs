// src/components/providers/ThemeProvider.tsx
'use client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getTheme } from '@/lib/theme/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: mode, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentMode = mode === 'system' ? systemTheme : mode;
  const muiTheme = getTheme(currentMode === 'dark' ? 'dark' : 'light');

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
