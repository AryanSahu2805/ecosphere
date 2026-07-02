import { useState, useEffect } from 'react';
import {
    Box, Card, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    Button, Alert, CircularProgress,
    Snackbar, Tooltip, Chip, Typography,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { travelRecordsApi } from '../../api/carbonRecordsApi';

const TRANSPORT_MODES = ['CAR', 'FLIGHT', 'TRAIN', 'BUS'];

function TravelRecordsPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({
        departmentId: '', distanceKm: '',
        transportMode: 'CAR', recordedDate: '', notes: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false, record: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });
    const { isAdmin, isManager } = useAuth();

    const loadRecords = async () => {
        try {
            setLoading(true);
            const res = await travelRecordsApi.getAll();
            setRecords(res.data);
        } catch {
            setError('Failed to load travel records');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedRecord(null);
        setFormData({
            departmentId: '', distanceKm: '',
            transportMode: 'CAR', recordedDate: '', notes: ''
        });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            departmentId: record.departmentId,
            distanceKm: record.distanceKm,
            transportMode: record.transportMode,
            recordedDate: record.recordedDate,
            notes: record.notes || '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSave = async () => {
        if (!formData.departmentId || !formData.distanceKm
                || !formData.recordedDate) {
            setFormError(
                'Department ID, distance, and date are required');
            return;
        }
        setSaving(true);
        try {
            if (selectedRecord) {
                await travelRecordsApi.update(
                    selectedRecord.id, formData);
                showSnackbar('Travel record updated');
            } else {
                await travelRecordsApi.create(formData);
                showSnackbar('Travel record created');
            }
            setDialogOpen(false);
            loadRecords();
        } catch (err) {
            setFormError(
                err.response?.data?.error
                || 'Failed to save record');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await travelRecordsApi.delete(
                deleteDialog.record.id);
            setDeleteDialog({ open: false, record: null });
            showSnackbar('Record deleted');
            loadRecords();
        } catch (err) {
            setDeleteDialog({ open: false, record: null });
            setSnackbar({
                open: true,
                message: err.response?.data?.error
                         || 'Cannot delete record',
                severity: 'error'
            });
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({
            ...prev, [e.target.name]: e.target.value
        }));

    useEffect(() => { loadRecords(); }, []);

    return (
        <Box>
            <PageHeader
                title="Travel Records"
                onAdd={openCreate}
                canAdd={isAdmin() || isManager()}
                addLabel="New Record"
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
            ) : (
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dept ID</TableCell>
                                    <TableCell>Mode</TableCell>
                                    <TableCell>Distance (km)</TableCell>
                                    <TableCell>CO2 Emission (kg)</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}
                                            align="center">
                                            <Typography
                                                color="text.secondary">
                                                No travel records found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.map((rec) => (
                                        <TableRow key={rec.id} hover
                                            sx={{ cursor: 'default' }}>
                                            <TableCell>
                                                {rec.departmentId}
                                            </TableCell>
                                            <TableCell>
                                                {rec.transportMode}
                                            </TableCell>
                                            <TableCell>
                                                {rec.distanceKm}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={rec.co2Emission}
                                                    size="small"
                                                    color={
                                                        rec.co2Emission > 0
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {rec.recordedDate}
                                            </TableCell>
                                            <TableCell align="right">
                                                {(isAdmin() || isManager()) && (
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                openEdit(rec)}>
                                                            <Edit
                                                                fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isAdmin() && (
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                setDeleteDialog({
                                                                    open: true,
                                                                    record: rec
                                                                })}>
                                                            <Delete
                                                                fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            <Dialog open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedRecord
                        ? 'Edit Travel Record'
                        : 'New Travel Record'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth label="Department ID"
                        name="departmentId" type="number"
                        value={formData.departmentId}
                        onChange={handleChange} required
                        sx={{ mt: 1, mb: 2 }} />
                    <TextField
                        fullWidth label="Distance (km)"
                        name="distanceKm" type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.distanceKm}
                        onChange={handleChange} required
                        sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Transport Mode</InputLabel>
                        <Select
                            name="transportMode"
                            value={formData.transportMode}
                            label="Transport Mode"
                            onChange={handleChange}>
                            {TRANSPORT_MODES.map((m) => (
                                <MenuItem key={m} value={m}>
                                    {m}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth label="Recorded Date"
                        name="recordedDate" type="date"
                        value={formData.recordedDate}
                        onChange={handleChange} required
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }} />
                    <TextField
                        fullWidth label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        multiline rows={2} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained"
                        onClick={handleSave} disabled={saving}>
                        {saving
                            ? <CircularProgress size={20} />
                            : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Travel Record"
                message="Delete this travel record? This cannot be undone."
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteDialog({ open: false, record: null })} />

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

export default TravelRecordsPage;
