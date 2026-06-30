import { Box, Typography, Card, CardContent } from '@mui/material';

function LocationsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Locations
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Locations management — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LocationsPage;
