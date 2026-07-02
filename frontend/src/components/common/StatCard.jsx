import { Card, CardContent, Typography, Box } from '@mui/material';

function StatCard({ title, value, subtitle, icon, color = 'primary.main' }) {
    return (
        <Card>
            <CardContent>
                <Box display="flex"
                     justifyContent="space-between"
                     alignItems="flex-start">
                    <Box>
                        <Typography variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4"
                            fontWeight={700} color={color}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption"
                                color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {icon && (
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: `${color}15`,
                            color: color,
                            display: 'flex'
                        }}>
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default StatCard;
