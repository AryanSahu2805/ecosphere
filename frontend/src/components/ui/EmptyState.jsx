import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../../theme/theme';

const DEFAULT_ICONS = {
  data:    '📊',
  records: '📋',
  goals:   '🎯',
  alerts:  '🔔',
  reports: '📄',
  audit:   '📜',
  orgs:    '🏢',
  locs:    '📍',
  depts:   '🏛️',
};

export default function EmptyState({
  icon,
  emoji,
  title = 'No data found',
  description = 'There is nothing here yet.',
  action,
  actionLabel = 'Get started',
  compact = false,
}) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: compact ? 4 : 8,
      px: 3,
      textAlign: 'center',
      gap: 2,
    }}>
      {/* Emoji or icon */}
      <Box sx={{
        width: compact ? 48 : 64,
        height: compact ? 48 : 64,
        borderRadius: '50%',
        bgcolor: tokens.colors.surface,
        border: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? 22 : 28,
      }}>
        {emoji || DEFAULT_ICONS.data}
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{ color: tokens.colors.text, fontWeight: 600, mb: 0.5, fontSize: compact ? 15 : 16 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: tokens.colors.textSec, maxWidth: 320, mx: 'auto', lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Box>

      {action && (
        <Button
          variant="contained"
          onClick={action}
          size={compact ? 'small' : 'medium'}
          sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
