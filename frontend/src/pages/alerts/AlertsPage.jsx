import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Alert as MuiAlert, Snackbar,
} from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import { PageShell, EmptyState } from '../../components/ui';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import alertsApi from '../../api/alertsApi';

const SEVERITY_STYLES = {
  HIGH:     { border: '#FECACA', bg: '#FEF2F2' },
  CRITICAL: { border: '#FECACA', bg: '#FEF2F2' },
  MEDIUM:   { border: '#FDE68A', bg: '#FFFBEB' },
  LOW:      { border: '#BBF7D0', bg: '#F0FDF4' },
};

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('active'); // 'all' | 'active'
  const [snack, setSnack]     = useState({ open: false, message: '', severity: 'success' });
  const { isAdmin, isManager, getOrgId } = useAuth();

  const orgId = getOrgId() || 1;

  const load = async () => {
    try {
      setLoading(true);
      const res = await alertsApi.getByOrganization(orgId);
      setAlerts(res.data);
    } catch { setError('Failed to load alerts.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    try {
      await alertsApi.resolve(id);
      load();
      setSnack({ open: true, message: 'Alert resolved.', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.error || 'Cannot resolve.', severity: 'error' });
    }
  };

  const filtered = filter === 'active' ? alerts.filter(a => !a.resolved) : alerts;

  if (loading) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="Alerts"
        subtitle="Monitor emission spikes, missed goals, and compliance warnings."
        breadcrumbs={[{ label: 'Sustainability' }]}
        actions={
          <Box display="flex" gap={1}>
            {['active', 'all'].map(f => (
              <Button key={f} variant={filter === f ? 'contained' : 'outlined'} size="small"
                onClick={() => setFilter(f)} sx={{ textTransform: 'capitalize' }}>
                {f === 'active' ? 'Active' : 'All Alerts'}
              </Button>
            ))}
          </Box>
        }
      />

      {error && <MuiAlert severity="error">{error}</MuiAlert>}

      {filtered.length === 0 ? (
        <Card><CardContent sx={{ p: 0 }}>
          <EmptyState emoji="🔔" title={filter === 'active' ? 'No active alerts' : 'No alerts'}
            description={filter === 'active' ? 'All clear — no unresolved alerts at this time.' : 'No alerts have been generated yet.'} />
        </CardContent></Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map(a => {
            const s = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.LOW;
            return (
              <Box key={a.id} sx={{
                p: 2.5, borderRadius: 3,
                bgcolor: a.resolved ? tokens.colors.surface : s.bg,
                border: `1px solid ${a.resolved ? tokens.colors.border : s.border}`,
                opacity: a.resolved ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                      <StatusBadge value={a.alertType} showDot={false} />
                      <StatusBadge value={a.severity} />
                      {a.resolved && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 100, bgcolor: '#F0FDF4' }}>
                          <CheckCircleOutlined sx={{ fontSize: 12, color: tokens.colors.primary }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: tokens.colors.primary }}>Resolved</Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 14, color: tokens.colors.text, lineHeight: 1.5, mb: 0.75 }}>
                      {a.message}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: tokens.colors.textMuted }}>
                      {new Date(a.createdAt).toLocaleString()}
                      {a.resolved && a.resolvedAt && ` · Resolved ${new Date(a.resolvedAt).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                  {!a.resolved && (isAdmin() || isManager()) && (
                    <Button variant="outlined" size="small" onClick={() => resolve(a.id)}
                      sx={{ flexShrink: 0, fontSize: 13, minHeight: 34 }}>
                      Resolve
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
