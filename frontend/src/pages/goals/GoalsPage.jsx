import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, Select, MenuItem,
  FormControl, LinearProgress,
} from '@mui/material';
import { AddRounded, TrackChangesOutlined } from '@mui/icons-material';
import { PageShell, EmptyState } from '../../components/ui';
import { PageSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import goalsApi from '../../api/goalsApi';

const METRICS = ['TOTAL_EMISSIONS', 'ENERGY_EMISSIONS', 'TRAVEL_EMISSIONS', 'SERVER_EMISSIONS'];
const METRIC_LABELS = { TOTAL_EMISSIONS: 'Total Emissions', ENERGY_EMISSIONS: 'Energy', TRAVEL_EMISSIONS: 'Travel', SERVER_EMISSIONS: 'Server' };
const Label = ({ children }) => <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>{children}</Box>;

export default function GoalsPage() {
  const [goals, setGoals]       = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ targetMetric: 'TOTAL_EMISSIONS', targetValue: '', deadline: '', description: '' });
  const [formErr, setFormErr]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [snack, setSnack]       = useState({ open: false, message: '', severity: 'success' });
  const [deleteGoalDialog, setDeleteGoalDialog] = useState({ open: false, goal: null });
  const { isAdmin, isManager, getOrgId } = useAuth();

  const orgId = getOrgId() || 1;

  const load = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.getByOrganization(orgId);
      const gs  = res.data;
      setGoals(gs);
      const progs = await Promise.all(gs.map(g => goalsApi.getProgress(g.id)));
      const map = {};
      progs.forEach((r, i) => { map[gs[i].id] = r.data; });
      setProgress(map);
    } catch { setError('Failed to load goals.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ organizationId: orgId, targetMetric: 'TOTAL_EMISSIONS', targetValue: '', deadline: '', description: '' }); setFormErr(''); setOpen(true); };
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.targetValue || !form.deadline) { setFormErr('Target value and deadline are required.'); return; }
    setSaving(true);
    try {
      await goalsApi.create({ ...form, organizationId: orgId });
      setOpen(false); load();
      setSnack({ open: true, message: 'Goal created successfully.', severity: 'success' });
    } catch (err) { setFormErr(err.response?.data?.error || 'Failed to create goal.'); }
    finally { setSaving(false); }
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  const cancel = async (id) => {
    try { await goalsApi.cancel(id); load(); showSnackbar('Goal cancelled.', 'info'); }
    catch (err) { showSnackbar(err.response?.data?.error || 'Cannot cancel.', 'error'); }
  };

  const handleDeleteGoal = async () => {
    try {
      await goalsApi.delete(deleteGoalDialog.goal.id);
      setDeleteGoalDialog({ open: false, goal: null });
      showSnackbar('Goal deleted successfully.');
      load();
    } catch (err) {
      setDeleteGoalDialog({ open: false, goal: null });
      showSnackbar(err.response?.data?.error || 'Failed to delete goal.', 'error');
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="Sustainability Goals"
        subtitle="Track emission reduction targets and monitor progress towards your net-zero commitments."
        breadcrumbs={[{ label: 'Sustainability' }]}
        actions={(isAdmin() || isManager()) && (
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>New Goal</Button>
        )}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {goals.length === 0 ? (
        <Card><CardContent sx={{ p: 0 }}>
          <EmptyState emoji="🎯" title="No sustainability goals" description="Create your first emission reduction goal to start tracking progress." action={(isAdmin() || isManager()) ? openCreate : undefined} actionLabel="Create Goal" />
        </CardContent></Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {goals.map(goal => {
            const p = progress[goal.id];
            const pct = p ? Math.min(+p.progressPercentage, 100) : 0;
            return (
              <Card key={goal.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: tokens.colors.primaryLt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrackChangesOutlined sx={{ fontSize: 20, color: tokens.colors.primary }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: tokens.colors.text }}>
                          {goal.description || METRIC_LABELS[goal.targetMetric] + ' Reduction'}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: tokens.colors.textSec }}>
                          Target: <strong>{goal.targetValue}</strong> kg CO₂/month · Deadline: {goal.deadline}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={goal.status}
                        size="small"
                        color={
                          goal.status === 'ACTIVE'    ? 'primary' :
                          goal.status === 'ACHIEVED'  ? 'success' :
                          goal.status === 'MISSED'    ? 'error'   : 'default'
                        }
                        variant={goal.status === 'ACTIVE' ? 'filled' : 'outlined'}
                      />
                      {isAdmin() && goal.status === 'ACTIVE' && (
                        <Button size="small" variant="outlined" onClick={() => cancel(goal.id)}>Cancel</Button>
                      )}
                      {isAdmin() && (goal.status === 'MISSED' || goal.status === 'CANCELLED') && (
                        <Button size="small" variant="outlined" color="error"
                          onClick={() => setDeleteGoalDialog({ open: true, goal })}>
                          Delete
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {p && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: 13, color: tokens.colors.textSec }}>
                          Current rate: <Box component="span" sx={{ fontWeight: 600, color: tokens.colors.text }}>{Number(p.currentValue).toFixed(2)} kg CO₂/month</Box>
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: pct >= 50 ? tokens.colors.primary : tokens.colors.warning }}>
                          {pct.toFixed(1)}% complete
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 8, bgcolor: tokens.colors.surface, '& .MuiLinearProgress-bar': { bgcolor: pct >= 50 ? tokens.colors.primary : tokens.colors.warning } }} />
                      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                        {[
                          { label: `Baseline rate: ${Number(p.baselineValue).toFixed(2)} kg/month`, bg: tokens.colors.surface, color: tokens.colors.textSec },
                          p.daysRemaining < 0
                            ? { label: `${Math.abs(p.daysRemaining)} days overdue`, bg: '#FEF2F2', color: tokens.colors.danger }
                            : { label: `${p.daysRemaining} days remaining`, bg: '#EFF6FF', color: '#2563EB' },
                          parseFloat(p.progressPercentage) === 0 && p.daysRemaining > 0
                            ? { label: 'Just started', bg: '#DBEAFE', color: '#1D4ED8' }
                            : { label: p.onTrack ? '✓ On track' : '⚠ Behind', bg: p.onTrack ? '#F0FDF4' : '#FFFBEB', color: p.onTrack ? tokens.colors.primary : tokens.colors.warning },
                        ].map((badge, i) => (
                          <Box key={i} sx={{ display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: badge.bg }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{badge.label}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth aria-labelledby="goal-dialog">
        <DialogTitle id="goal-dialog">New Sustainability Goal</DialogTitle>
        <DialogContent>
          {formErr && <Alert severity="error" sx={{ mb: 2 }}>{formErr}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box>
              <Label>Target Metric</Label>
              <FormControl fullWidth>
                <Select name="targetMetric" value={form.targetMetric} onChange={handle} size="small">
                  {METRICS.map(m => <MenuItem key={m} value={m} sx={{ fontSize: 14 }}>{METRIC_LABELS[m]}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box><Label>Target Value (kg CO₂) *</Label><TextField fullWidth name="targetValue" type="number" inputProps={{ step: '0.01' }} value={form.targetValue} onChange={handle} placeholder="e.g. 200.00" /></Box>
            <Box><Label>Deadline *</Label><TextField fullWidth name="deadline" type="date" value={form.deadline} onChange={handle} InputLabelProps={{ shrink: true }} /></Box>
            <Box><Label>Description</Label><TextField fullWidth name="description" value={form.description} onChange={handle} placeholder="Optional description…" /></Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Creating…' : 'Create Goal'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteGoalDialog.open}
        onClose={() => setDeleteGoalDialog({ open: false, goal: null })}
        maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Goal?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Delete <strong>{deleteGoalDialog.goal?.description || deleteGoalDialog.goal?.targetMetric}</strong>?
          </Typography>
          <Alert severity="info">Associated alerts for this goal will also be removed.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGoalDialog({ open: false, goal: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteGoal}>Delete Goal</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
