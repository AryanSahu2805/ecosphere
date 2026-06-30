import { Box, Typography, Card, CardContent } from '@mui/material';

function ReportsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Reports
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        PDF and CSV reports — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ReportsPage;
