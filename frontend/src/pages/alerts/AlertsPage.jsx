import { Box, Typography, Card, CardContent } from '@mui/material';

function AlertsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Alerts
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Alerts management — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AlertsPage;
