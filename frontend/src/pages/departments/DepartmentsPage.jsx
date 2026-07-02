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
import departmentsApi from '../../api/departmentsApi';

function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        locationId: '', name: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false, dept: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });
    const { isAdmin } = useAuth();

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const res = await departmentsApi.getAll();
            setDepartments(res.data);
        } catch {
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedDept(null);
        setFormData({ locationId: '', name: '' });
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (dept) => {
        setSelectedDept(dept);
        setFormData({
            locationId: dept.locationId,
            name: dept.name,
        });
        setFormError('');
        setDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSave = async () => {
        if (!formData.locationId || !formData.name.trim()) {
            setFormError('Location ID and name are required');
            return;
        }
        setSaving(true);
        try {
            if (selectedDept) {
                await departmentsApi.update(
                    selectedDept.id, formData);
                showSnackbar('Department updated');
            } else {
                await departmentsApi.create(formData);
                showSnackbar('Department created');
            }
            setDialogOpen(false);
            loadDepartments();
        } catch (err) {
            setFormError(
                err.response?.data?.error
                || 'Failed to save department');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await departmentsApi.delete(deleteDialog.dept.id);
            setDeleteDialog({ open: false, dept: null });
            showSnackbar('Department deleted');
            loadDepartments();
        } catch (err) {
            setDeleteDialog({ open: false, dept: null });
            setSnackbar({
                open: true,
                message: err.response?.data?.error
                         || 'Cannot delete department',
                severity: 'error'
            });
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({
            ...prev, [e.target.name]: e.target.value
        }));

    useEffect(() => { loadDepartments(); }, []);

    return (
        <Box>
            <PageHeader
                title="Departments"
                onAdd={openCreate}
                canAdd={isAdmin()}
                addLabel="New Department"
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
                                    <TableCell>Location ID</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {departments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography color="text.secondary">
                                                No departments found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    departments.map((dept) => (
                                        <TableRow key={dept.id} hover
                                            sx={{ cursor: 'default' }}>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {dept.name}
                                            </TableCell>
                                            <TableCell>
                                                {dept.locationId}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(dept.createdAt)
                                                    .toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {isAdmin() && (
                                                    <>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    openEdit(dept)}>
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
                                                                        dept
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
                    {selectedDept ? 'Edit Department' : 'New Department'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Location ID"
                        name="locationId"
                        type="number"
                        value={formData.locationId}
                        onChange={handleChange}
                        required
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Department Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
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
                title="Delete Department"
                message={`Delete "${deleteDialog.dept?.name}"? This will fail if carbon records exist.`}
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteDialog({ open: false, dept: null })}
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

export default DepartmentsPage;
