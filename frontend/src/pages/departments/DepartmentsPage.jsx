import { Box, Typography, Card, CardContent } from '@mui/material';

function DepartmentsPage() {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Departments
            </Typography>
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Departments management — coming Day 12
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default DepartmentsPage;
