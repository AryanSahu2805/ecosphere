import { Box, Typography, Card, CardContent } from '@mui/material';

function EnergyRecordsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Energy Records
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Energy records tracking — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default EnergyRecordsPage;
