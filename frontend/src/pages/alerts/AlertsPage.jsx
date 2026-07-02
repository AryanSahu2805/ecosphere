import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography,
    Chip, Button, Alert, CircularProgress, Snackbar
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import alertsApi from '../../api/alertsApi';

const alertTypeLabel = (type) => {
    switch (type) {
        case 'GOAL_MISSED':    return 'Goal Missed';
        case 'GOAL_AT_RISK':   return 'Goal At Risk';
        case 'EMISSION_SPIKE': return 'Emission Spike';
        default:               return type;
    }
};

const alertTypeColor = (type) => {
    switch (type) {
        case 'GOAL_MISSED':    return 'error';
        case 'GOAL_AT_RISK':   return 'warning';
        case 'EMISSION_SPIKE': return 'warning';
        default:               return 'default';
    }
};

const severityColor = (severity) => {
    if (severity === 'HIGH' || severity === 'CRITICAL')
        return 'error';
    if (severity === 'MEDIUM') return 'warning';
    return 'default';
};

function AlertsPage() {
    const { user, isAdmin, isManager } = useAuth();
    const orgId = user?.organizationId || 1;

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const res = await alertsApi.getByOrganization(orgId);
            setAlerts(res.data);
        } catch {
            setError('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (alertId) => {
        try {
            await alertsApi.resolve(alertId);
            setSnackbar({
                open: true,
                message: 'Alert resolved',
                severity: 'success'
            });
            loadAlerts();
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.response?.data?.error
                         || 'Failed to resolve alert',
                severity: 'error'
            });
        }
    };

    const filteredAlerts = filter === 'active'
        ? alerts.filter((a) => !a.resolved)
        : alerts;

    useEffect(() => { loadAlerts(); }, []);

    return (
        <Box>
            <PageHeader title="Alerts" canAdd={false} />

            <Box display="flex" gap={1} mb={2}>
                <Chip
                    label="All Alerts"
                    variant={filter === 'all' ? 'filled' : 'outlined'}
                    onClick={() => setFilter('all')}
                    clickable
                />
                <Chip
                    label="Active Only"
                    variant={
                        filter === 'active' ? 'filled' : 'outlined'
                    }
                    color="error"
                    onClick={() => setFilter('active')}
                    clickable
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : filteredAlerts.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary"
                            textAlign="center">
                            No alerts found
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                filteredAlerts.map((alert) => (
                    <Card key={alert.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex"
                                justifyContent="space-between"
                                alignItems="flex-start">
                                <Box flex={1}>
                                    <Box display="flex" gap={1} mb={1}>
                                        <Chip
                                            label={alertTypeLabel(
                                                alert.alertType)}
                                            color={alertTypeColor(
                                                alert.alertType)}
                                            size="small"
                                        />
                                        <Chip
                                            label={alert.severity}
                                            size="small"
                                            variant="outlined"
                                            color={severityColor(
                                                alert.severity)}
                                        />
                                    </Box>
                                    <Typography variant="body1">
                                        {alert.message}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary">
                                        {new Date(alert.createdAt)
                                            .toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box ml={2}>
                                    {alert.resolved ? (
                                        <Chip
                                            label="Resolved"
                                            color="success"
                                            size="small"
                                        />
                                    ) : (isAdmin() || isManager()) && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() =>
                                                handleResolve(alert.id)}>
                                            Resolve
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{
                    vertical: 'bottom', horizontal: 'center'
                }}>
                <Alert severity={snackbar.severity}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev, open: false
                        }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AlertsPage;
