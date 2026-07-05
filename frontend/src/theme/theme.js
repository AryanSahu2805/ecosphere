import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#16A34A',
      light: '#22C55E',
      dark: '#15803D',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    success: { main: '#16A34A' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    info: { main: '#2563EB' },
    background: {
      default: '#F0FDF4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.015em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
    '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 20px',
          minHeight: 44,
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': {
              borderColor: '#16A34A',
            },
          },
          '& .MuiInputLabel-root': {
            backgroundColor: '#FFFFFF',
            padding: '0 4px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748B',
            borderBottom: '2px solid #E2E8F0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F0FDF4 !important',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: 8,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.25rem',
          paddingBottom: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8 },
        bar: { borderRadius: 8 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0F172A',
          color: '#F1F5F9',
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          borderRadius: 10,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        :focus-visible {
          outline: 3px solid #16A34A;
          outline-offset: 2px;
          border-radius: 4px;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `,
    },
  },
});

export default theme;
