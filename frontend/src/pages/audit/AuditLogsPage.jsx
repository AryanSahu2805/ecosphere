import { useState, useEffect } from 'react';
import { Box, Alert, Button } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';
import { DataTable, PageShell } from '../../components/ui';
import { PageSkeleton } from '../../components/ui/SkeletonLoader';
import { tokens } from '../../theme/theme';
import auditLogsApi from '../../api/auditLogsApi';

const ACTION_COLORS = {
  CREATE: { bg: '#F0FDF4', color: tokens.colors.primary },
  UPDATE: { bg: '#EFF6FF', color: '#2563EB' },
  DELETE: { bg: '#FEF2F2', color: tokens.colors.danger },
  LOGIN:  { bg: '#F5F3FF', color: '#7C3AED' },
  EXPORT: { bg: '#FFFBEB', color: '#CA8A04' },
};

function ActionBadge({ action }) {
  const s = ACTION_COLORS[action] || { bg: tokens.colors.surface, color: tokens.colors.textSec };
  return (
    <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.375, borderRadius: 1.5, bgcolor: s.bg }}>
      <Box sx={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.04em' }}>{action}</Box>
    </Box>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotal]  = useState(0);
  const size = 50;

  const load = async () => {
    try {
      setLoading(true);
      const res = await auditLogsApi.getRecent(page, size);
      setLogs(res.data.content);
      setTotal(res.data.totalPages);
    } catch { setError('Failed to load audit logs.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page]);

  const columns = [
    {
      key: 'createdAt', label: 'Timestamp', sortable: false,
      render: v => (
        <Box>
          <Box sx={{ fontSize: 13, fontWeight: 500, color: tokens.colors.text }}>{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Box>
          <Box sx={{ fontSize: 11, color: tokens.colors.textMuted }}>{new Date(v).toLocaleTimeString()}</Box>
        </Box>
      ),
    },
    {
      key: 'userEmail', label: 'User', sortable: false,
      render: v => (
        <Box>
          <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text }}>{v || 'SYSTEM'}</Box>
        </Box>
      ),
    },
    { key: 'action', label: 'Action', sortable: false, render: v => <ActionBadge action={v} /> },
    { key: 'entityType', label: 'Entity', sortable: false, render: v => v ? <Box sx={{ fontSize: 13, color: tokens.colors.textSec }}>{v}</Box> : '—' },
    { key: 'entityId', label: 'ID', sortable: false, render: v => v ? <Box sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.textSec }}>#{v}</Box> : '—' },
    {
      key: 'details', label: 'Details', sortable: false,
      render: v => <Box sx={{ fontSize: 12, color: tokens.colors.textSec, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</Box>,
    },
  ];

  if (loading && logs.length === 0) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="Audit Logs"
        subtitle="Complete trail of all user and system actions for compliance and security monitoring."
        breadcrumbs={[{ label: 'Sustainability' }]}
        actions={
          <Button variant="outlined" size="small" startIcon={<RefreshOutlined />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      <DataTable
        columns={columns}
        rows={logs}
        searchable={false}
        emptyTitle="No audit logs yet"
        emptyDescription="Audit entries will appear here as users perform actions in the system."
        emptyEmoji="📜"
        defaultRowsPerPage={25}
      />

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" gap={1.5} mt={1}>
          <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Box sx={{ px: 2, display: 'flex', alignItems: 'center', fontSize: 13, color: tokens.colors.textSec }}>Page {page + 1} of {totalPages}</Box>
          <Button variant="outlined" size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </Box>
      )}
    </Box>
  );
}
