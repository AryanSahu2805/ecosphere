import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, IconButton,
  InputAdornment, TextField, Avatar, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Chip, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Alert,
} from '@mui/material';
import {
  MenuRounded, SearchRounded,
  NotificationsOutlined, PersonOutlined,
  LogoutOutlined, SettingsOutlined, KeyboardArrowDownRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';
import { tokens } from '../../theme/theme';

const PAGE_TITLES = {
  '/app/dashboard':     { title: 'Dashboard',     breadcrumb: null },
  '/app/structure':     { title: 'Organization Structure', breadcrumb: 'Organization' },
  '/app/users':         { title: 'User Management',breadcrumb: 'Organization' },
  '/app/energy-records':{ title: 'Energy Records', breadcrumb: 'Carbon Tracking' },
  '/app/travel-records':{ title: 'Travel Records', breadcrumb: 'Carbon Tracking' },
  '/app/server-records':{ title: 'Server Usage',   breadcrumb: 'Carbon Tracking' },
  '/app/goals':         { title: 'Goals',          breadcrumb: 'Sustainability' },
  '/app/reports':       { title: 'Reports',        breadcrumb: 'Sustainability' },
  '/app/alerts':        { title: 'Alerts',         breadcrumb: 'Sustainability' },
  '/app/audit-logs':    { title: 'Audit Logs',     breadcrumb: 'Sustainability' },
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [anchorEl,    setAnchorEl]    = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName,    setEditName]    = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [settingsOpen,setSettingsOpen]= useState(false);

  const page = PAGE_TITLES[pathname] || { title: 'EcoSphere', breadcrumb: null };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleLogout = () => { setAnchorEl(null); logout(); navigate('/login'); };

  const openProfile = () => {
    setAnchorEl(null);
    setEditName(user?.name || '');
    setNameSuccess(false);
    setProfileOpen(true);
  };

  const openSettings = () => {
    setAnchorEl(null);
    setSettingsOpen(true);
  };

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        borderBottom: `1px solid ${tokens.colors.border}`,
        bgcolor: tokens.colors.card,
        zIndex: t => t.zIndex.drawer - 1,
      }}>
        <Toolbar sx={{ minHeight: '60px !important', px: { xs: 2, sm: 3 }, gap: 2 }}>

          {/* Mobile hamburger */}
          <IconButton color="inherit" onClick={onMenuClick}
            sx={{ display: { md: 'none' }, mr: 0.5 }} aria-label="Open navigation">
            <MenuRounded />
          </IconButton>

          {/* Page title + breadcrumb */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {page.breadcrumb && (
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: tokens.colors.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
                {page.breadcrumb}
              </Typography>
            )}
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: tokens.colors.text, letterSpacing: '-0.01em', lineHeight: page.breadcrumb ? 1.3 : undefined }}>
              {page.title}
            </Typography>
          </Box>

          {/* Search */}
          <TextField placeholder="Search…" size="small"
            sx={{ display: { xs: 'none', lg: 'flex' }, width: 220, '& .MuiOutlinedInput-root': { height: 36, fontSize: 13 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 16, color: tokens.colors.textMuted }} /></InputAdornment> }}
          />

          {/* Notifications */}
          <IconButton size="small" aria-label="Notifications">
            <Badge badgeContent={0} color="error">
              <NotificationsOutlined sx={{ fontSize: 20, color: tokens.colors.textSec }} />
            </Badge>
          </IconButton>

          {/* Profile trigger */}
          <Box onClick={e => setAnchorEl(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', borderRadius: 2, px: 1, py: 0.75, '&:hover': { bgcolor: tokens.colors.surface }, transition: 'background 0.12s ease' }}
            role="button" aria-label="Open profile menu" aria-haspopup="true">
            <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: tokens.colors.primary, border: `2px solid ${tokens.colors.primaryLt}` }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, lineHeight: 1.2 }}>
                {user?.name?.split(' ')[0] || 'User'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: tokens.colors.textMuted, textTransform: 'capitalize', lineHeight: 1 }}>
                {user?.role?.replace(/_/g, ' ').toLowerCase() || ''}
              </Typography>
            </Box>
            <KeyboardArrowDownRounded sx={{ fontSize: 16, color: tokens.colors.textMuted, display: { xs: 'none', sm: 'block' } }} />
          </Box>

          {/* Dropdown menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokens.colors.text }}>{user?.name}</Typography>
              <Typography sx={{ fontSize: 12, color: tokens.colors.textSec }}>{user?.email}</Typography>
              <Chip label={user?.role?.replace(/_/g, ' ')} size="small"
                sx={{ mt: 0.75, fontSize: 10, height: 20, bgcolor: tokens.colors.primaryLt, color: tokens.colors.primaryDk, fontWeight: 700 }} />
            </Box>
            <Divider />
            <MenuItem onClick={openProfile} dense>
              <ListItemIcon><PersonOutlined fontSize="small" /></ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }}>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={openSettings} dense>
              <ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }}>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} dense sx={{ color: tokens.colors.danger, '& .MuiListItemIcon-root': { color: tokens.colors.danger } }}>
              <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ─── Profile Dialog ─────────────────────────────────── */}
      <Dialog open={profileOpen} onClose={() => { setProfileOpen(false); setNameSuccess(false); }}
        maxWidth="xs" fullWidth aria-labelledby="profile-dialog-title">
        <DialogTitle id="profile-dialog-title">My Profile</DialogTitle>
        <DialogContent>
          {/* Avatar */}
          <Box display="flex" justifyContent="center" mb={3}>
            <Avatar sx={{ width: 72, height: 72, fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #16A34A, #0D9488)' }}>
              {initials}
            </Avatar>
          </Box>

          {/* Read-only email */}
          <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">Email address</Typography>
            <Typography variant="body2" fontWeight={600}>{user?.email}</Typography>
          </Box>

          {/* Read-only role */}
          <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">Role</Typography>
            <Chip label={user?.role?.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
          </Box>

          {nameSuccess && <Alert severity="success" sx={{ mb: 2 }}>Name updated successfully.</Alert>}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Display Name</Typography>
          <TextField fullWidth size="small" value={editName}
            onChange={e => setEditName(e.target.value)} placeholder="Your full name" sx={{ mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Email address cannot be changed. Contact your system administrator.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setProfileOpen(false); setNameSuccess(false); }}>Close</Button>
          <Button variant="contained" onClick={() => setNameSuccess(true)}>Save Name</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Settings Dialog ────────────────────────────────── */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}
        maxWidth="sm" fullWidth aria-labelledby="settings-dialog-title">
        <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
        <DialogContent>
          {/* Account section */}
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
            sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
            Account
          </Typography>
          <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: 2, p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600}>Current session</Typography>
              <Chip label="Active" size="small" color="success" />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">Logged in as {user?.email}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">Role: {user?.role?.replace(/_/g, ' ')}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">Organization ID: {user?.organizationId || 'N/A'}</Typography>
          </Box>

          {/* Security section */}
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
            sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
            Security
          </Typography>
          <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: 2, p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>Authentication</Typography>
                <Typography variant="caption" color="text.secondary">JWT token-based authentication active</Typography>
              </Box>
              <Chip label="JWT Secured" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 600 }} />
            </Box>
          </Box>
          <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: 2, p: 2, mb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>Session token</Typography>
                <Typography variant="caption" color="text.secondary">Your session expires after 24 hours</Typography>
              </Box>
              <Button size="small" color="error" variant="outlined"
                onClick={() => { setSettingsOpen(false); logout(); navigate('/login'); }}>
                Sign Out
              </Button>
            </Box>
          </Box>

          {/* Admin quick links */}
          {user?.role === 'ADMIN' && (
            <>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
                sx={{ mb: 2, mt: 3, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                Administration
              </Typography>
              <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: 2, p: 2 }}>
                <Typography variant="body2" fontWeight={600} mb={0.5}>Quick links</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {[
                    { label: 'Manage Users',  path: '/app/users' },
                    { label: 'Organizations', path: '/app/organizations' },
                    { label: 'Audit Logs',    path: '/app/audit-logs' },
                  ].map(({ label, path }) => (
                    <Button key={label} size="small" variant="outlined"
                      onClick={() => { setSettingsOpen(false); navigate(path); }}>
                      {label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
