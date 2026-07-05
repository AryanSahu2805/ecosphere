import { useState, useEffect } from 'react';
import {
    Box, Card, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    Button, Alert, CircularProgress,
    Snackbar, Tooltip, Typography,
    Select, MenuItem, FormControl, InputLabel, Stack
} from '@mui/material';
import { Edit, Delete, DirectionsCar, Flight, Train, DirectionsBus } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { travelRecordsApi } from '../../api/carbonRecordsApi';

const TRANSPORT_MODES = ['CAR', 'FLIGHT', 'TRAIN', 'BUS'];
const DIALOG_ID = 'travel-dialog-title';

const MODE_CONFIG = {
    CAR:    { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: <DirectionsCar sx={{ fontSize: 14 }} /> },
    FLIGHT: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <Flight sx={{ fontSize: 14 }} /> },
    TRAIN:  { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: <Train sx={{ fontSize: 14 }} /> },
    BUS:    { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: <DirectionsBus sx={{ fontSize: 14 }} /> },
};

function ModeChip({ mode }) {
    const cfg = MODE_CONFIG[mode] || { color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', icon: null };
    return (
        <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.5, py: 0.5, borderRadius: 2,
            bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
            <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: cfg.color }}>
                {mode}
            </Typography>
        </Box>
    );
}

function Co2Chip({ value }) {
    const num = Number(value);
    if (num > 0) {
        return (
            <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                px: 1.5, py: 0.5, borderRadius: 2,
                bgcolor: '#F0FDF4', border: '1px solid #BBF7D0',
            }}>
                <Typography variant="caption" fontWeight={700} color="success.main">
                    🌱 {num.toFixed(4)} kg
                </Typography>
            </Box>
        );
    }
    return (
        <Box sx={{
            display: 'inline-flex', alignItems: 'center',
            px: 1.5, py: 0.5, borderRadius: 2,
            bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
        }}>
            <Typography variant="caption" fontWeight={500} color="text.secondary">
                0.0000 kg
            </Typography>
        </Box>
    );
}

function TravelRecordsPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({
        departmentId: '', distanceKm: '', transportMode: 'CAR', recordedDate: '', notes: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, record: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { isAdmin, isManager } = useAuth();

    const loadRecords = async () => {
        try {
            setLoading(true);
            const res = await travelRecordsApi.getAll();
            setRecords(res.data);
        } catch { setError('Failed to load travel records'); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setSelectedRecord(null);
        setFormData({ departmentId: '', distanceKm: '', transportMode: 'CAR', recordedDate: '', notes: '' });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            departmentId: record.departmentId, distanceKm: record.distanceKm,
            transportMode: record.transportMode, recordedDate: record.recordedDate, notes: record.notes || '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const handleSave = async () => {
        if (!formData.departmentId || !formData.distanceKm || !formData.recordedDate) {
            setFormError('Department ID, distance, and date are required');
            return;
        }
        setSaving(true);
        try {
            if (selectedRecord) {
                await travelRecordsApi.update(selectedRecord.id, formData);
                showSnackbar('Travel record updated');
            } else {
                await travelRecordsApi.create(formData);
                showSnackbar('Travel record created');
            }
            setDialogOpen(false);
            loadRecords();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to save record');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await travelRecordsApi.delete(deleteDialog.record.id);
            setDeleteDialog({ open: false, record: null });
            showSnackbar('Record deleted');
            loadRecords();
        } catch (err) {
            setDeleteDialog({ open: false, record: null });
            setSnackbar({ open: true, message: err.response?.data?.error || 'Cannot delete record', severity: 'error' });
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    useEffect(() => { loadRecords(); }, []);

    return (
        <Box>
            <PageHeader title="Travel Records" onAdd={openCreate}
                canAdd={isAdmin() || isManager()} addLabel="New Record" />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box textAlign="center" mt={4}><CircularProgress /></Box>
            ) : (
                <Card sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table aria-label="Travel records table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dept</TableCell>
                                    <TableCell>Transport Mode</TableCell>
                                    <TableCell>Distance</TableCell>
                                    <TableCell>CO₂ Emission</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">No travel records found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : records.map((rec) => (
                                    <TableRow key={rec.id} hover sx={{ cursor: 'default' }}>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: 2,
                                                bgcolor: '#F1F5F9', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                    {rec.departmentId}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <ModeChip mode={rec.transportMode} />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {Number(rec.distanceKm).toLocaleString()}
                                                <Typography component="span" variant="caption"
                                                    color="text.secondary" sx={{ ml: 0.5 }}>
                                                    km
                                                </Typography>
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Co2Chip value={rec.co2Emission} />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {rec.recordedDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 2 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                {(isAdmin() || isManager()) && (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" aria-label="Edit travel record"
                                                            onClick={() => openEdit(rec)}
                                                            sx={{
                                                                color: 'text.secondary',
                                                                '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB' },
                                                            }}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isAdmin() && (
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" aria-label="Delete travel record"
                                                            onClick={() => setDeleteDialog({ open: true, record: rec })}
                                                            sx={{
                                                                color: 'text.secondary',
                                                                '&:hover': { bgcolor: '#FEF2F2', color: '#DC2626' },
                                                            }}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {records.length > 0 && (
                        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider',
                                   bgcolor: '#F8FAFC' }}>
                            <Typography variant="caption" color="text.secondary">
                                {records.length} record{records.length !== 1 ? 's' : ''} total
                            </Typography>
                        </Box>
                    )}
                </Card>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}
                maxWidth="sm" fullWidth aria-labelledby={DIALOG_ID}>
                <DialogTitle id={DIALOG_ID}>
                    {selectedRecord ? 'Edit Travel Record' : 'New Travel Record'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2, pb: 1 }}>
                    {formError && <Alert severity="error" sx={{ mb: 2.5 }}>{formError}</Alert>}
                    <TextField fullWidth label="Department ID" name="departmentId"
                        type="number" value={formData.departmentId} onChange={handleChange}
                        required sx={{ mb: 2.5 }} inputProps={{ 'aria-label': 'Department ID' }} />
                    <TextField fullWidth label="Distance (km)" name="distanceKm"
                        type="number" inputProps={{ step: '0.01', 'aria-label': 'Distance km' }}
                        value={formData.distanceKm} onChange={handleChange} required sx={{ mb: 2.5 }} />
                    <FormControl fullWidth sx={{ mb: 2.5 }}>
                        <InputLabel id="transport-mode-label">Transport Mode</InputLabel>
                        <Select labelId="transport-mode-label" name="transportMode"
                            value={formData.transportMode} label="Transport Mode" onChange={handleChange}>
                            {TRANSPORT_MODES.map((m) => (
                                <MenuItem key={m} value={m}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Recorded Date" name="recordedDate"
                        type="date" value={formData.recordedDate} onChange={handleChange}
                        required InputLabelProps={{ shrink: true }} sx={{ mb: 2.5 }}
                        inputProps={{ 'aria-label': 'Recorded date' }} />
                    <Box sx={{ mt: 1 }}>
                        <TextField fullWidth label="Notes" name="notes"
                            value={formData.notes} onChange={handleChange} multiline rows={3}
                            sx={{ '& .MuiOutlinedInput-root': { alignItems: 'flex-start' } }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={deleteDialog.open} title="Delete Travel Record"
                message="Delete this travel record? This cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteDialog({ open: false, record: null })} />

            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default TravelRecordsPage;
