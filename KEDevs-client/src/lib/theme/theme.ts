// src/lib/theme/theme.ts
import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';
import { tokens } from './tokens';

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    inverse: string;
  }
}

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: {
      fontSize: '4.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    h2: {
      fontSize: '3rem',
      lineHeight: 1.15,
      letterSpacing: '-0.03em',
      fontWeight: 700,
    },
    h3: {
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.875rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
    '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
    '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
    '0 25px 50px -12px rgb(0 0 0 / 0.15)',
    'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'
  ] as any,
};

export const getTheme = (mode: 'light' | 'dark') => {
  const isLight = mode === 'light';

  const palette = {
    mode,
    primary: {
      main: tokens.mint[400],
      light: tokens.mint[300],
      dark: tokens.mint[600],
      contrastText: isLight ? tokens.sage[900] : tokens.neutral[900],
    },
    secondary: {
      main: tokens.sage[600],
      light: tokens.sage[400],
      dark: tokens.sage[800],
      contrastText: '#fff',
    },
    background: {
      default: isLight ? tokens.neutral[50] : tokens.neutral[950],
      paper: isLight ? tokens.neutral[0] : tokens.neutral[900],
      subtle: isLight ? tokens.neutral[100] : tokens.neutral[800],
      inverse: tokens.sage[900],
    },
    text: {
      primary: isLight ? tokens.neutral[900] : tokens.neutral[50],
      secondary: isLight ? tokens.neutral[500] : tokens.neutral[400],
      disabled: isLight ? tokens.neutral[400] : tokens.neutral[600],
    },
    divider: isLight ? tokens.neutral[200] : tokens.neutral[800],
  };

  const theme = createTheme(baseTheme, {
    palette,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            transition: 'background-color 0.2s ease',
          },
          '::selection': {
            backgroundColor: `${tokens.mint[400]}33`,
            color: palette.text.primary,
          },
          '*:focus-visible': {
            outline: `2px solid ${palette.primary.main}`,
            outlineOffset: 2,
            borderRadius: 4,
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: palette.divider,
            borderRadius: 3,
            '&:hover': { background: palette.text.disabled },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
            transition: 'all 0.15s',
            padding: '10px 20px',
            fontSize: '0.875rem',
            '&:active': { transform: 'scale(0.98)' },
          },
          containedPrimary: {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)' },
            '&:focus-visible': {
              boxShadow: `0 0 0 3px ${tokens.mint[400]}40`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            border: `1px solid ${palette.divider}`,
            borderRadius: 16,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            borderRadius: 12,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.mint[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.mint[400],
              borderWidth: 2,
            },
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme, { factor: 2 });
};
