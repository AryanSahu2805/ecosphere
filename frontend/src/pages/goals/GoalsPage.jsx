import { Box, Typography, Card, CardContent } from '@mui/material';

function GoalsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Goals
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Sustainability goals — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default GoalsPage;
