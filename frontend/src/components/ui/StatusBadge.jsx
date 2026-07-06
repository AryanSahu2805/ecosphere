import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme/theme';

const PRESETS = {
  ACTIVE:     { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  ACHIEVED:   { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  MISSED:     { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  CANCELLED:  { bg: '#F9FAFB', color: '#6B7280', dot: '#9CA3AF' },
  HIGH:       { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  CRITICAL:   { bg: '#FEF2F2', color: '#991B1B', dot: '#DC2626' },
  MEDIUM:     { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  LOW:        { bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  RESOLVED:   { bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  UNRESOLVED: { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  GOAL_MISSED:    { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  GOAL_AT_RISK:   { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  EMISSION_SPIKE: { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  ELECTRICITY:  { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  NATURAL_GAS:  { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  RENEWABLE:    { bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  CAR:    { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  FLIGHT: { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  TRAIN:  { bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  BUS:    { bg: '#F5F3FF', color: '#6D28D9', dot: '#8B5CF6' },
  PHYSICAL: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  CLOUD:    { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  HYBRID:   { bg: '#F5F3FF', color: '#6D28D9', dot: '#8B5CF6' },
};

const LABEL_MAP = {
  SUSTAINABILITY_MANAGER: 'SM',
  NATURAL_GAS: 'Gas',
  ELECTRICITY: 'Electricity',
  RENEWABLE: 'Renewable',
  GOAL_MISSED: 'Goal Missed',
  GOAL_AT_RISK: 'Goal At Risk',
  EMISSION_SPIKE: 'Emission Spike',
};

export default function StatusBadge({ value, label, showDot = true, size = 'medium' }) {
  const preset = PRESETS[value?.toUpperCase?.()] || { bg: tokens.colors.surface, color: tokens.colors.textSec, dot: tokens.colors.textMuted };
  const displayLabel = label || LABEL_MAP[value] || (value ? String(value).replace(/_/g, ' ') : '—');
  const isSmall = size === 'small';

  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: isSmall ? 1 : 1.5,
      py: isSmall ? 0.25 : 0.5,
      borderRadius: 100,
      bgcolor: preset.bg,
    }}>
      {showDot && (
        <Box sx={{ width: isSmall ? 5 : 6, height: isSmall ? 5 : 6, borderRadius: '50%', bgcolor: preset.dot, flexShrink: 0 }} />
      )}
      <Typography sx={{
        fontSize: isSmall ? 11 : 12,
        fontWeight: 600,
        color: preset.color,
        lineHeight: 1,
        textTransform: 'capitalize',
      }}>
        {displayLabel}
      </Typography>
    </Box>
  );
}
