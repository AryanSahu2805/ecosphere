import { Box, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { tokens } from '../../theme/theme';

// Tiny sparkline inside the KPI card
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const formatted = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={formatted}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function KpiCard({
  title,
  value,
  unit,
  icon,
  iconBg = '#DCFCE7',
  iconColor = tokens.colors.primary,
  trend,          // number: +12 or -5
  trendLabel = 'vs last month',
  sparkline,      // array of numbers for sparkline
  loading = false,
}) {
  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend == null;

  const TrendIcon = trendNeutral ? TrendingFlat : trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendNeutral
    ? tokens.colors.textMuted
    : trendPositive
    ? tokens.colors.success
    : tokens.colors.danger;

  if (loading) {
    return (
      <Box sx={{
        bgcolor: 'background.paper', borderRadius: `${tokens.radius.card}px`,
        border: `1px solid ${tokens.colors.border}`, p: 3, height: 160,
      }}>
        <Skeleton width="40%" height={16} sx={{ mb: 1.5 }} />
        <Skeleton width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={14} />
      </Box>
    );
  }

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderRadius: `${tokens.radius.card}px`,
      border: `1px solid ${tokens.colors.border}`,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      transition: 'all 0.15s ease',
      cursor: 'default',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)',
      },
    }}>
      {/* Header: title + icon */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="overline" sx={{ fontSize: 11, color: tokens.colors.textSec, lineHeight: 1 }}>
          {title}
        </Typography>
        {icon && (
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor, flexShrink: 0,
          }}>
            {icon}
          </Box>
        )}
      </Box>

      {/* Value */}
      <Box>
        <Box display="flex" alignItems="baseline" gap={0.75}>
          <Typography sx={{
            fontSize: tokens.fontSize.kpi,
            fontWeight: 700,
            lineHeight: 1,
            color: tokens.colors.text,
            letterSpacing: '-0.03em',
          }}>
            {value ?? '—'}
          </Typography>
          {unit && (
            <Typography variant="body2" sx={{ color: tokens.colors.textSec, fontWeight: 500 }}>
              {unit}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <Box sx={{ mx: -1 }}>
          <Sparkline data={sparkline} color={iconColor} />
        </Box>
      )}

      {/* Trend */}
      {trend != null && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.colors.textMuted }}>
            {trendLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
