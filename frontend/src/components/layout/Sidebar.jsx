import {
    Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar,
    Divider, Box, Typography, Chip
} from '@mui/material';
import {
    Dashboard, Business, LocationOn,
    AccountTree, BoltOutlined, FlightTakeoff,
    Storage, TrackChanges, NotificationsActive,
    Assessment, History, Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
    {
        label: 'Dashboard',
        icon: <Dashboard />,
        path: '/app/dashboard',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Organizations',
        icon: <Business />,
        path: '/app/organizations',
        roles: ['ADMIN'],
    },
    {
        label: 'Locations',
        icon: <LocationOn />,
        path: '/app/locations',
        roles: ['ADMIN'],
    },
    {
        label: 'Departments',
        icon: <AccountTree />,
        path: '/app/departments',
        roles: ['ADMIN'],
    },
    { divider: true, label: 'Carbon Tracking' },
    {
        label: 'Energy Records',
        icon: <BoltOutlined />,
        path: '/app/energy-records',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Travel Records',
        icon: <FlightTakeoff />,
        path: '/app/travel-records',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Server Usage',
        icon: <Storage />,
        path: '/app/server-records',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    { divider: true, label: 'Sustainability' },
    {
        label: 'Goals',
        icon: <TrackChanges />,
        path: '/app/goals',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Alerts',
        icon: <NotificationsActive />,
        path: '/app/alerts',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Reports',
        icon: <Assessment />,
        path: '/app/reports',
        roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'],
    },
    {
        label: 'Audit Logs',
        icon: <History />,
        path: '/app/audit-logs',
        roles: ['ADMIN','AUDITOR'],
    },
];

function Sidebar({ mobileOpen, onClose, variant }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
        if (variant === 'temporary') onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const visibleItems = navItems.filter(item =>
        item.divider || item.roles?.includes(user?.role)
    );

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column',
                   height: '100%' }}>
            <Toolbar sx={{ px: 2 }}>
                <Box>
                    <Typography variant="h6" color="primary"
                        fontWeight={700}>
                        EcoSphere
                    </Typography>
                    <Typography variant="caption"
                        color="text.secondary">
                        Carbon Intelligence
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2"
                    fontWeight={600}>
                    {user?.name}
                </Typography>
                <Chip
                    label={user?.role?.replace('_', ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.5, fontSize: '0.7rem' }}
                />
            </Box>
            <Divider />
            <List sx={{ flex: 1, py: 0 }}>
                {visibleItems.map((item, idx) => {
                    if (item.divider) {
                        return (
                            <Box key={idx}>
                                <Divider sx={{ mt: 1 }} />
                                <Typography
                                    variant="overline"
                                    sx={{ px: 2, py: 0.5,
                                          display: 'block',
                                          color: 'text.secondary',
                                          fontSize: '0.65rem' }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        );
                    }
                    const active = location.pathname
                        .startsWith(item.path);
                    return (
                        <ListItem key={item.path}
                            disablePadding>
                            <ListItemButton
                                onClick={() =>
                                    handleNavigate(item.path)}
                                selected={active}
                                sx={{
                                    mx: 1, borderRadius: 1,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '& .MuiListItemIcon-root':
                                            { color: 'white' },
                                        '&:hover': {
                                            bgcolor: 'primary.dark'
                                        }
                                    }
                                }}>
                                <ListItemIcon sx={{
                                    minWidth: 36,
                                    color: active
                                        ? 'inherit'
                                        : 'text.secondary'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem'
                                    }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}
                        sx={{ mx: 1, borderRadius: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Logout"
                            primaryTypographyProps={{
                                fontSize: '0.875rem'
                            }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box component="nav"
            sx={{ width: { md: DRAWER_WIDTH },
                  flexShrink: { md: 0 } }}>
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH
                    }
                }}>
                {drawerContent}
            </Drawer>
            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box'
                    }
                }}
                open>
                {drawerContent}
            </Drawer>
        </Box>
    );
}

export { DRAWER_WIDTH };
export default Sidebar;
