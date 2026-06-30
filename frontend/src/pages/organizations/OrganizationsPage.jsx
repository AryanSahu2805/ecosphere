import { Box, Typography, Card, CardContent } from '@mui/material';

function OrganizationsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Organizations
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Organizations management — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default OrganizationsPage;
