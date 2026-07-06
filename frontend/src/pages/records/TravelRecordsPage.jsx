import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Snackbar, IconButton,
  Tooltip, Typography, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { AddRounded, EditOutlined, DeleteOutlined } from '@mui/icons-material';
import { DataTable, PageShell } from '../../components/ui';
import StatusBadge from '../../components/ui/StatusBadge';
import DepartmentSelector from '../../components/common/DepartmentSelector';
import { PageSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { travelRecordsApi } from '../../api/carbonRecordsApi';
import organizationsApi from '../../api/organizationsApi';
import locationsApi from '../../api/locationsApi';
import departmentsApi from '../../api/departmentsApi';

const MODES = ['CAR', 'FLIGHT', 'TRAIN', 'BUS'];
const DIALOG_ID = 'travel-dialog-title';

export default function TravelRecordsPage() {
  const { isAdmin, isManager, getOrgId } = useAuth();

  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [deptMap, setDeptMap]             = useState({});

  const [open, setOpen]       = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm]       = useState({ departmentId: '', distanceKm: '', transportMode: 'CAR', recordedDate: '', notes: '' });
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState(null);
  const [snack, setSnack]     = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const init = async () => {
      if (isAdmin()) {
        const res = await organizationsApi.getAll();
        setOrganizations(res.data);
        if (res.data.length > 0) setSelectedOrgId(res.data[0].id);
        else setLoading(false);
      } else {
        const orgId = getOrgId();
        if (orgId) setSelectedOrgId(orgId);
        else setLoading(false);
      }
    };
    init().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    loadRecords();
    loadDeptMap();
  }, [selectedOrgId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await travelRecordsApi.getByOrganization(selectedOrgId);
      setRecords(res.data);
    } catch { setError('Failed to load travel records.'); }
    finally { setLoading(false); }
  };

  const loadDeptMap = async () => {
    try {
      const locRes = await locationsApi.getByOrganization(selectedOrgId);
      const locations = locRes.data;
      const allDepts = await Promise.all(
        locations.map(loc =>
          departmentsApi.getByLocation(loc.id).then(r =>
            r.data.map(d => ({ ...d, locationName: loc.name }))
          )
        )
      );
      const map = {};
      allDepts.flat().forEach(d => { map[d.id] = d; });
      setDeptMap(map);
    } catch {}
  };

  const openCreate = () => { setSelected(null); setForm({ departmentId: '', distanceKm: '', transportMode: 'CAR', recordedDate: '', notes: '' }); setFormErr(''); setOpen(true); };
  const openEdit = rec => { setSelected(rec); setForm({ departmentId: rec.departmentId, distanceKm: rec.distanceKm, transportMode: rec.transportMode, recordedDate: rec.recordedDate, notes: rec.notes || '' }); setFormErr(''); setOpen(true); };
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.departmentId || !form.distanceKm || !form.recordedDate) { setFormErr('Please select a department, enter distance, and choose a date.'); return; }
    setSaving(true);
    try {
      if (selected) await travelRecordsApi.update(selected.id, form);
      else          await travelRecordsApi.create(form);
      setOpen(false); loadRecords();
      setSnack({ open: true, message: selected ? 'Record updated.' : 'Record created.', severity: 'success' });
    } catch (err) { setFormErr(err.response?.data?.error || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    try { await travelRecordsApi.delete(id); setDelId(null); loadRecords(); setSnack({ open: true, message: 'Record deleted.', severity: 'success' }); }
    catch (err) { setDelId(null); setSnack({ open: true, message: err.response?.data?.error || 'Cannot delete.', severity: 'error' }); }
  };

  const columns = [
    {
      key: 'departmentId', label: 'Department',
      render: v => (
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.colors.text }}>{deptMap[v]?.name || 'Unknown'}</Typography>
          <Typography sx={{ fontSize: 11, color: tokens.colors.textMuted }}>{deptMap[v]?.locationName || ''}</Typography>
        </Box>
      ),
    },
    { key: 'transportMode', label: 'Mode', render: v => <StatusBadge value={v} showDot /> },
    { key: 'distanceKm', label: 'Distance', render: v => <Box sx={{ fontSize: 14, fontWeight: 600 }}>{Number(v).toLocaleString()} <Box component="span" sx={{ fontSize: 12, color: tokens.colors.textSec }}>km</Box></Box> },
    { key: 'co2Emission', label: 'CO₂ Emission', render: v => +v > 0 ? <Box sx={{ fontSize: 14, fontWeight: 700, color: tokens.colors.primary }}>{Number(v).toFixed(4)} <Box component="span" sx={{ fontSize: 12, color: tokens.colors.textSec }}>kg</Box></Box> : <Box sx={{ fontSize: 14, color: tokens.colors.textSec }}>0.0000 <Box component="span" sx={{ fontSize: 12, color: tokens.colors.textMuted }}>kg</Box></Box> },
    { key: 'recordedDate', label: 'Date', render: v => <Box sx={{ fontSize: 13, color: tokens.colors.textSec }}>{v}</Box> },
    {
      key: 'id', label: '', align: 'right', sortable: false,
      render: (_, rec) => (
        <Box display="flex" gap={0.5} justifyContent="flex-end">
          {(isAdmin() || isManager()) && <Tooltip title="Edit"><IconButton size="small" aria-label="Edit" onClick={() => openEdit(rec)}><EditOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
          {isAdmin() && <Tooltip title="Delete"><IconButton size="small" aria-label="Delete" onClick={() => setDelId(rec.id)} sx={{ '&:hover': { color: tokens.colors.danger, bgcolor: '#FEF2F2' } }}><DeleteOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
        </Box>
      ),
    },
  ];

  if (loading && !records.length) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell title="Travel Records" subtitle="Business travel and employee commute emissions tracking." breadcrumbs={[{ label: 'Carbon Tracking' }]}
        actions={(isAdmin() || isManager()) && <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>New Record</Button>} />

      {isAdmin() && organizations.length > 0 && (
        <Box>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Organization</InputLabel>
            <Select value={selectedOrgId || ''} label="Organization" onChange={e => setSelectedOrgId(e.target.value)}>
              {organizations.map(o => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 14 }}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      <DataTable columns={columns} rows={records} searchKeys={['transportMode', 'recordedDate']}
        emptyTitle="No travel records" emptyDescription="Log business travel to calculate transport-related CO₂ emissions." emptyEmoji="✈️"
        onEmptyAction={(isAdmin() || isManager()) ? openCreate : undefined} emptyActionLabel="Add Record" />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth aria-labelledby={DIALOG_ID}>
        <DialogTitle id={DIALOG_ID}>{selected ? 'Edit Travel Record' : 'New Travel Record'}</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {formErr && <Alert severity="error" sx={{ mb: 2.5 }}>{formErr}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {!selected && <DepartmentSelector value={form.departmentId} onChange={deptId => setForm(p => ({ ...p, departmentId: deptId }))} preSelectedOrgId={selectedOrgId} />}
            {selected && (
              <Box>
                <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75 }}>Department</Box>
                <Box sx={{ px: 2, py: 1.25, bgcolor: tokens.colors.surface, borderRadius: 2, border: `1px solid ${tokens.colors.border}` }}>
                  <Typography sx={{ fontSize: 14 }}>{deptMap[selected.departmentId] || `Dept ID ${selected.departmentId}`}</Typography>
                </Box>
              </Box>
            )}
            <Box>
              <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75 }}>Distance (km) *</Box>
              <TextField fullWidth name="distanceKm" type="number" inputProps={{ step: '0.01' }} value={form.distanceKm} onChange={handle} />
            </Box>
            <Box>
              <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75 }}>Transport Mode</Box>
              <FormControl fullWidth>
                <Select name="transportMode" value={form.transportMode} onChange={handle} size="small">
                  {MODES.map(m => <MenuItem key={m} value={m} sx={{ fontSize: 14 }}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75 }}>Recorded Date *</Box>
              <TextField fullWidth name="recordedDate" type="date" value={form.recordedDate} onChange={handle} InputLabelProps={{ shrink: true }} />
            </Box>
            <Box>
              <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75 }}>Notes</Box>
              <TextField fullWidth name="notes" value={form.notes} onChange={handle} multiline rows={2} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Record'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delId} onClose={() => setDelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Record</DialogTitle>
        <DialogContent><Alert severity="warning">This action cannot be undone.</Alert></DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => del(delId)}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
