import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';
import { tokens } from './tokens';

const sharedTypography = {
  fontFamily: '"Inter", system-ui, sans-serif',
  h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, fontSize: '2rem',   lineHeight: 1.25, letterSpacing: '-0.01em' },
  h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3, letterSpacing: '0em' },
  h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35, letterSpacing: '0em' },
  body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.5 },
  button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
};

const baseTheme: ThemeOptions = {
  typography: sharedTypography,
  shape: { borderRadius: 8 },
};

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    inverse: string;
  }
}

export const getTheme = (mode: 'light' | 'dark', style: 'catppuccin' | 'material' = 'catppuccin') => {
  if (style === 'material') {
    return responsiveFontSizes(createTheme({
      palette: {
        mode,
        primary: { main: '#1976d2' },
        secondary: { main: '#9c27b0' },
        background: {
          default: mode === 'dark' ? '#121212' : '#fff',
          paper: mode === 'dark' ? '#1e1e1e' : '#fff',
          subtle: mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
          inverse: mode === 'dark' ? '#f5f5f5' : '#121212',
        },
      },
      shape: { borderRadius: 4 },
    }));
  }

  const palette = mode === 'dark' ? tokens.frappe : tokens.latte;

  return responsiveFontSizes(createTheme(baseTheme, {
    palette: {
      mode,
      primary: {
        main: palette.mauve,
        light: palette.lavender,
        dark: palette.pink,
        contrastText: palette.base,
      },
      secondary: {
        main: palette.teal,
        contrastText: palette.base,
      },
      error: { main: palette.red },
      warning: { main: palette.yellow },
      info: { main: palette.sapphire },
      success: { main: palette.green },
      background: {
        default: palette.base,
        paper:   palette.mantle,
        subtle:  palette.crust,
        inverse: mode === 'dark' ? palette.crust : palette.text,
      },
      text: {
        primary:   palette.text,
        secondary: palette.subtext0,
        disabled:  palette.overlay0,
      },
      divider: palette.surface0,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '6px 20px',
            transition: 'all 0.2s',
            '&:active': { transform: 'scale(0.97)' },
          },
          containedPrimary: {
            boxShadow: `0 2px 8px ${palette.surface0}80`,
            '&:hover': {
              boxShadow: `0 4px 12px ${palette.surface0}60`,
            },
          },
          outlinedPrimary: {
            borderColor: palette.surface0,
            '&:hover': {
              backgroundColor: palette.surface0 + '30',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.mantle,
            borderRadius: 12,
            border: `1px solid ${palette.surface0}`,
            boxShadow: `0 4px 12px ${palette.crust}50`,
            transition: 'box-shadow 0.2s',
            '&:hover': {
              boxShadow: `0 6px 16px ${palette.crust}80`,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: palette.crust,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.surface0,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.surface1,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.mauve,
              borderWidth: 2,
            },
          },
          input: {
            padding: '10px 14px',
            '&::placeholder': {
              color: palette.subtext0,
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: palette.subtext0,
            '&.Mui-focused': {
              color: palette.mauve,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease',
            backgroundColor: palette.base,
            color: palette.text,
          },
          '::selection': {
            backgroundColor: palette.surface0,
            color: palette.text,
          },
          '*:focus-visible': {
            outline: `2px solid ${palette.mauve}`,
            outlineOffset: 2,
            borderRadius: 4,
          },
          '::-webkit-scrollbar': { width: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: palette.surface0,
            borderRadius: 3,
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: palette.surface1,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.mantle,
            backgroundImage: 'none',
            borderBottom: `1px solid ${palette.surface0}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.mantle,
            borderRight: `1px solid ${palette.surface0}`,
          },
        },
      },
    },
  }));
};
