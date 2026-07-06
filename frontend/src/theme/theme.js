import { createTheme } from '@mui/material/styles';

// ─── Design Tokens ──────────────────────────────────────────────────────────
export const tokens = {
  colors: {
    primary:   '#16A34A',
    primaryDk: '#15803D',
    primaryLt: '#DCFCE7',
    dark:      '#0F172A',
    bg:        '#F8FAFC',
    card:      '#FFFFFF',
    border:    '#E5E7EB',
    text:      '#111827',
    textSec:   '#6B7280',
    textMuted: '#9CA3AF',
    danger:    '#EF4444',
    warning:   '#F59E0B',
    success:   '#22C55E',
    info:      '#3B82F6',
    surface:   '#F9FAFB',
    surfaceHv: '#F3F4F6',
  },
  spacing: { '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 40, '8': 48, '9': 64 },
  radius: { card: 16, btn: 12, input: 12, dialog: 20, sm: 8, xs: 6 },
  fontSize: {
    h1: 32, h2: 28, h3: 22, h4: 20, h5: 18, cardTitle: 16,
    body: 15, label: 13, kpi: 40, caption: 12,
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: tokens.colors.primary, dark: tokens.colors.primaryDk, light: '#4ADE80', contrastText: '#fff' },
    secondary:  { main: '#64748B', contrastText: '#fff' },
    error:      { main: tokens.colors.danger },
    warning:    { main: tokens.colors.warning },
    success:    { main: tokens.colors.success },
    info:       { main: tokens.colors.info },
    background: { default: tokens.colors.bg, paper: tokens.colors.card },
    text:       { primary: tokens.colors.text, secondary: tokens.colors.textSec, disabled: tokens.colors.textMuted },
    divider:    tokens.colors.border,
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", system-ui, sans-serif',
    h1: { fontSize: tokens.fontSize.h1, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontSize: tokens.fontSize.h2, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h3: { fontSize: tokens.fontSize.h3, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h4: { fontSize: tokens.fontSize.h4, fontWeight: 600, letterSpacing: '-0.005em' },
    h5: { fontSize: tokens.fontSize.h5, fontWeight: 600 },
    h6: { fontSize: tokens.fontSize.cardTitle, fontWeight: 600 },
    body1: { fontSize: tokens.fontSize.body, lineHeight: 1.6 },
    body2: { fontSize: 14, lineHeight: 1.5, color: tokens.colors.textSec },
    caption: { fontSize: tokens.fontSize.caption, color: tokens.colors.textMuted },
    overline: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: tokens.colors.textSec },
    button: { fontWeight: 600, fontSize: 14, letterSpacing: '0', textTransform: 'none' },
  },

  shape: { borderRadius: tokens.radius.sm },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 4px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    '0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
    '0 8px 16px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)',
    '0 12px 24px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.04)',
    '0 16px 32px rgba(0,0,0,0.08)',
    '0 20px 40px rgba(0,0,0,0.10)',
    ...Array(16).fill('none'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-feature-settings: "cv02","cv03","cv04","cv11"; }
        :focus-visible { outline: 2px solid #16A34A; outline-offset: 2px; border-radius: 4px; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `,
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.btn,
          fontWeight: 600,
          fontSize: 14,
          minHeight: 40,
          padding: '8px 20px',
          transition: 'all 0.15s ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        sizeLarge: { minHeight: 48, padding: '12px 24px', fontSize: 15 },
        sizeSmall: { minHeight: 32, padding: '4px 12px', fontSize: 13 },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          '&:hover': { boxShadow: '0 3px 8px rgba(22,163,74,0.25)' },
        },
        outlined: {
          borderColor: tokens.colors.border,
          color: tokens.colors.text,
          '&:hover': { backgroundColor: tokens.colors.surfaceHv, borderColor: '#D1D5DB' },
        },
        text: {
          color: tokens.colors.textSec,
          '&:hover': { backgroundColor: tokens.colors.surfaceHv },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.card,
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          backgroundImage: 'none',
          transition: 'box-shadow 0.15s ease',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: { root: { padding: '24px', '&:last-child': { paddingBottom: '24px' } } },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.input,
            fontSize: 14,
            backgroundColor: tokens.colors.card,
            transition: 'box-shadow 0.15s ease',
            '& fieldset': { borderColor: tokens.colors.border },
            '&:hover fieldset': { borderColor: '#9CA3AF' },
            '&.Mui-focused fieldset': { borderColor: tokens.colors.primary, borderWidth: 2 },
            '&.Mui-focused': { boxShadow: `0 0 0 3px rgba(22,163,74,0.12)` },
          },
          '& .MuiInputLabel-root': {
            fontSize: 14,
            '&.Mui-focused': { color: tokens.colors.primary },
          },
          '& .MuiInputLabel-outlined': {
            '&.MuiInputLabel-shrink': { transform: 'translate(14px, -9px) scale(0.75)' },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.input },
        input: { padding: '10px 14px', fontSize: 14 },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: 14 },
        outlined: { transform: 'translate(14px, 10px) scale(1)', '&.MuiInputLabel-shrink': { transform: 'translate(14px, -9px) scale(0.75)' } },
      },
    },

    MuiSelect: {
      styleOverrides: { select: { borderRadius: tokens.radius.input, fontSize: 14 } },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 12, fontWeight: 600, height: 24 },
        sizeSmall: { height: 20, fontSize: 11 },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: tokens.colors.textSec,
            backgroundColor: tokens.colors.surface,
            borderBottom: `1px solid ${tokens.colors.border}`,
            padding: '10px 16px',
            whiteSpace: 'nowrap',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 14, borderBottom: `1px solid ${tokens.colors.border}`, padding: '14px 16px', color: tokens.colors.text },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: tokens.colors.surface },
          '&:last-child td': { borderBottom: 'none' },
          transition: 'background-color 0.1s ease',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: tokens.radius.dialog, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: `1px solid ${tokens.colors.border}` },
      },
    },

    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: 18, fontWeight: 700, padding: '24px 24px 16px' } },
    },

    MuiDialogContent: {
      styleOverrides: { root: { padding: '0 24px 16px' } },
    },

    MuiDialogActions: {
      styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: tokens.colors.dark, color: '#F1F5F9', borderRight: 'none', boxShadow: 'none' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.colors.card,
          color: tokens.colors.text,
          borderBottom: `1px solid ${tokens.colors.border}`,
          boxShadow: 'none',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 100 }, bar: { borderRadius: 100 } },
    },

    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 12, fontWeight: 500, backgroundColor: tokens.colors.dark,
          borderRadius: 8, padding: '6px 10px',
        },
        arrow: { color: tokens.colors.dark },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm, fontSize: 14, alignItems: 'center' },
        standardError: { backgroundColor: '#FEF2F2', color: '#991B1B', '& .MuiAlert-icon': { color: tokens.colors.danger } },
        standardWarning: { backgroundColor: '#FFFBEB', color: '#92400E' },
        standardSuccess: { backgroundColor: '#F0FDF4', color: '#166534' },
        standardInfo: { backgroundColor: '#EFF6FF', color: '#1E40AF' },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          transition: 'all 0.15s ease',
          '&:hover': { backgroundColor: tokens.colors.surfaceHv },
        },
        sizeSmall: { padding: 6 },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12, border: `1px solid ${tokens.colors.border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', marginTop: 4,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: { root: { fontSize: 14, borderRadius: 8, margin: '2px 6px', padding: '8px 12px', minWidth: 160 } },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.colors.border } },
    },

    MuiTab: {
      styleOverrides: { root: { fontSize: 14, fontWeight: 600, textTransform: 'none', minHeight: 44 } },
    },
  },
});

export default theme;
