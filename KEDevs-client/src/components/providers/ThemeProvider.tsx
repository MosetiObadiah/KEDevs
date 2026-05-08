// src/components/providers/ThemeProvider.tsx
'use client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/lib/theme/theme';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { style } = useThemeStyle();
  const { theme: mode } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use 'dark' as default if not mounted or undefined to avoid mismatch
  const currentMode = (mode === 'dark' || mode === 'light') ? mode : 'dark';
  const muiTheme = getTheme(currentMode, style);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
