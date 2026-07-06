import { Box, Skeleton } from '@mui/material';
import { tokens } from '../../theme/theme';

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <Box>
      {/* Header row */}
      <Box sx={{
        display: 'flex', gap: 2, px: 2, py: 1.5,
        bgcolor: tokens.colors.surface,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}>
        {Array(cols).fill(0).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={14} />
        ))}
      </Box>
      {/* Data rows */}
      {Array(rows).fill(0).map((_, r) => (
        <Box key={r} sx={{
          display: 'flex', gap: 2, px: 2, py: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          '&:last-child': { borderBottom: 'none' },
        }}>
          {Array(cols).fill(0).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height={16}
              sx={{ opacity: 0.6 + (c / cols) * 0.4 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function CardSkeleton({ height = 160 }) {
  return (
    <Box sx={{
      bgcolor: 'background.paper', borderRadius: `${tokens.radius.card}px`,
      border: `1px solid ${tokens.colors.border}`, p: 3, height,
    }}>
      <Skeleton width="40%" height={14} sx={{ mb: 2 }} />
      <Skeleton width="55%" height={36} sx={{ mb: 1.5 }} />
      <Skeleton width="70%" height={12} />
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KPI row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} height={140} />)}
      </Box>
      {/* Chart row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
        <CardSkeleton height={320} />
        <CardSkeleton height={320} />
      </Box>
    </Box>
  );
}

export function PageSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton width="30%" height={32} />
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: `${tokens.radius.card}px`,
        border: `1px solid ${tokens.colors.border}`,
        overflow: 'hidden',
      }}>
        <TableSkeleton rows={6} cols={5} />
      </Box>
    </Box>
  );
}
