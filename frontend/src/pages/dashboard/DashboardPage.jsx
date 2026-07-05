import { useState, useEffect } from 'react';
import {
    Grid, Box, Typography, Card, CardContent,
    Alert, CircularProgress, Chip,
    Select, MenuItem, FormControl
} from '@mui/material';
import {
    BoltOutlined, FlightTakeoff, Storage, EnergySavingsLeaf
} from '@mui/icons-material';
import {
    ResponsiveContainer, ComposedChart, Bar, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import analyticsApi from '../../api/analyticsApi';
import alertsApi from '../../api/alertsApi';
import organizationsApi from '../../api/organizationsApi';
import { useAuth } from '../../context/AuthContext';

const ALERT_CHIP_COLOR = (severity) => {
    if (severity === 'HIGH' || severity === 'CRITICAL') return 'error';
    if (severity === 'MEDIUM') return 'warning';
    return 'default';
};

function DashboardPage() {
    const { user, isAdmin, getOrgId } = useAuth();

    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orgError, setOrgError] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [organizations, setOrganizations] = useState([]);

    const loadData = async (orgId) => {
        try {
            setLoading(true);
            setError('');
            const year = new Date().getFullYear();
            const from = `${year}-01-01`;
            const to = `${year}-12-31`;
            const [summaryRes, trendsRes, alertsRes] = await Promise.all([
                analyticsApi.getSummary(orgId, from, to),
                analyticsApi.getTrends(orgId, year),
                alertsApi.getActive(orgId),
            ]);
            setSummary(summaryRes.data);
            setTrends(trendsRes.data);
            setRecentAlerts(alertsRes.data.slice(0, 5));
        } catch {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (isAdmin()) {
                try {
                    const res = await organizationsApi.getAll();
                    setOrganizations(res.data);
                    if (res.data.length > 0) setSelectedOrgId(res.data[0].id);
                    else setLoading(false);
                } catch {
                    setError('Failed to load organizations');
                    setLoading(false);
                }
            } else {
                const orgId = getOrgId();
                if (orgId) {
                    setSelectedOrgId(orgId);
                } else {
                    setOrgError('Your account is not assigned to an organization. Contact your administrator.');
                    setLoading(false);
                }
            }
        };
        init();
    }, [user]);

    useEffect(() => {
        if (selectedOrgId) loadData(selectedOrgId);
    }, [selectedOrgId]);

    const year = new Date().getFullYear();

    const pieData = summary ? [
        { name: 'Energy', value: Number(summary.totalEnergyEmissions), color: '#F59E0B' },
        { name: 'Travel', value: Number(summary.totalTravelEmissions), color: '#3B82F6' },
        { name: 'Server', value: Number(summary.totalServerEmissions), color: '#8B5CF6' },
    ].filter(d => d.value > 0) : [];

    const statCards = summary ? [
        {
            title: 'Total Emissions', color: '#16A34A',
            value: `${Number(summary.totalEmissions).toFixed(2)} kg`,
            icon: <EnergySavingsLeaf />,
        },
        {
            title: 'Energy', color: '#F59E0B',
            value: `${Number(summary.totalEnergyEmissions).toFixed(2)} kg`,
            icon: <BoltOutlined />,
        },
        {
            title: 'Travel', color: '#3B82F6',
            value: `${Number(summary.totalTravelEmissions).toFixed(2)} kg`,
            icon: <FlightTakeoff />,
        },
        {
            title: 'Server', color: '#8B5CF6',
            value: `${Number(summary.totalServerEmissions).toFixed(2)} kg`,
            icon: <Storage />,
        },
    ] : [];

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {year} emissions overview
                </Typography>
            </Box>

            {orgError && (
                <Alert severity="warning" sx={{ mb: 3 }}>{orgError}</Alert>
            )}

            {isAdmin() && organizations.length > 0 && (
                <Box sx={{
                    mb: 4,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    minWidth: 320,
                }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                        Viewing organization
                    </Typography>
                    <FormControl fullWidth>
                        <Select value={selectedOrgId || ''} displayEmpty
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            sx={{ fontWeight: 600 }}>
                            {organizations.map((org) => (
                                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}

            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && summary && (
                <Grid container spacing={3}>
                    {/* Row 1 — stat cards */}
                    {statCards.map((s) => (
                        <Grid item xs={12} sm={6} md={3} key={s.title}>
                            <StatCard
                                title={s.title} value={s.value}
                                color={s.color} icon={s.icon}
                            />
                        </Grid>
                    ))}

                    {/* Row 2 — pie + bar chart */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={0.5}>
                                    Emission Breakdown
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    By source type — {year}
                                </Typography>
                                {pieData.length === 0 ? (
                                    <Box mt={3} textAlign="center">
                                        <Typography color="text.secondary" variant="body2">
                                            No emissions recorded yet
                                        </Typography>
                                        <Typography color="text.secondary" variant="caption">
                                            Add carbon records to see breakdown
                                        </Typography>
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%"
                                                innerRadius={55} outerRadius={90}
                                                paddingAngle={3} dataKey="value">
                                                {pieData.map(entry => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => [`${Number(v).toFixed(4)} kg CO₂`, '']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Monthly Trends
                                </Typography>
                                {trends.length === 0 ? (
                                    <Box textAlign="center" py={6}>
                                        <Typography color="text.secondary">
                                            No trend data for {year}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={trends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                            <XAxis dataKey="monthName"
                                                tick={{ fontSize: 11, fill: '#64748B' }}
                                                axisLine={false} tickLine={false} />
                                            <YAxis unit=" kg"
                                                tick={{ fontSize: 11, fill: '#64748B' }}
                                                axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 12,
                                                    border: '1px solid #E2E8F0',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                }}
                                                formatter={(v) => [`${Number(v).toFixed(4)} kg CO₂`, '']}
                                            />
                                            <Legend />
                                            <Bar dataKey="energyEmissions" name="Energy"
                                                fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                            <Bar dataKey="travelEmissions" name="Travel"
                                                fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                            <Bar dataKey="serverEmissions" name="Server"
                                                fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                            <Line type="monotone" dataKey="totalEmissions" name="Total"
                                                stroke="#16A34A" strokeWidth={2.5}
                                                dot={{ r: 4, fill: '#16A34A' }}
                                                activeDot={{ r: 6 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Row 3 — alerts + record counts */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Active Alerts
                                </Typography>
                                {recentAlerts.length === 0 ? (
                                    <Typography color="text.secondary" variant="body2">
                                        No active alerts — all clear ✓
                                    </Typography>
                                ) : (
                                    recentAlerts.map((alert) => (
                                        <Box key={alert.id} mb={1.5}>
                                            <Chip
                                                label={alert.alertType.replace(/_/g, ' ')}
                                                color={ALERT_CHIP_COLOR(alert.severity)}
                                                size="small" sx={{ mr: 1 }}
                                            />
                                            <Typography variant="body2" component="span"
                                                color="text.secondary">
                                                {alert.message.substring(0, 60)}…
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Record Summary — {year}
                                </Typography>
                                <Box display="flex" gap={4}>
                                    {[
                                        { label: 'Energy Records', count: summary.energyRecordCount, color: '#F59E0B' },
                                        { label: 'Travel Records', count: summary.travelRecordCount, color: '#3B82F6' },
                                        { label: 'Server Records', count: summary.serverRecordCount, color: '#8B5CF6' },
                                    ].map(({ label, count, color }) => (
                                        <Box key={label}>
                                            <Typography variant="h4" fontWeight={700}
                                                sx={{ color }}>
                                                {count}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default DashboardPage;
