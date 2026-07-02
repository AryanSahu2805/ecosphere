import { useState, useEffect } from 'react';
import {
    Box, Card, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    Button, Alert, CircularProgress,
    Snackbar, Tooltip, Chip, Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import organizationsApi from '../../api/organizationsApi';

function OrganizationsPage() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [formData, setFormData] = useState({
        name: '', industry: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false, org: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });
    const { isAdmin } = useAuth();

    const loadOrgs = async () => {
        try {
            setLoading(true);
            const res = await organizationsApi.getAll();
            setOrgs(res.data);
        } catch {
            setError('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedOrg(null);
        setFormData({ name: '', industry: '' });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (org) => {
        setSelectedOrg(org);
        setFormData({ name: org.name,
                      industry: org.industry || '' });
        setFormError('');
        setDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setFormError('Organization name is required');
            return;
        }
        setSaving(true);
        try {
            if (selectedOrg) {
                await organizationsApi.update(
                    selectedOrg.id, formData);
                showSnackbar('Organization updated');
            } else {
                await organizationsApi.create(formData);
                showSnackbar('Organization created');
            }
            setDialogOpen(false);
            loadOrgs();
        } catch (err) {
            setFormError(
                err.response?.data?.error
                || 'Failed to save organization');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await organizationsApi.delete(
                deleteDialog.org.id);
            setDeleteDialog({ open: false, org: null });
            showSnackbar('Organization deleted');
            loadOrgs();
        } catch (err) {
            setDeleteDialog({ open: false, org: null });
            setSnackbar({
                open: true,
                message: err.response?.data?.error
                         || 'Cannot delete organization',
                severity: 'error'
            });
        }
    };

    useEffect(() => { loadOrgs(); }, []);

    return (
        <Box>
            <PageHeader
                title="Organizations"
                onAdd={openCreate}
                canAdd={isAdmin()}
                addLabel="New Organization"
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
                                    <TableCell>
                                        Organization Name
                                    </TableCell>
                                    <TableCell>
                                        Industry
                                    </TableCell>
                                    <TableCell>
                                        Created
                                    </TableCell>
                                    <TableCell align="right">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orgs.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            align="center">
                                            <Typography
                                                color="text.secondary">
                                                No organizations found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orgs.map((org) => (
                                        <TableRow
                                            key={org.id}
                                            hover
                                            sx={{ cursor: 'default' }}>
                                            <TableCell
                                                sx={{ fontWeight: 500 }}>
                                                {org.name}
                                            </TableCell>
                                            <TableCell>
                                                {org.industry
                                                    ? <Chip
                                                        label={org.industry}
                                                        size="small"
                                                        variant="outlined" />
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(org.createdAt)
                                                    .toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {isAdmin() && (
                                                    <>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    openEdit(org)}>
                                                                <Edit
                                                                    fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() =>
                                                                    setDeleteDialog({
                                                                        open: true,
                                                                        org
                                                                    })}>
                                                                <Delete
                                                                    fontSize="small" />
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

            {/* Create / Edit dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth>
                <DialogTitle>
                    {selectedOrg
                        ? 'Edit Organization'
                        : 'New Organization'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error"
                            sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Organization Name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                        required
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Industry"
                        value={formData.industry}
                        onChange={(e) =>
                            setFormData(prev => ({
                                ...prev,
                                industry: e.target.value
                            }))}
                        placeholder="e.g. Technology, Manufacturing"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}>
                        {saving
                            ? <CircularProgress size={20} />
                            : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Organization"
                message={`Delete "${deleteDialog.org?.name}"? This will fail if locations exist.`}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteDialog({ open: false, org: null })}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(prev => ({
                        ...prev, open: false
                    }))}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
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

export default OrganizationsPage;
