import {
    AppBar, Toolbar, IconButton, Typography,
    Box, Avatar, Tooltip
} from '@mui/material';
import { Menu as MenuIcon, EnergySavingsLeaf } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

function Navbar({ onMenuClick }) {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ')
            .map(n => n[0]).join('').toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                <Box sx={{ display: 'flex',
                           alignItems: 'center', gap: 1 }}>
                    <EnergySavingsLeaf color="primary" />
                    <Typography variant="h6" fontWeight={600}
                        color="primary">
                        EcoSphere
                    </Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Tooltip title={user?.email || ''}>
                    <Avatar
                        sx={{
                            bgcolor: 'primary.main',
                            width: 36, height: 36,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}>
                        {getInitials(user?.name)}
                    </Avatar>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
