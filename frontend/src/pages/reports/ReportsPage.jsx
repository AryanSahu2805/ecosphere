import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  CircularProgress, Alert, Snackbar, Grid, TextField,
} from '@mui/material';
import {
  DownloadOutlined, TableChartOutlined,
  AssessmentOutlined, SummarizeOutlined,
} from '@mui/icons-material';
import { PageShell } from '../../components/ui';
import { tokens } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import reportsApi from '../../api/reportsApi';

const Label = ({ children }) => <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>{children}</Box>;

const REPORTS = [
  {
    key: 'summaryCsv',
    icon: <SummarizeOutlined sx={{ fontSize: 28 }} />,
    title: 'Emissions Summary',
    format: 'CSV',
    description: 'Total CO₂ emissions by category with record counts for the selected period.',
    iconBg: '#F0FDF4', iconColor: tokens.colors.primary,
    apiFn: (orgId, from, to) => reportsApi.downloadSummaryCsv(orgId, from, to),
    filename: (orgId) => `emissions-summary-${orgId}.csv`,
  },
  {
    key: 'energyCsv',
    icon: <TableChartOutlined sx={{ fontSize: 28 }} />,
    title: 'Energy Records',
    format: 'CSV',
    description: 'Detailed energy consumption log with CO₂ calculations per department.',
    iconBg: '#FFFBEB', iconColor: '#CA8A04',
    apiFn: (orgId, from, to) => reportsApi.downloadEnergyRecordsCsv(orgId, from, to),
    filename: (orgId) => `energy-records-${orgId}.csv`,
  },
  {
    key: 'summaryPdf',
    icon: <AssessmentOutlined sx={{ fontSize: 28 }} />,
    title: 'Emissions Report',
    format: 'PDF',
    description: 'Formal PDF report suitable for auditors, regulators, and ESG disclosures.',
    iconBg: '#EFF6FF', iconColor: '#2563EB',
    apiFn: (orgId, from, to) => reportsApi.downloadSummaryPdf(orgId, from, to),
    filename: (orgId) => `emissions-report-${orgId}.pdf`,
  },
];

export default function ReportsPage() {
  const { getOrgId } = useAuth();
  const [orgId, setOrgId] = useState(getOrgId() || 1);
  const [dateRange, setDateRange] = useState({
    from: `${new Date().getFullYear()}-01-01`,
    to: new Date().toISOString().split('T')[0],
  });
  const [downloading, setDownloading] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const download = async (report) => {
    setDownloading(p => ({ ...p, [report.key]: true }));
    try {
      const res = await report.apiFn(orgId, dateRange.from, dateRange.to);
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', report.filename(orgId));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnack({ open: true, message: `${report.title} downloaded successfully.`, severity: 'success' });
    } catch {
      setSnack({ open: true, message: 'Failed to generate report. Please try again.', severity: 'error' });
    } finally {
      setDownloading(p => ({ ...p, [report.key]: false }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageShell
        title="Reports & Exports"
        subtitle="Generate and download audit-ready reports for ESG compliance and regulatory submissions."
        breadcrumbs={[{ label: 'Sustainability' }]}
      />

      {/* Parameters */}
      <Card>
        <CardContent>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2, color: tokens.colors.text }}>Report Parameters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Label>Organization ID</Label>
              <TextField fullWidth type="number" value={orgId} onChange={e => setOrgId(+e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Label>From Date</Label>
              <TextField fullWidth type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Label>To Date</Label>
              <TextField fullWidth type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report cards */}
      <Grid container spacing={2}>
        {REPORTS.map(report => (
          <Grid item xs={12} sm={6} md={4} key={report.key}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: 2.5,
                  bgcolor: report.iconBg, color: report.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                }}>
                  {report.icon}
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: tokens.colors.text }}>{report.title}</Typography>
                  <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}` }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: tokens.colors.textSec, letterSpacing: '0.06em' }}>{report.format}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, lineHeight: 1.5 }}>
                  {report.description}
                </Typography>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={downloading[report.key] ? <CircularProgress size={14} color="inherit" /> : <DownloadOutlined />}
                  disabled={!!downloading[report.key]}
                  onClick={() => download(report)}
                  sx={{ bgcolor: report.iconColor, '&:hover': { bgcolor: report.iconColor, filter: 'brightness(0.9)' } }}>
                  {downloading[report.key] ? 'Generating…' : `Download ${report.format}`}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
