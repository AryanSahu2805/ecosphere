import { useState, useEffect } from 'react';
import {
    Box, Card, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Typography, Chip, Button, Alert, CircularProgress
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import auditLogsApi from '../../api/auditLogsApi';

const actionColor = (action) => {
    switch (action) {
        case 'CREATE': return 'success';
        case 'UPDATE': return 'primary';
        case 'DELETE': return 'error';
        case 'LOGIN':  return 'default';
        case 'EXPORT': return 'secondary';
        default:       return 'default';
    }
};

function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 20;

    const loadLogs = async () => {
        try {
            setLoading(true);
            const res = await auditLogsApi.getRecent(
                page, pageSize
            );
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, [page]);

    return (
        <Box>
            <PageHeader title="Audit Logs" canAdd={false} />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Card>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Entity Type</TableCell>
                                    <TableCell>Entity ID</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}
                                            align="center">
                                            <Typography
                                                color="text.secondary">
                                                No audit logs found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Typography
                                                    variant="caption">
                                                    {new Date(log.createdAt)
                                                        .toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2">
                                                    {log.userEmail
                                                        || 'SYSTEM'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.action}
                                                    size="small"
                                                    color={actionColor(
                                                        log.action)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {log.entityType || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {log.entityId || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        maxWidth: 200,
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                    {log.details || '-'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            <Box display="flex" justifyContent="center"
                alignItems="center" gap={2} mt={2}>
                <Button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}>
                    Previous
                </Button>
                <Typography variant="body2">
                    Page {page + 1} of {totalPages || 1}
                </Typography>
                <Button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}>
                    Next
                </Button>
            </Box>
        </Box>
    );
}

export default AuditLogsPage;
