import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import {
  AddRounded, BusinessOutlined, LocationOnOutlined,
  AccountTreeOutlined, ExpandMore, ExpandLess, EditOutlined, DeleteOutlined,
} from '@mui/icons-material';
import { PageShell } from '../../components/ui';
import { tokens } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import organizationsApi from '../../api/organizationsApi';
import locationsApi from '../../api/locationsApi';
import departmentsApi from '../../api/departmentsApi';

const Label = ({ children }) => (
  <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>{children}</Box>
);

export default function StructurePage() {
  const { isAdmin } = useAuth();

  const [organizations,    setOrganizations]    = useState([]);
  const [locationsByOrg,   setLocationsByOrg]   = useState({});
  const [deptsByLocation,  setDeptsByLocation]  = useState({});
  const [loading,          setLoading]          = useState(true);
  const [expandedOrgs,     setExpandedOrgs]     = useState({});
  const [expandedLocations,setExpandedLocations]= useState({});

  // Dialogs
  const [orgDialog,      setOrgDialog]      = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const [deptDialog,     setDeptDialog]     = useState(false);

  // Pre-selected parent context
  const [newLocationOrgId,   setNewLocationOrgId]   = useState(null);
  const [newLocationOrgName, setNewLocationOrgName] = useState('');
  const [newDeptLocationId,  setNewDeptLocationId]  = useState(null);
  const [newDeptLocName,     setNewDeptLocName]     = useState('');

  // Form state
  const [orgForm,  setOrgForm]  = useState({ name: '', industry: '' });
  const [locForm,  setLocForm]  = useState({ name: '', address: '', country: '' });
  const [deptForm, setDeptForm] = useState({ name: '' });
  const [formErr,  setFormErr]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [snack,    setSnack]    = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', item: null, parentName: '' });
  const resetDelete = () => setDeleteConfirm({ open: false, type: '', item: null, parentName: '' });

  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  const loadAll = async () => {
    setLoading(true);
    try {
      const orgRes = await organizationsApi.getAll();
      const orgs = orgRes.data;
      setOrganizations(orgs);

      // Auto-expand all orgs
      const expanded = {};
      orgs.forEach(o => { expanded[o.id] = true; });
      setExpandedOrgs(expanded);

      // Load locations for each org
      const locMap = {};
      await Promise.all(orgs.map(async org => {
        const locRes = await locationsApi.getByOrganization(org.id);
        locMap[org.id] = locRes.data;
      }));
      setLocationsByOrg(locMap);

      // Load departments for each location
      const deptMap = {};
      const allLocs = Object.values(locMap).flat();
      await Promise.all(allLocs.map(async loc => {
        const deptRes = await departmentsApi.getByLocation(loc.id);
        deptMap[loc.id] = deptRes.data;
      }));
      setDeptsByLocation(deptMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Save handlers
  const saveOrg = async () => {
    if (!orgForm.name.trim()) { setFormErr('Organization name is required.'); return; }
    setSaving(true);
    try {
      await organizationsApi.create(orgForm);
      setOrgDialog(false);
      setOrgForm({ name: '', industry: '' });
      showSnack('Organization created.');
      loadAll();
    } catch (err) { setFormErr(err.response?.data?.error || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const saveLocation = async () => {
    if (!locForm.name.trim()) { setFormErr('Location name is required.'); return; }
    setSaving(true);
    try {
      await locationsApi.create({ ...locForm, organizationId: newLocationOrgId });
      setLocationDialog(false);
      setLocForm({ name: '', address: '', country: '' });
      showSnack('Location created.');
      loadAll();
    } catch (err) { setFormErr(err.response?.data?.error || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const saveDept = async () => {
    if (!deptForm.name.trim()) { setFormErr('Department name is required.'); return; }
    setSaving(true);
    try {
      await departmentsApi.create({ name: deptForm.name, locationId: newDeptLocationId });
      setDeptDialog(false);
      setDeptForm({ name: '' });
      showSnack('Department created.');
      loadAll();
    } catch (err) { setFormErr(err.response?.data?.error || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const handleDeleteOrg = async () => {
    try {
      await organizationsApi.delete(deleteConfirm.item.id);
      resetDelete();
      showSnack('Organization deleted.');
      loadAll();
    } catch (err) {
      resetDelete();
      showSnack(err.response?.data?.error || 'Cannot delete: locations still exist. Remove all locations first.', 'error');
    }
  };

  const handleDeleteLocation = async () => {
    try {
      await locationsApi.delete(deleteConfirm.item.id);
      resetDelete();
      showSnack('Location deleted.');
      loadAll();
    } catch (err) {
      resetDelete();
      showSnack(err.response?.data?.error || 'Cannot delete: departments still exist. Remove all departments first.', 'error');
    }
  };

  const handleDeleteDept = async () => {
    try {
      await departmentsApi.delete(deleteConfirm.item.id);
      resetDelete();
      showSnack('Department deleted.');
      loadAll();
    } catch (err) {
      resetDelete();
      showSnack(err.response?.data?.error || 'Cannot delete: carbon records exist.', 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'org')      handleDeleteOrg();
    else if (deleteConfirm.type === 'location') handleDeleteLocation();
    else if (deleteConfirm.type === 'dept')     handleDeleteDept();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="Organization Structure"
        subtitle="Manage your organizations, locations, and departments in one unified view."
        breadcrumbs={[{ label: 'Organization' }]}
        actions={isAdmin() && (
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setOrgForm({ name: '', industry: '' }); setFormErr(''); setOrgDialog(true); }}>
            New Organization
          </Button>
        )}
      />

      {/* Tree */}
      {organizations.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, color: tokens.colors.textMuted }}>
          <BusinessOutlined sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
          <Typography>No organizations yet.</Typography>
          {isAdmin() && <Button sx={{ mt: 1 }} onClick={() => setOrgDialog(true)}>Create first organization</Button>}
        </Card>
      ) : (
        organizations.map(org => (
          <Card key={org.id} sx={{ mb: 0, overflow: 'hidden' }}>
            {/* Org header */}
            <Box sx={{
              p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', bgcolor: tokens.colors.surface,
              borderBottom: expandedOrgs[org.id] ? `1px solid ${tokens.colors.border}` : 'none',
              borderRadius: expandedOrgs[org.id] ? '16px 16px 0 0' : '16px',
              '&:hover': { bgcolor: tokens.colors.surfaceHv },
              transition: 'background 0.12s ease',
            }} onClick={() => setExpandedOrgs(p => ({ ...p, [org.id]: !p[org.id] }))}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ width: 40, height: 40, bgcolor: tokens.colors.primaryLt, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BusinessOutlined sx={{ color: tokens.colors.primary }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: 16 }}>{org.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {org.industry || 'No industry'} · {(locationsByOrg[org.id] || []).length} location(s)
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                {isAdmin() && (
                  <Button size="small" variant="outlined" startIcon={<AddRounded />}
                    onClick={e => { e.stopPropagation(); setNewLocationOrgId(org.id); setNewLocationOrgName(org.name); setLocForm({ name: '', address: '', country: '' }); setFormErr(''); setLocationDialog(true); }}>
                    Add Location
                  </Button>
                )}
                {isAdmin() && (
                  <IconButton size="small" color="error" aria-label={`Delete ${org.name}`}
                    onClick={e => { e.stopPropagation(); setDeleteConfirm({ open: true, type: 'org', item: org, parentName: '' }); }}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                )}
                {expandedOrgs[org.id] ? <ExpandLess sx={{ color: tokens.colors.textSec }} /> : <ExpandMore sx={{ color: tokens.colors.textSec }} />}
              </Box>
            </Box>

            {/* Expanded org body */}
            {expandedOrgs[org.id] && (
              <Box sx={{ p: 2 }}>
                {(locationsByOrg[org.id] || []).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, color: tokens.colors.textMuted }}>
                    <LocationOnOutlined sx={{ fontSize: 32, opacity: 0.3 }} />
                    <Typography variant="body2">No locations yet.</Typography>
                    {isAdmin() && (
                      <Button size="small" sx={{ mt: 0.5 }} onClick={() => { setNewLocationOrgId(org.id); setNewLocationOrgName(org.name); setLocForm({ name: '', address: '', country: '' }); setFormErr(''); setLocationDialog(true); }}>
                        Add first location
                      </Button>
                    )}
                  </Box>
                ) : (
                  (locationsByOrg[org.id] || []).map(loc => (
                    <Box key={loc.id} sx={{ ml: 2, mb: 2, border: `1px solid ${tokens.colors.border}`, borderRadius: 2, overflow: 'hidden' }}>
                      {/* Location header */}
                      <Box sx={{
                        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        bgcolor: '#FAFAFA', cursor: 'pointer',
                        '&:hover': { bgcolor: tokens.colors.surface },
                        transition: 'background 0.12s ease',
                      }} onClick={() => setExpandedLocations(p => ({ ...p, [loc.id]: p[loc.id] === false ? true : false }))}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <LocationOnOutlined sx={{ color: '#0D9488', fontSize: 20 }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{loc.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[loc.country, loc.address].filter(Boolean).join(' · ')}
                              {' · '}{(deptsByLocation[loc.id] || []).length} dept(s)
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {isAdmin() && (
                            <Button size="small" variant="outlined" startIcon={<AddRounded />}
                              onClick={e => { e.stopPropagation(); setNewDeptLocationId(loc.id); setNewDeptLocName(loc.name); setDeptForm({ name: '' }); setFormErr(''); setDeptDialog(true); }}>
                              Add Dept
                            </Button>
                          )}
                          {isAdmin() && (
                            <IconButton size="small" color="error" aria-label={`Delete ${loc.name}`}
                              onClick={e => { e.stopPropagation(); setDeleteConfirm({ open: true, type: 'location', item: loc, parentName: org.name }); }}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Departments */}
                      {expandedLocations[loc.id] !== false && (
                        <Box sx={{ p: 2 }}>
                          {(deptsByLocation[loc.id] || []).length === 0 ? (
                            <Box sx={{ py: 2, textAlign: 'center', color: tokens.colors.textMuted }}>
                              <Typography variant="body2">No departments.</Typography>
                              {isAdmin() && (
                                <Button size="small" sx={{ mt: 0.5 }} onClick={() => { setNewDeptLocationId(loc.id); setNewDeptLocName(loc.name); setDeptForm({ name: '' }); setFormErr(''); setDeptDialog(true); }}>
                                  Add department
                                </Button>
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {(deptsByLocation[loc.id] || []).map(dept => (
                                <Chip key={dept.id} label={dept.name}
                                  icon={<AccountTreeOutlined fontSize="small" />}
                                  variant="outlined" sx={{ fontWeight: 500 }}
                                  onDelete={isAdmin() ? () => setDeleteConfirm({ open: true, type: 'dept', item: dept, parentName: loc.name }) : undefined}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Card>
        ))
      )}

      {/* ─── New Organization Dialog ─── */}
      <Dialog open={orgDialog} onClose={() => setOrgDialog(false)} maxWidth="sm" fullWidth aria-labelledby="org-dialog-title">
        <DialogTitle id="org-dialog-title">New Organization</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formErr && <Alert severity="error" sx={{ mb: 2 }}>{formErr}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box><Label>Organization Name *</Label><TextField fullWidth value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Acme Corp" /></Box>
            <Box><Label>Industry</Label><TextField fullWidth value={orgForm.industry} onChange={e => setOrgForm(p => ({ ...p, industry: e.target.value }))} placeholder="e.g. Technology" /></Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOrgDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveOrg} disabled={saving}>{saving ? 'Creating…' : 'Create Organization'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── New Location Dialog ─── */}
      <Dialog open={locationDialog} onClose={() => setLocationDialog(false)} maxWidth="sm" fullWidth aria-labelledby="loc-dialog-title">
        <DialogTitle id="loc-dialog-title">Add Location to {newLocationOrgName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formErr && <Alert severity="error" sx={{ mb: 2 }}>{formErr}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box><Label>Location Name *</Label><TextField fullWidth value={locForm.name} onChange={e => setLocForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bangalore HQ" /></Box>
            <Box><Label>Address</Label><TextField fullWidth value={locForm.address} onChange={e => setLocForm(p => ({ ...p, address: e.target.value }))} placeholder="Street address" /></Box>
            <Box><Label>Country</Label><TextField fullWidth value={locForm.country} onChange={e => setLocForm(p => ({ ...p, country: e.target.value }))} placeholder="e.g. India" /></Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setLocationDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLocation} disabled={saving}>{saving ? 'Creating…' : 'Add Location'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── New Department Dialog ─── */}
      <Dialog open={deptDialog} onClose={() => setDeptDialog(false)} maxWidth="xs" fullWidth aria-labelledby="dept-dialog-title">
        <DialogTitle id="dept-dialog-title">Add Department to {newDeptLocName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formErr && <Alert severity="error" sx={{ mb: 2 }}>{formErr}</Alert>}
          <Box><Label>Department Name *</Label><TextField fullWidth value={deptForm.name} onChange={e => setDeptForm({ name: e.target.value })} placeholder="e.g. Engineering" /></Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeptDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveDept} disabled={saving}>{saving ? 'Creating…' : 'Add Department'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog open={deleteConfirm.open} onClose={resetDelete} maxWidth="xs" fullWidth aria-labelledby="delete-confirm-title">
        <DialogTitle id="delete-confirm-title" sx={{ color: 'error.main' }}>
          Delete {deleteConfirm.type === 'org' ? 'Organization' : deleteConfirm.type === 'location' ? 'Location' : 'Department'}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{deleteConfirm.item?.name}</strong>?
          </Typography>
          {deleteConfirm.type === 'org' && (
            <Alert severity="warning" sx={{ mt: 2 }}>This will fail if locations still exist under this organization. Delete all locations first.</Alert>
          )}
          {deleteConfirm.type === 'location' && (
            <Alert severity="warning" sx={{ mt: 2 }}>This will fail if departments still exist under this location. Delete all departments first.</Alert>
          )}
          {deleteConfirm.type === 'dept' && (
            <Alert severity="warning" sx={{ mt: 2 }}>This will fail if carbon records exist for this department.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDelete}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
