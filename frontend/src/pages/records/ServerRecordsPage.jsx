import { Box, Typography, Card, CardContent } from '@mui/material';

function ServerRecordsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Server Usage
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Server usage records — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ServerRecordsPage;
