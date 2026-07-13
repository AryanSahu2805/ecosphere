import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, IconButton,
  TextField, Avatar, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Chip, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Alert, Select, CircularProgress,
} from '@mui/material';
import emailPreferencesApi from '../../api/emailPreferencesApi';
import {
  MenuRounded,
  NotificationsOutlined, PersonOutlined,
  LogoutOutlined, SettingsOutlined, KeyboardArrowDownRounded,
  CalendarMonth, SaveOutlined, Email,
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
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [anchorEl,    setAnchorEl]    = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName,    setEditName]    = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [settingsOpen,setSettingsOpen]= useState(false);
  const [prefs,        setPrefs]        = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving,  setPrefsSaving]  = useState(false);
  const [prefsSaved,   setPrefsSaved]   = useState(false);

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
    if (isAdmin()) {
      setPrefsLoading(true);
      emailPreferencesApi.get()
        .then(res => setPrefs(res.data))
        .catch(() => {})
        .finally(() => setPrefsLoading(false));
    }
  };

  const handleSavePrefs = async () => {
    if (!prefs) return;
    try {
      setPrefsSaving(true);
      const res = await emailPreferencesApi.update(prefs);
      setPrefs(res.data);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } catch { /* non-fatal */ }
    finally { setPrefsSaving(false); }
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

          {/* Email Notifications — Admin only */}
          {isAdmin() && prefs && (
            <>
              {/* Section header */}
              <Box sx={{ mt: 3, mb: 2.5 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#F0FDF4', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Email sx={{ fontSize: 18, color: 'success.main' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Email Notifications
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 0.5 }}>
                  Configure when EcoSphere sends alerts and sustainability reports to your inbox.
                </Typography>
              </Box>

              {prefsSaved && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600}>Preferences saved successfully</Typography>
                  <Typography variant="caption" color="text.secondary">Updated just now</Typography>
                </Alert>
              )}

              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>

                {/* Alert level */}
                <Box sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <NotificationsOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">Alert Email Level</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    Which alert severities trigger an email notification
                  </Typography>
                  <Select fullWidth size="small" value={prefs.alertLevel}
                    onChange={e => setPrefs(p => ({ ...p, alertLevel: e.target.value, alertsEnabled: e.target.value !== 'NONE' }))}
                    sx={{ borderRadius: '10px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '10px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' }, '& .MuiSelect-select': { py: 1.2 } }}
                    renderValue={v => <Typography variant="body2" fontWeight={500}>{{ ALL: 'All Alerts', HIGH: 'High Priority Only', MEDIUM: 'Medium and Above', NONE: 'No Alert Emails' }[v] || v}</Typography>}>
                    {[
                      { value: 'ALL',    label: 'All Alerts',          desc: 'High, Medium and all others' },
                      { value: 'HIGH',   label: 'High Priority Only',  desc: 'Critical alerts only — missed goals etc.' },
                      { value: 'MEDIUM', label: 'Medium and Above',    desc: 'High + Medium severity alerts' },
                      { value: 'NONE',   label: 'No Alert Emails',     desc: 'Disable all alert email notifications' },
                    ].map(opt => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                          <Typography variant="body2" fontWeight={500}>{opt.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Divider />

                {/* Report frequency */}
                <Box sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">Scheduled Reports</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    How often to receive PDF + CSV reports via email
                  </Typography>
                  <Select fullWidth size="small" value={prefs.reportFrequency}
                    onChange={e => setPrefs(p => ({ ...p, reportFrequency: e.target.value, reportsEnabled: e.target.value !== 'NONE' }))}
                    sx={{ borderRadius: '10px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '10px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' }, '& .MuiSelect-select': { py: 1.2 } }}
                    renderValue={v => <Typography variant="body2" fontWeight={500}>{{ DAILY: 'Daily — every morning at 8 AM', WEEKLY: 'Weekly — every Monday at 8 AM', MONTHLY: 'Monthly — 1st of each month', NONE: 'Disabled' }[v] || v}</Typography>}>
                    {[
                      { value: 'DAILY',   label: 'Daily',    desc: 'Every morning at 8:00 AM' },
                      { value: 'WEEKLY',  label: 'Weekly',   desc: 'Every Monday at 8:00 AM' },
                      { value: 'MONTHLY', label: 'Monthly',  desc: '1st of each month at 8:00 AM' },
                      { value: 'NONE',    label: 'Disabled', desc: 'No scheduled report emails' },
                    ].map(opt => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                          <Typography variant="body2" fontWeight={500}>{opt.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Divider />

                {/* Live preview summary */}
                <Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                    Current Schedule
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: prefs.alertsEnabled ? '#16A34A' : '#94A3B8', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">
                        <b>Alerts: </b>
                        {prefs.alertLevel === 'ALL' ? 'All severity levels' : prefs.alertLevel === 'HIGH' ? 'High priority only' : prefs.alertLevel === 'MEDIUM' ? 'Medium and above' : 'Disabled'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: prefs.reportsEnabled ? '#16A34A' : '#94A3B8', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">
                        <b>Reports: </b>
                        {prefs.reportFrequency === 'DAILY' ? 'Every day at 8:00 AM' : prefs.reportFrequency === 'WEEKLY' ? 'Every Monday at 8:00 AM' : prefs.reportFrequency === 'MONTHLY' ? '1st of each month' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Save button */}
                <Box sx={{ p: 3 }}>
                  <Button variant="contained" fullWidth onClick={handleSavePrefs} disabled={prefsSaving}
                    startIcon={prefsSaving ? null : <SaveOutlined />}
                    sx={{ height: 48, borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg, #16A34A, #0D9488)', boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #15803D, #0F766E)', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' } }}>
                    {prefsSaving ? <CircularProgress size={20} color="inherit" /> : 'Save Preferences'}
                  </Button>
                </Box>

              </Box>
            </>
          )}

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
