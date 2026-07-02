import { useState, useEffect } from 'react';
import {
    Box, Card, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    Button, Alert, CircularProgress,
    Snackbar, Tooltip, Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import locationsApi from '../../api/locationsApi';

function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        organizationId: '', name: '', address: '', country: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false, location: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });
    const { isAdmin } = useAuth();

    const loadLocations = async () => {
        try {
            setLoading(true);
            const res = await locationsApi.getAll();
            setLocations(res.data);
        } catch {
            setError('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedLocation(null);
        setFormData({ organizationId: '', name: '',
                      address: '', country: '' });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (loc) => {
        setSelectedLocation(loc);
        setFormData({
            organizationId: loc.organizationId,
            name: loc.name,
            address: loc.address || '',
            country: loc.country || '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSave = async () => {
        if (!formData.organizationId || !formData.name.trim()) {
            setFormError('Organization ID and name are required');
            return;
        }
        setSaving(true);
        try {
            if (selectedLocation) {
                await locationsApi.update(
                    selectedLocation.id, formData);
                showSnackbar('Location updated');
            } else {
                await locationsApi.create(formData);
                showSnackbar('Location created');
            }
            setDialogOpen(false);
            loadLocations();
        } catch (err) {
            setFormError(
                err.response?.data?.error
                || 'Failed to save location');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await locationsApi.delete(deleteDialog.location.id);
            setDeleteDialog({ open: false, location: null });
            showSnackbar('Location deleted');
            loadLocations();
        } catch (err) {
            setDeleteDialog({ open: false, location: null });
            setSnackbar({
                open: true,
                message: err.response?.data?.error
                         || 'Cannot delete location',
                severity: 'error'
            });
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({
            ...prev, [e.target.name]: e.target.value
        }));

    useEffect(() => { loadLocations(); }, []);

    return (
        <Box>
            <PageHeader
                title="Locations"
                onAdd={openCreate}
                canAdd={isAdmin()}
                addLabel="New Location"
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
                                    <TableCell>Name</TableCell>
                                    <TableCell>Organization ID</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {locations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="text.secondary">
                                                No locations found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    locations.map((loc) => (
                                        <TableRow key={loc.id} hover
                                            sx={{ cursor: 'default' }}>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {loc.name}
                                            </TableCell>
                                            <TableCell>
                                                {loc.organizationId}
                                            </TableCell>
                                            <TableCell>
                                                {loc.country || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {loc.address || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(loc.createdAt)
                                                    .toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {isAdmin() && (
                                                    <>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    openEdit(loc)}>
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() =>
                                                                    setDeleteDialog({
                                                                        open: true,
                                                                        location: loc
                                                                    })}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
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
                    {selectedLocation ? 'Edit Location' : 'New Location'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
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
                    <TextField
                        fullWidth
                        label="Location Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained"
                        onClick={handleSave}
                        disabled={saving}>
                        {saving
                            ? <CircularProgress size={20} />
                            : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Location"
                message={`Delete "${deleteDialog.location?.name}"? This will fail if departments exist.`}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteDialog({ open: false, location: null })}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{
                    vertical: 'bottom', horizontal: 'center'
                }}>
                <Alert
                    severity={snackbar.severity}
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

export default LocationsPage;
