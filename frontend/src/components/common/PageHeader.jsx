import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

function PageHeader({ title, onAdd, addLabel = 'Add',
                      canAdd = true }) {
    return (
        <Box display="flex" justifyContent="space-between"
             alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={600}>
                {title}
            </Typography>
            {canAdd && onAdd && (
                <Button variant="contained"
                    startIcon={<Add />}
                    onClick={onAdd}>
                    {addLabel}
                </Button>
            )}
        </Box>
    );
}

export default PageHeader;
