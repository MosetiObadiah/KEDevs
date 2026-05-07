// src/components/shared/PillBadge.tsx
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

type BadgeVariant = 'mint' | 'sage' | 'neutral' | 'amber' | 'red';

export const PillBadge = ({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  const getStyle = () => {
    const dark = theme.palette.mode === 'dark';
    switch (variant) {
      case 'mint':
        return {
          bgcolor: dark ? 'primary.dark' : 'primary.light',
          color: dark ? 'primary.contrastText' : 'primary.contrastText',
        };
      case 'sage':
        return {
          bgcolor: dark ? 'secondary.dark' : 'secondary.light',
          color: dark ? 'white' : 'secondary.contrastText',
        };
      case 'amber':
        return {
          bgcolor: dark ? 'warning.dark' : 'warning.light',
          color: dark ? 'warning.contrastText' : 'warning.contrastText',
        };
      case 'red':
        return {
          bgcolor: dark ? 'error.dark' : 'error.light',
          color: dark ? 'error.contrastText' : 'error.contrastText',
        };
      case 'neutral':
      default:
        return {
          bgcolor: dark ? 'grey.800' : 'grey.200',
          color: dark ? 'grey.300' : 'grey.700',
        };
    }
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.25,
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 2,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        ...getStyle(),
      }}
    >
      {children}
    </Box>
  );
};
