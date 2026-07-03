import { useState, useEffect } from 'react';
import {
    Grid, Box, Typography, Card, CardContent,
    Alert, CircularProgress, Chip,
    Select, MenuItem, FormControl, InputLabel
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
import organizationsApi from '../../api/organizationsApi';
import { useAuth } from '../../context/AuthContext';

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

            const [summaryRes, trendsRes, alertsRes] =
                await Promise.all([
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

    // Mount: resolve org
    useEffect(() => {
        const init = async () => {
            if (isAdmin()) {
                try {
                    const res = await organizationsApi.getAll();
                    setOrganizations(res.data);
                    if (res.data.length > 0) {
                        setSelectedOrgId(res.data[0].id);
                    } else {
                        setLoading(false);
                    }
                } catch {
                    setError('Failed to load organizations');
                    setLoading(false);
                }
            } else {
                const orgId = getOrgId();
                if (orgId) {
                    setSelectedOrgId(orgId);
                } else {
                    setOrgError(
                        'Your account is not assigned to an ' +
                        'organization. Contact your administrator.'
                    );
                    setLoading(false);
                }
            }
        };
        init();
    }, [user]);

    // Load data whenever selectedOrgId resolves
    useEffect(() => {
        if (selectedOrgId) {
            loadData(selectedOrgId);
        }
    }, [selectedOrgId]);

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

            {orgError && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {orgError}
                </Alert>
            )}

            {/* Admin org selector */}
            {isAdmin() && organizations.length > 0 && (
                <FormControl sx={{ mb: 3, minWidth: 280 }}>
                    <InputLabel>Organization</InputLabel>
                    <Select
                        value={selectedOrgId || ''}
                        label="Organization"
                        onChange={(e) =>
                            setSelectedOrgId(e.target.value)}>
                        {organizations.map((org) => (
                            <MenuItem key={org.id} value={org.id}>
                                {org.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

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
                                                    .replace(/_/g, ' ')}
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
