import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Snackbar, IconButton, Tooltip,
  Select, MenuItem, FormControl, Typography,
  CircularProgress,
} from '@mui/material';
import { BusinessOutlined, EmailOutlined, SendOutlined } from '@mui/icons-material';
import { DataTable, PageShell } from '../../components/ui';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';
import authApi from '../../api/authApi';
import invitationsApi from '../../api/invitationsApi';

const ROLE_BADGE_MAP = {
  ADMIN:                  { value: 'ADMIN',                  label: 'Admin' },
  SUSTAINABILITY_MANAGER: { value: 'SUSTAINABILITY_MANAGER',  label: 'Manager' },
  AUDITOR:                { value: 'AUDITOR',                 label: 'Auditor' },
};

const Label = ({ children }) => (
  <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>
    {children}
  </Box>
);

export default function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Assign org dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [targetUser, setTarget]     = useState(null);
  const [orgId, setOrgId]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [assignErr, setAssignErr]   = useState('');

  // Invite dialog
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteForm, setInviteForm]     = useState({ invitedEmail: '', role: 'SUSTAINABILITY_MANAGER' });
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError]   = useState('');

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  const load = async () => {
    try {
      setLoading(true);
      const res = await authApi.getAllUsers();
      setUsers(res.data);
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Assign org handlers
  const openAssign = (user) => {
    setTarget(user);
    setOrgId(user.organizationId ? String(user.organizationId) : '');
    setAssignErr('');
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!orgId || isNaN(+orgId) || +orgId <= 0) {
      setAssignErr('Please enter a valid Organization ID.');
      return;
    }
    setSaving(true);
    try {
      await authApi.assignOrganization(targetUser.id, +orgId);
      setAssignOpen(false);
      showSnackbar(`Organization assigned to ${targetUser.name}.`);
      load();
    } catch (err) {
      setAssignErr(err.response?.data?.error || 'Failed to assign organization.');
    } finally { setSaving(false); }
  };

  // Invite handlers
  const handleSendInvite = async () => {
    if (!inviteForm.invitedEmail) { setInviteError('Email is required.'); return; }
    setInviteSending(true);
    setInviteError('');
    try {
      await invitationsApi.send(inviteForm);
      setInviteDialog(false);
      setInviteForm({ invitedEmail: '', role: 'SUSTAINABILITY_MANAGER' });
      showSnackbar('Invitation sent to ' + inviteForm.invitedEmail);
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invitation.');
    } finally { setInviteSending(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v, row) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            bgcolor: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{v?.charAt(0)?.toUpperCase() || '?'}</Box>
          </Box>
          <Box>
            <Box sx={{ fontSize: 14, fontWeight: 600, color: tokens.colors.text }}>{v}</Box>
            <Box sx={{ fontSize: 12, color: tokens.colors.textMuted }}>{row.email}</Box>
          </Box>
        </Box>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: v => {
        const m = ROLE_BADGE_MAP[v];
        return m ? <StatusBadge value={m.value} label={m.label} /> : <Box sx={{ fontSize: 13, color: tokens.colors.textSec }}>{v}</Box>;
      },
    },
    {
      key: 'organizationId', label: 'Organization ID',
      render: v => v ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: tokens.colors.primaryLt, borderRadius: 2, px: 1.5, py: 0.5 }}>
          <Box sx={{ fontSize: 12, fontWeight: 700, color: tokens.colors.primaryDk }}>Org #{v}</Box>
        </Box>
      ) : (
        <Box sx={{ fontSize: 13, color: tokens.colors.textMuted, fontStyle: 'italic' }}>Unassigned</Box>
      ),
    },
    {
      key: 'createdAt', label: 'Joined',
      render: v => <Box sx={{ fontSize: 13, color: tokens.colors.textSec }}>{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Box>,
    },
    {
      key: 'id', label: 'Actions', align: 'right', sortable: false,
      render: (_, user) => (
        <Tooltip title="Assign to organization">
          <IconButton
            size="small" onClick={() => openAssign(user)} aria-label={`Assign organization to ${user.name}`}
            sx={{ '&:hover': { bgcolor: tokens.colors.primaryLt, color: tokens.colors.primary } }}>
            <BusinessOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="User Management"
        subtitle="View all platform users, assign organizations, and invite new team members."
        breadcrumbs={[{ label: 'Organization' }]}
        actions={
          <Button variant="contained" startIcon={<EmailOutlined />} onClick={() => { setInviteError(''); setInviteDialog(true); }}>
            Invite Member
          </Button>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      <DataTable
        columns={columns} rows={users} searchKeys={['name', 'email', 'role']}
        emptyTitle="No users found" emptyDescription="Users appear here once they register or accept an invitation." emptyEmoji="👤"
      />

      {/* Assign org dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth aria-labelledby="assign-org-dialog">
        <DialogTitle id="assign-org-dialog">Assign Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, fontSize: 13, color: tokens.colors.textSec }}>
            Assigning organization for <Box component="strong" sx={{ color: tokens.colors.text }}>{targetUser?.name}</Box>
          </Box>
          {assignErr && <Alert severity="error" sx={{ mb: 2 }}>{assignErr}</Alert>}
          <Box>
            <Label>Organization ID</Label>
            <TextField fullWidth type="number" value={orgId} onChange={e => setOrgId(e.target.value)} placeholder="e.g. 1" inputProps={{ min: 1 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}>
            {saving ? 'Saving…' : 'Assign Organization'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite dialog */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth aria-labelledby="invite-dialog-title">
        <DialogTitle id="invite-dialog-title">Invite Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            They will receive an email with a link to create their account in your organization.
          </Typography>
          {inviteError && <Alert severity="error" sx={{ mb: 2 }}>{inviteError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Label>Email Address</Label>
              <TextField
                fullWidth type="email" value={inviteForm.invitedEmail}
                onChange={e => setInviteForm(p => ({ ...p, invitedEmail: e.target.value }))}
                placeholder="colleague@company.com"
              />
            </Box>
            <Box>
              <Label>Role</Label>
              <FormControl fullWidth>
                <Select
                  value={inviteForm.role}
                  onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                  <MenuItem value="SUSTAINABILITY_MANAGER">
                    <Box>
                      <Box sx={{ fontSize: 14, fontWeight: 600 }}>Sustainability Manager</Box>
                      <Box sx={{ fontSize: 12, color: tokens.colors.textSec }}>Can log records, create goals, view reports</Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="AUDITOR">
                    <Box>
                      <Box sx={{ fontSize: 14, fontWeight: 600 }}>Auditor</Box>
                      <Box sx={{ fontSize: 12, color: tokens.colors.textSec }}>Read-only access, can view and download reports</Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{
              mt: 1, p: 1.5, bgcolor: '#F0FDF4',
              borderRadius: 2, border: '1px solid #BBF7D0',
            }}>
              <Typography variant="caption" color="success.dark">
                This person will be invited to join{' '}
                <strong>your organization</strong>. They will have access to all
                locations and departments within that organization.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setInviteDialog(false)}>Cancel</Button>
          <Button
            variant="contained" startIcon={inviteSending ? null : <SendOutlined />}
            disabled={inviteSending} onClick={handleSendInvite}>
            {inviteSending ? <CircularProgress size={18} color="inherit" /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
