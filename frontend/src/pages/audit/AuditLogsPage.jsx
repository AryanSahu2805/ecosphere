import { Box, Typography, Card, CardContent } from '@mui/material';

function AuditLogsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Audit Logs
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Audit trail — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AuditLogsPage;
