import { useState } from 'react';
import {
    Box, Card, CardContent, Typography, Grid,
    TextField, Button, CircularProgress,
    Alert, Snackbar
} from '@mui/material';
import {
    Assessment, TableChart, PictureAsPdf
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import reportsApi from '../../api/reportsApi';

const REPORTS = [
    {
        key: 'summaryCsv',
        title: 'Emissions Summary CSV',
        description: 'Summary of CO2 emissions by category',
        icon: <Assessment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
        apiFn: (orgId, from, to) =>
            reportsApi.downloadSummaryCsv(orgId, from, to),
        filename: (orgId) => `emissions-summary-${orgId}.csv`,
        color: 'primary',
    },
    {
        key: 'energyCsv',
        title: 'Energy Records CSV',
        description: 'Detailed energy consumption records',
        icon: <TableChart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
        apiFn: (orgId, from, to) =>
            reportsApi.downloadEnergyRecordsCsv(orgId, from, to),
        filename: (orgId) => `energy-records-${orgId}.csv`,
        color: 'primary',
    },
    {
        key: 'summaryPdf',
        title: 'Emissions Report PDF',
        description: 'Formal PDF report for auditors and compliance',
        icon: <PictureAsPdf sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />,
        apiFn: (orgId, from, to) =>
            reportsApi.downloadSummaryPdf(orgId, from, to),
        filename: (orgId) => `emissions-report-${orgId}.pdf`,
        color: 'secondary',
    },
];

function ReportsPage() {
    const { user } = useAuth();
    const [orgId, setOrgId] = useState(
        user?.organizationId || 1
    );
    const [dateRange, setDateRange] = useState({
        from: '2024-01-01',
        to: new Date().toISOString().split('T')[0],
    });
    const [downloading, setDownloading] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false, message: '', severity: 'success'
    });

    const handleDownload = async (reportKey, apiFn, filename) => {
        setDownloading(prev => ({ ...prev, [reportKey]: true }));
        try {
            const res = await apiFn(
                orgId, dateRange.from, dateRange.to
            );
            const url = window.URL.createObjectURL(
                new Blob([res.data])
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to download report',
                severity: 'error'
            });
        } finally {
            setDownloading(prev => ({
                ...prev, [reportKey]: false
            }));
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Reports & Exports
            </Typography>

            {/* Parameters card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" mb={2}>
                        Report Parameters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Organization ID"
                                type="number"
                                value={orgId}
                                onChange={(e) =>
                                    setOrgId(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="From Date"
                                type="date"
                                value={dateRange.from}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) =>
                                    setDateRange(prev => ({
                                        ...prev, from: e.target.value
                                    }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="To Date"
                                type="date"
                                value={dateRange.to}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) =>
                                    setDateRange(prev => ({
                                        ...prev, to: e.target.value
                                    }))}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Report cards */}
            <Grid container spacing={3}>
                {REPORTS.map((report) => (
                    <Grid item xs={12} sm={6} md={4}
                        key={report.key}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}>
                                <Box>
                                    {report.icon}
                                    <Typography variant="h6">
                                        {report.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={2}>
                                        {report.description}
                                    </Typography>
                                </Box>
                                <Box mt="auto">
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color={report.color}
                                        disabled={
                                            !!downloading[report.key]
                                        }
                                        onClick={() =>
                                            handleDownload(
                                                report.key,
                                                report.apiFn,
                                                report.filename(orgId)
                                            )}>
                                        {downloading[report.key]
                                            ? <CircularProgress
                                                size={20}
                                                color="inherit" />
                                            : 'Download'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{
                    vertical: 'bottom', horizontal: 'center'
                }}>
                <Alert severity={snackbar.severity}
                    onClose={() =>
                        setSnackbar(prev => ({
                            ...prev, open: false
                        }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ReportsPage;
