import { Box, Typography, Card, CardContent } from '@mui/material';

function TravelRecordsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Travel Records
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Travel records tracking — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default TravelRecordsPage;
