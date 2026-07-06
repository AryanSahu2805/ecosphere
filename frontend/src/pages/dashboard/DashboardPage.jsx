import { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Card, CardContent,
  Alert, Select, MenuItem, Button,
  Tooltip, Chip,
} from '@mui/material';
import {
  BoltOutlined, FlightTakeoffOutlined, StorageOutlined,
  TrackChangesOutlined, NotificationsOutlined, DownloadOutlined,
  ArrowForwardOutlined, Co2Outlined,
} from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ReferenceLine,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import analyticsApi   from '../../api/analyticsApi';
import alertsApi      from '../../api/alertsApi';
import goalsApi       from '../../api/goalsApi';
import organizationsApi from '../../api/organizationsApi';
import { useAuth }    from '../../context/AuthContext';
import { KpiCard }    from '../../components/ui';
import StatusBadge    from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';

function calculateTrend(data) {
  if (!data || data.length === 0) return null;

  const values = data.map(v => Number(v || 0));

  const hasAnyData = values.some(v => v > 0);
  if (!hasAnyData) return null;

  const thisMonth = values[values.length - 1] || 0;
  const lastMonth = values[values.length - 2] || 0;

  if (lastMonth === 0 && thisMonth === 0) {
    return { percent: 0, direction: 'neutral' };
  }
  if (lastMonth === 0 && thisMonth > 0) {
    return { percent: null, direction: 'new' };
  }
  if (lastMonth > 0 && thisMonth === 0) {
    return { percent: -100, direction: 'down' };
  }

  const percent = (thisMonth - lastMonth) / lastMonth * 100;
  return {
    percent: parseFloat(percent.toFixed(1)),
    direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral',
  };
}

const CHART_COLORS = {
  energy: '#F59E0B',
  travel: '#3B82F6',
  server: '#8B5CF6',
  total:  tokens.colors.primary,
};

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: tokens.colors.dark, borderRadius: 2,
      p: 1.5, border: `1px solid rgba(255,255,255,0.1)`,
      minWidth: 160,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', mb: 1 }}>{label}</Typography>
      {payload.map(p => (
        <Box key={p.name} display="flex" justifyContent="space-between" gap={3} sx={{ mb: 0.5 }}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
            <Typography sx={{ fontSize: 12, color: '#CBD5E1' }}>{p.name}</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
            {Number(p.value).toFixed(2)} kg
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, getOrgId } = useAuth();
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [summary,      setSummary]      = useState(null);
  const [trends,       setTrends]       = useState([]);
  const [alerts,       setAlerts]       = useState([]);
  const [goals,        setGoals]        = useState([]);
  const [orgs,         setOrgs]         = useState([]);
  const [selectedOrg,  setSelectedOrg]  = useState(null);

  const year = new Date().getFullYear();

  const loadData = async (orgId) => {
    setSummary(null);
    setTrends([]);
    setAlerts([]);
    setGoals([]);
    setLoading(true);
    setError('');
    try {
      const from = `${year}-01-01`, to = `${year}-12-31`;
      const [sumRes, trendRes, alertRes, goalRes] = await Promise.all([
        analyticsApi.getSummary(orgId, from, to),
        analyticsApi.getTrends(orgId, year),
        alertsApi.getActive(orgId),
        goalsApi.getByOrganization(orgId),
      ]);
      setSummary(sumRes.data);

      // Fill missing months with zeros up to the current month
      const currentMonth = new Date().getMonth() + 1;
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                          'Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthMap = {};
      for (let m = 1; m <= currentMonth; m++) {
        monthMap[m] = {
          month: m,
          monthName: monthNames[m - 1],
          energyEmissions: 0,
          travelEmissions: 0,
          serverEmissions: 0,
          totalEmissions: 0,
        };
      }
      trendRes.data.forEach(t => {
        if (monthMap[t.month]) {
          monthMap[t.month] = {
            ...monthMap[t.month], ...t,
            monthName: monthNames[t.month - 1],
          };
        }
      });
      setTrends(Object.values(monthMap));

      setAlerts(alertRes.data.slice(0, 4));
      setGoals(goalRes.data.slice(0, 4));
    } catch { setError('Failed to load dashboard data.'); }
    finally   { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      if (isAdmin()) {
        try {
          const res = await organizationsApi.getAll();
          setOrgs(res.data);
          if (res.data.length) { setSelectedOrg(res.data[0].id); }
          else setLoading(false);
        } catch { setError('Failed to load organizations.'); setLoading(false); }
      } else {
        const id = getOrgId() || 1;
        setSelectedOrg(id);
      }
    };
    init();
  }, [user]);

  useEffect(() => { if (selectedOrg) loadData(selectedOrg); }, [selectedOrg]);

  if (loading) return <DashboardSkeleton />;

  // Sparkline for Total CO₂ card (Improvement 1)
  const totalSparkline = trends.map(t => (
    Number(t.energyEmissions || 0) +
    Number(t.travelEmissions  || 0) +
    Number(t.serverEmissions  || 0)
  ));

  const kpis = summary ? [
    {
      title: 'Total CO₂ Emissions',
      value: Number(summary.totalEmissions).toFixed(2),
      unit: 'kg',
      icon: <Co2Outlined sx={{ fontSize: 18 }} />,
      iconBg: '#DCFCE7', iconColor: tokens.colors.primary,
      trend: calculateTrend(totalSparkline),
      sparkline: totalSparkline,
      nav: '/app/reports',
      tooltip: 'View reports & exports →',
    },
    {
      title: 'Energy Emissions',
      value: Number(summary.totalEnergyEmissions).toFixed(2),
      unit: 'kg',
      icon: <BoltOutlined sx={{ fontSize: 18 }} />,
      iconBg: '#FEF9C3', iconColor: '#CA8A04',
      trend: calculateTrend(trends.map(t => +t.energyEmissions)),
      sparkline: trends.map(t => +t.energyEmissions),
      nav: '/app/energy-records',
      tooltip: 'View energy records →',
    },
    {
      title: 'Travel Emissions',
      value: Number(summary.totalTravelEmissions).toFixed(2),
      unit: 'kg',
      icon: <FlightTakeoffOutlined sx={{ fontSize: 18 }} />,
      iconBg: '#DBEAFE', iconColor: '#2563EB',
      trend: calculateTrend(trends.map(t => +t.travelEmissions)),
      sparkline: trends.map(t => +t.travelEmissions),
      nav: '/app/travel-records',
      tooltip: 'View travel records →',
    },
    {
      title: 'Server Emissions',
      value: Number(summary.totalServerEmissions).toFixed(2),
      unit: 'kg',
      icon: <StorageOutlined sx={{ fontSize: 18 }} />,
      iconBg: '#EDE9FE', iconColor: '#7C3AED',
      trend: calculateTrend(trends.map(t => +t.serverEmissions)),
      sparkline: trends.map(t => +t.serverEmissions),
      nav: '/app/server-records',
      tooltip: 'View server usage records →',
    },
    {
      title: 'Active Goals',
      value: goals.filter(g => g.status === 'ACTIVE').length,
      unit: null,
      icon: <TrackChangesOutlined sx={{ fontSize: 18 }} />,
      iconBg: '#ECFDF5', iconColor: '#059669',
      nav: '/app/goals',
      tooltip: 'View sustainability goals →',
    },
    {
      title: 'Active Alerts',
      value: alerts.length,
      unit: null,
      icon: <NotificationsOutlined sx={{ fontSize: 18 }} />,
      iconBg: alerts.length > 0 ? '#FEF2F2' : '#F9FAFB',
      iconColor: alerts.length > 0 ? '#DC2626' : '#6B7280',
      nav: '/app/alerts',
      tooltip: 'View all alerts →',
    },
  ] : [];

  const activeGoals = goals.filter(g => g.status === 'ACTIVE');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* ─── Row 1: Header ──────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: 26, fontWeight: 700, color: tokens.colors.text }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec, mt: 0.5 }}>
            {year} carbon emissions overview · Updated just now
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          {isAdmin() && orgs.length > 0 && (
            <Select
              value={selectedOrg || ''}
              onChange={e => setSelectedOrg(e.target.value)}
              size="small"
              sx={{ minWidth: 200, '& .MuiSelect-select': { fontSize: 13 } }}>
              {orgs.map(o => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 13 }}>{o.name}</MenuItem>)}
            </Select>
          )}
          <Button variant="outlined" size="small" startIcon={<DownloadOutlined />}
            onClick={() => navigate('/app/reports')}>
            Export Report
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {summary && (
        <>
          {/* ─── Row 2: KPI Cards (clickable + tooltip) ─────── */}
          <Grid container spacing={2}>
            {kpis.map((kpi, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Tooltip title={kpi.tooltip} placement="top" arrow>
                  <Box
                    onClick={() => navigate(kpi.nav)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)' },
                      '&:active': { transform: 'translateY(0px)' },
                    }}>
                    <KpiCard {...kpi} />
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {/* ─── Row 3: Monthly Emissions — FULL WIDTH ──────── */}
          {(() => {
            const totalEnergy = trends.reduce((s, t) => s + Number(t.energyEmissions || 0), 0);
            const totalTravel = trends.reduce((s, t) => s + Number(t.travelEmissions  || 0), 0);
            const totalServer = trends.reduce((s, t) => s + Number(t.serverEmissions  || 0), 0);
            return (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ pb: '24px !important' }}>
                      {/* Header row */}
                      <Box sx={{
                        display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3,
                      }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700 }}>
                            Monthly Emissions
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.25 }}>
                            CO₂ output by source type · {year}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Energy: ${totalEnergy.toFixed(2)} kg`} size="small"
                            sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 600 }} />
                          <Chip label={`Travel: ${totalTravel.toFixed(2)} kg`} size="small"
                            sx={{ bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600 }} />
                          <Chip label={`Server: ${totalServer.toFixed(2)} kg`} size="small"
                            sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 600 }} />
                        </Box>
                      </Box>

                      {trends.length === 0 ? (
                        <Box sx={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ color: tokens.colors.textMuted, fontSize: 14 }}>
                            No trend data for {year}
                          </Typography>
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height={380}>
                          <AreaChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                            <defs>
                              {[['energy', '#D97706'], ['travel', '#2563EB'], ['server', '#7C3AED']].map(([k, c]) => (
                                <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%"  stopColor={c} stopOpacity={0.12} />
                                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={tokens.colors.border} vertical={false} />
                            <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: tokens.colors.textSec }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: tokens.colors.textSec }} axisLine={false} tickLine={false} unit=" kg" />
                            <ReferenceLine y={0} stroke={tokens.colors.border} />
                            <RechartsTooltip
                              content={<ChartTooltip />}
                              formatter={(value, name) => [`${Number(value).toFixed(4)} kg CO₂`, name]}
                            />
                            <Legend
                              layout="horizontal"
                              verticalAlign="top"
                              align="left"
                              iconType="circle"
                              iconSize={8}
                              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="energyEmissions" name="Energy"
                              stroke="#D97706" fill="url(#grad_energy)" strokeWidth={2}
                              dot={{ r: 5, fill: '#D97706' }} activeDot={{ r: 7 }} />
                            <Area type="monotone" dataKey="travelEmissions" name="Travel"
                              stroke="#2563EB" fill="url(#grad_travel)" strokeWidth={2}
                              dot={{ r: 5, fill: '#2563EB' }} activeDot={{ r: 7 }} />
                            <Area type="monotone" dataKey="serverEmissions" name="Server"
                              stroke="#7C3AED" fill="url(#grad_server)" strokeWidth={2}
                              dot={{ r: 5, fill: '#7C3AED' }} activeDot={{ r: 7 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            );
          })()}

          {/* ─── Row 4: Recent Alerts + Record Summary ──────── */}
          <Grid container spacing={3}>
            {/* Recent Alerts */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700 }}>Recent Alerts</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>Unresolved issues requiring attention</Typography>
                    </Box>
                    <Button variant="text" size="small" endIcon={<ArrowForwardOutlined sx={{ fontSize: 14 }} />}
                      onClick={() => navigate('/app/alerts')} sx={{ fontSize: 12 }}>
                      View all
                    </Button>
                  </Box>
                  {alerts.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 14, color: tokens.colors.textMuted }}>✅ No active alerts</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {alerts.map(a => (
                        <Box key={a.id} sx={{
                          p: 2, borderRadius: 2, bgcolor: tokens.colors.surface,
                          border: `1px solid ${tokens.colors.border}`,
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.75}>
                            <StatusBadge value={a.alertType} size="small" showDot={false} />
                            <StatusBadge value={a.severity} size="small" />
                          </Box>
                          <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, lineHeight: 1.4 }}>
                            {a.message.length > 80 ? a.message.slice(0, 80) + '…' : a.message}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Record Summary */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 2 }}>Record Summary</Typography>
                  <Grid container spacing={0}>
                    {[
                      { label: 'Energy Records', value: summary.energyRecordCount, color: '#D97706' },
                      { label: 'Travel Records', value: summary.travelRecordCount, color: '#2563EB' },
                      { label: 'Server Records', value: summary.serverRecordCount, color: '#7C3AED' },
                      { label: 'Active Goals',   value: activeGoals.length,        color: tokens.colors.primary },
                    ].map((s, i) => (
                      <Grid item xs={6} key={i}>
                        <Box sx={{
                          px: 2, py: 2, textAlign: 'center',
                          borderRight: i % 2 === 0 ? `1px solid ${tokens.colors.border}` : 'none',
                          borderBottom: i < 2 ? `1px solid ${tokens.colors.border}` : 'none',
                        }}>
                          <Typography sx={{ fontSize: 34, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {s.value}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: tokens.colors.textSec, mt: 0.75, fontWeight: 500 }}>
                            {s.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
