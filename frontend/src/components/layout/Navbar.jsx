import { useState } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography,
    Box, Avatar, Tooltip, Menu, MenuItem,
    ListItemIcon, ListItemText, Divider,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Button, Snackbar, Alert, Chip
} from '@mui/material';
import { Menu as MenuIcon, EnergySavingsLeaf, Person, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleOpenProfile = () => {
        setEditName(user?.name || '');
        setAnchorEl(null);
        setProfileOpen(true);
    };

    const handleSaveName = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setProfileOpen(false);
            setSnackbar({
                open: true,
                message: 'Profile updated successfully',
                severity: 'success',
            });
        }, 800);
    };

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
        navigate('/login');
    };

    return (
        <>
            <AppBar position="fixed" elevation={0} sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
            }}>
                <Toolbar>
                    <IconButton
                        color="inherit" edge="start"
                        onClick={onMenuClick}
                        aria-label="Open navigation menu"
                        sx={{ mr: 2, display: { md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EnergySavingsLeaf color="primary" />
                        <Typography variant="h6" fontWeight={700} color="primary">
                            EcoSphere
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />

                    <Tooltip title="Profile & Settings">
                        <Avatar
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            aria-label="Open profile menu"
                            aria-haspopup="true"
                            aria-expanded={Boolean(anchorEl)}
                            sx={{
                                background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                                width: 38, height: 38, fontSize: '0.875rem',
                                cursor: 'pointer',
                                border: '2px solid rgba(22,163,74,0.3)',
                                '&:hover': { border: '2px solid #16A34A' },
                                transition: 'border-color 0.2s ease',
                            }}>
                            {getInitials(user?.name)}
                        </Avatar>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Profile dropdown */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 220, mt: 1,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.email}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                        <Chip label={user?.role?.replace(/_/g, ' ')}
                            size="small" color="primary" variant="outlined" />
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleOpenProfile}>
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Profile</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sign Out"
                        primaryTypographyProps={{ color: 'error.main' }} />
                </MenuItem>
            </Menu>

            {/* Edit Profile dialog */}
            <Dialog
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                maxWidth="xs" fullWidth
                aria-labelledby="profile-dialog-title">
                <DialogTitle id="profile-dialog-title">Edit Profile</DialogTitle>
                <DialogContent sx={{ pt: 2, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Update your display name. Email cannot be changed.
                    </Typography>
                    <TextField
                        fullWidth label="Full Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        sx={{ mb: 0 }}
                        inputProps={{ 'aria-label': 'Full name' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProfileOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveName}
                        disabled={saving}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Navbar;
