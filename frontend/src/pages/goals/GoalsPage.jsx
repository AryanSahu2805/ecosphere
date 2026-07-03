import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Chip,
    Button, Alert, CircularProgress, LinearProgress,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Snackbar,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import goalsApi from '../../api/goalsApi';

const METRICS = [
    'TOTAL_EMISSIONS',
    'ENERGY_EMISSIONS',
    'TRAVEL_EMISSIONS',
    'SERVER_EMISSIONS',
];

const statusColor = (status) => {
    switch (status) {
        case 'ACTIVE':     return 'primary';
        case 'ACHIEVED':   return 'success';
        case 'MISSED':     return 'error';
        case 'CANCELLED':  return 'default';
        default:           return 'default';
    }
};

function GoalsPage() {
    const { isAdmin, isManager, getOrgId } = useAuth();

    const getEffectiveOrgId = () => {
        if (isAdmin()) return 1;
        const orgId = getOrgId();
        return orgId || null;
    };

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        organizationId: getOrgId() || '',
        targetMetric: 'TOTAL_EMISSIONS',
        targetValue: '',
        deadline: '',
        description: '',
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [cancelDialog, setCancelDialog] = useState({
        open: false, goalId: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });

    const showSnackbar = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const loadGoals = async () => {
        const orgId = getEffectiveOrgId();
        if (!orgId) {
            setError('No organization assigned to your account.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await goalsApi.getByOrganization(orgId);
            const goalsData = res.data;
            setGoals(goalsData);

            const progressResults = await Promise.all(
                goalsData.map((g) => goalsApi.getProgress(g.id))
            );
            const progressMap = {};
            progressResults.forEach((r, i) => {
                progressMap[goalsData[i].id] = r.data;
            });
            setProgress(progressMap);
        } catch {
            setError('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setFormData({
            organizationId: getEffectiveOrgId() || '',
            targetMetric: 'TOTAL_EMISSIONS',
            targetValue: '',
            deadline: '',
            description: '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const handleCreate = async () => {
        if (!formData.targetValue || !formData.deadline) {
            setFormError('Target value and deadline are required');
            return;
        }
        setSaving(true);
        try {
            await goalsApi.create(formData);
            showSnackbar('Goal created');
            setDialogOpen(false);
            loadGoals();
        } catch (err) {
            setFormError(
                err.response?.data?.error
                || 'Failed to create goal');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        try {
            await goalsApi.cancel(cancelDialog.goalId);
            setCancelDialog({ open: false, goalId: null });
            showSnackbar('Goal cancelled');
            loadGoals();
        } catch (err) {
            setCancelDialog({ open: false, goalId: null });
            showSnackbar(
                err.response?.data?.error
                    || 'Cannot cancel goal',
                'error'
            );
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({
            ...prev, [e.target.name]: e.target.value
        }));

    useEffect(() => { loadGoals(); }, []);

    return (
        <Box>
            <PageHeader
                title="Sustainability Goals"
                onAdd={openCreate}
                canAdd={isAdmin() || isManager()}
                addLabel="New Goal"
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : goals.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary"
                            textAlign="center">
                            No sustainability goals found
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                goals.map((goal) => {
                    const p = progress[goal.id];
                    return (
                        <Card key={goal.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Box display="flex"
                                    justifyContent="space-between"
                                    alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6">
                                            {goal.description
                                                || goal.targetMetric
                                                    .replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            Target: {goal.targetValue} kg CO2
                                            {' '}by {goal.deadline}
                                        </Typography>
                                    </Box>
                                    <Box display="flex"
                                        gap={1}
                                        alignItems="center">
                                        <Chip
                                            label={goal.status}
                                            color={statusColor(goal.status)}
                                            size="small"
                                        />
                                        {isAdmin()
                                            && goal.status === 'ACTIVE'
                                            && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    setCancelDialog({
                                                        open: true,
                                                        goalId: goal.id
                                                    })}>
                                                Cancel
                                            </Button>
                                        )}
                                    </Box>
                                </Box>

                                {p && (
                                    <Box mt={2}>
                                        <Box display="flex"
                                            justifyContent="space-between"
                                            mb={0.5}>
                                            <Typography variant="body2">
                                                Current: {p.currentValue} kg CO2
                                            </Typography>
                                            <Typography variant="body2">
                                                {p.progressPercentage}% complete
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(
                                                Number(p.progressPercentage),
                                                100
                                            )}
                                            color={p.onTrack
                                                ? 'success'
                                                : 'warning'}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4
                                            }}
                                        />
                                        <Box display="flex"
                                            justifyContent="space-between"
                                            mt={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary">
                                                Baseline: {p.baselineValue} kg CO2
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color={p.daysRemaining < 0
                                                    ? 'error.main'
                                                    : 'text.secondary'}>
                                                {p.daysRemaining < 0
                                                    ? `${Math.abs(p.daysRemaining)} days overdue`
                                                    : `${p.daysRemaining} days remaining`}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color={p.onTrack
                                                    ? 'success.main'
                                                    : 'warning.main'}>
                                                {p.onTrack
                                                    ? '✓ On track'
                                                    : '⚠ Behind schedule'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            )}

            {/* Create dialog */}
            <Dialog open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm" fullWidth>
                <DialogTitle>New Sustainability Goal</DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    {!isManager() && (
                        <TextField
                            fullWidth
                            label="Organization ID"
                            name="organizationId"
                            type="number"
                            value={formData.organizationId}
                            onChange={handleChange}
                            required
                            sx={{ mt: 1, mb: 2 }}
                        />
                    )}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Target Metric</InputLabel>
                        <Select
                            name="targetMetric"
                            value={formData.targetMetric}
                            label="Target Metric"
                            onChange={handleChange}>
                            {METRICS.map((m) => (
                                <MenuItem key={m} value={m}>
                                    {m.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Target Value (kg CO2)"
                        name="targetValue"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.targetValue}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        multiline
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained"
                        onClick={handleCreate}
                        disabled={saving}>
                        {saving
                            ? <CircularProgress size={20} />
                            : 'Create Goal'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel confirmation */}
            <ConfirmDialog
                open={cancelDialog.open}
                title="Cancel Goal"
                message="Are you sure you want to cancel this goal? This cannot be undone."
                onConfirm={handleCancel}
                onCancel={() =>
                    setCancelDialog({ open: false, goalId: null })}
                confirmLabel="Cancel Goal"
                confirmColor="error"
            />

            {/* Snackbar */}
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

export default GoalsPage;
