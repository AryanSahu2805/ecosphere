import { useState, useEffect } from 'react';
import {
    Grid, Box, Typography, Card, CardContent,
    Alert, CircularProgress, Chip
} from '@mui/material';
import {
    BoltOutlined, FlightTakeoff, Storage,
    EnergySavingsLeaf
} from '@mui/icons-material';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import analyticsApi from '../../api/analyticsApi';
import alertsApi from '../../api/alertsApi';
import { useAuth } from '../../context/AuthContext';

function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async (orgId) => {
        try {
            setLoading(true);
            const year = new Date().getFullYear();
            const from = `${year}-01-01`;
            const to = `${year}-12-31`;

            const [summaryRes, trendsRes, alertsRes] =
                await Promise.all([
                    analyticsApi.getSummary(orgId, from, to),
                    analyticsApi.getTrends(orgId, year),
                    alertsApi.getActive(orgId),
                ]);

            setSummary(summaryRes.data);
            setTrends(trendsRes.data);
            setRecentAlerts(alertsRes.data.slice(0, 5));
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const orgId = user?.organizationId || 1;
        loadData(orgId);
    }, [user]);

    const year = new Date().getFullYear();

    const alertChipColor = (severity) => {
        if (severity === 'HIGH' || severity === 'CRITICAL')
            return 'error';
        if (severity === 'MEDIUM') return 'warning';
        return 'default';
    };

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h5" fontWeight={600}>
                    Dashboard
                </Typography>
                <Typography variant="body2"
                    color="text.secondary">
                    {year} emissions overview
                </Typography>
            </Box>

            {loading && (
                <Box display="flex" justifyContent="center"
                    alignItems="center" minHeight={300}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && summary && (
                <Grid container spacing={3}>
                    {/* Row 1 — stat cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Emissions"
                            value={summary.totalEmissions + ' kg'}
                            color="primary.main"
                            icon={<EnergySavingsLeaf />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Energy Emissions"
                            value={summary.totalEnergyEmissions + ' kg'}
                            color="warning.main"
                            icon={<BoltOutlined />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Travel Emissions"
                            value={summary.totalTravelEmissions + ' kg'}
                            color="secondary.main"
                            icon={<FlightTakeoff />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Server Emissions"
                            value={summary.totalServerEmissions + ' kg'}
                            color="info.main"
                            icon={<Storage />}
                        />
                    </Grid>

                    {/* Row 2 — chart + alerts */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" mb={2}>
                                    Monthly Trends
                                </Typography>
                                <ResponsiveContainer
                                    width="100%" height={300}>
                                    <LineChart data={trends}>
                                        <CartesianGrid
                                            strokeDasharray="3 3" />
                                        <XAxis dataKey="monthName" />
                                        <YAxis unit=" kg" />
                                        <Tooltip
                                            formatter={(v) =>
                                                v + ' kg CO2'} />
                                        <Legend />
                                        <Line
                                            dataKey="energyEmissions"
                                            stroke="#F57C00"
                                            name="Energy" />
                                        <Line
                                            dataKey="travelEmissions"
                                            stroke="#1565C0"
                                            name="Travel" />
                                        <Line
                                            dataKey="serverEmissions"
                                            stroke="#7B1FA2"
                                            name="Server" />
                                        <Line
                                            dataKey="totalEmissions"
                                            stroke="#2E7D32"
                                            name="Total"
                                            strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" mb={2}>
                                    Active Alerts
                                </Typography>
                                {recentAlerts.length === 0 ? (
                                    <Typography
                                        color="text.secondary">
                                        No active alerts
                                    </Typography>
                                ) : (
                                    recentAlerts.map((alert) => (
                                        <Box key={alert.id} mb={1}>
                                            <Chip
                                                label={alert.alertType
                                                    .replace('_', ' ')}
                                                color={alertChipColor(
                                                    alert.severity)}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography
                                                variant="body2"
                                                component="span">
                                                {alert.message
                                                    .substring(0, 60)}
                                                ...
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Row 3 — record counts */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" mb={2}>
                                    Record Summary — {year}
                                </Typography>
                                <Box display="flex" gap={4}>
                                    <Box>
                                        <Typography variant="h4"
                                            color="primary">
                                            {summary.energyRecordCount}
                                        </Typography>
                                        <Typography variant="body2"
                                            color="text.secondary">
                                            Energy Records
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4"
                                            color="primary">
                                            {summary.travelRecordCount}
                                        </Typography>
                                        <Typography variant="body2"
                                            color="text.secondary">
                                            Travel Records
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4"
                                            color="primary">
                                            {summary.serverRecordCount}
                                        </Typography>
                                        <Typography variant="body2"
                                            color="text.secondary">
                                            Server Records
                                        </Typography>
                                    </Box>
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
