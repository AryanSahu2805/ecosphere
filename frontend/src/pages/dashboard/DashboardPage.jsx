import { Box, Typography, Card, CardContent } from '@mui/material';

function DashboardPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Dashboard
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Analytics and overview — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default DashboardPage;
