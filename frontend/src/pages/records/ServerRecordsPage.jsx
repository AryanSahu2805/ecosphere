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
import { serverRecordsApi } from '../../api/carbonRecordsApi';

const SERVER_TYPES = ['PHYSICAL', 'CLOUD', 'HYBRID'];

function ServerRecordsPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({
        departmentId: '', usageHours: '',
        serverType: 'CLOUD', recordedDate: '', notes: ''
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
            const res = await serverRecordsApi.getAll();
            setRecords(res.data);
        } catch {
            setError('Failed to load server usage records');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedRecord(null);
        setFormData({
            departmentId: '', usageHours: '',
            serverType: 'CLOUD', recordedDate: '', notes: ''
        });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            departmentId: record.departmentId,
            usageHours: record.usageHours,
            serverType: record.serverType,
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
        if (!formData.departmentId || !formData.usageHours
                || !formData.recordedDate) {
            setFormError(
                'Department ID, usage hours, and date are required');
            return;
        }
        setSaving(true);
        try {
            if (selectedRecord) {
                await serverRecordsApi.update(
                    selectedRecord.id, formData);
                showSnackbar('Server record updated');
            } else {
                await serverRecordsApi.create(formData);
                showSnackbar('Server record created');
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
            await serverRecordsApi.delete(
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
                title="Server Usage Records"
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
                                    <TableCell>Server Type</TableCell>
                                    <TableCell>Usage Hours</TableCell>
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
                                                No server usage records found
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
                                                {rec.serverType}
                                            </TableCell>
                                            <TableCell>
                                                {rec.usageHours}
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
                        ? 'Edit Server Record'
                        : 'New Server Record'}
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
                        fullWidth label="Usage Hours"
                        name="usageHours" type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.usageHours}
                        onChange={handleChange} required
                        sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Server Type</InputLabel>
                        <Select
                            name="serverType"
                            value={formData.serverType}
                            label="Server Type"
                            onChange={handleChange}>
                            {SERVER_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
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
                title="Delete Server Record"
                message="Delete this server usage record? This cannot be undone."
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

export default ServerRecordsPage;
