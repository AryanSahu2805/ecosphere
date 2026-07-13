import { Box, Typography, Skeleton } from '@mui/material';
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

function renderTrend(trend) {
  if (trend === null || trend === undefined) {
    return (
      <Typography variant="caption" sx={{ color: '#64748B' }}>No data yet</Typography>
    );
  }
  if (trend.direction === 'new') {
    return (
      <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>
        ↑ New this month
      </Typography>
    );
  }
  if (trend.direction === 'neutral') {
    return (
      <Typography variant="caption" sx={{ color: '#64748B' }}>
        → 0% vs last month
      </Typography>
    );
  }
  const isUp = trend.direction === 'up';
  const color = isUp ? '#DC2626' : '#16A34A';
  const label = isUp
    ? `↑ +${Math.abs(trend.percent)}% vs last month`
    : `↓ ${Math.abs(trend.percent)}% vs last month`;
  return (
    <Typography variant="caption" sx={{ color, fontWeight: 600 }}>{label}</Typography>
  );
}

export default function KpiCard({
  title,
  value,
  unit,
  icon,
  iconBg = '#DCFCE7',
  iconColor = tokens.colors.primary,
  trend,          // object { percent, direction } or null
  sparkline,      // array of numbers for sparkline
  loading = false,
}) {

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
      {sparkline && renderTrend(trend)}
    </Box>
  );
}
