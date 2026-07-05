import {
    Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar,
    Divider, Box, Typography, Chip
} from '@mui/material';
import {
    Dashboard, Business, LocationOn,
    AccountTree, BoltOutlined, FlightTakeoff,
    Storage, TrackChanges, NotificationsActive,
    Assessment, History, Logout, EnergySavingsLeaf
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
    {
        label: 'Dashboard',
        icon: <Dashboard fontSize="small" />,
        path: '/app/dashboard',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Organizations',
        icon: <Business fontSize="small" />,
        path: '/app/organizations',
        roles: ['ADMIN'],
    },
    {
        label: 'Locations',
        icon: <LocationOn fontSize="small" />,
        path: '/app/locations',
        roles: ['ADMIN'],
    },
    {
        label: 'Departments',
        icon: <AccountTree fontSize="small" />,
        path: '/app/departments',
        roles: ['ADMIN'],
    },
    { divider: true, label: 'Carbon Tracking' },
    {
        label: 'Energy Records',
        icon: <BoltOutlined fontSize="small" />,
        path: '/app/energy-records',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Travel Records',
        icon: <FlightTakeoff fontSize="small" />,
        path: '/app/travel-records',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Server Usage',
        icon: <Storage fontSize="small" />,
        path: '/app/server-records',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    { divider: true, label: 'Sustainability' },
    {
        label: 'Goals',
        icon: <TrackChanges fontSize="small" />,
        path: '/app/goals',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Alerts',
        icon: <NotificationsActive fontSize="small" />,
        path: '/app/alerts',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Reports',
        icon: <Assessment fontSize="small" />,
        path: '/app/reports',
        roles: ['ADMIN', 'SUSTAINABILITY_MANAGER', 'AUDITOR'],
    },
    {
        label: 'Audit Logs',
        icon: <History fontSize="small" />,
        path: '/app/audit-logs',
        roles: ['ADMIN', 'AUDITOR'],
    },
];

function Sidebar({ mobileOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const visibleItems = navItems.filter(item =>
        item.divider || item.roles?.includes(user?.role)
    );

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <Toolbar sx={{ px: 2.5, minHeight: '64px !important' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '9px',
                        background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <EnergySavingsLeaf sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}
                        sx={{ color: '#F1F5F9', fontSize: '1rem' }}>
                        EcoSphere
                    </Typography>
                </Box>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* User info */}
            <Box sx={{ px: 2.5, py: 2 }}>
                <Typography variant="body2" fontWeight={600}
                    sx={{ color: '#F1F5F9', mb: 0.5 }}>
                    {user?.name}
                </Typography>
                <Chip
                    label={user?.role?.replace(/_/g, ' ')}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(22,163,74,0.15)',
                        color: '#4ADE80',
                        border: '1px solid rgba(22,163,74,0.25)',
                        fontWeight: 600, fontSize: '0.65rem',
                    }}
                />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* Nav items */}
            <List sx={{ flex: 1, py: 1, px: 1 }}>
                {visibleItems.map((item, idx) => {
                    if (item.divider) {
                        return (
                            <Box key={idx}>
                                <Divider sx={{
                                    mt: 1, mb: 0.5,
                                    borderColor: 'rgba(255,255,255,0.06)',
                                }} />
                                <Typography variant="overline" sx={{
                                    px: 1.5, py: 0.5, display: 'block',
                                    color: '#334155', fontSize: '0.6rem',
                                    letterSpacing: '0.1em', fontWeight: 700,
                                }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        );
                    }
                    const active = location.pathname.startsWith(item.path);
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                            <ListItemButton
                                onClick={() => handleNavigate(item.path)}
                                selected={active}
                                aria-current={active ? 'page' : undefined}
                                sx={{
                                    borderRadius: 2,
                                    px: 1.5, py: 0.875,
                                    color: active ? '#4ADE80' : '#94A3B8',
                                    borderLeft: active
                                        ? '3px solid #16A34A'
                                        : '3px solid transparent',
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(22,163,74,0.12)',
                                        '&:hover': { bgcolor: 'rgba(22,163,74,0.16)' },
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.04)',
                                        color: '#E2E8F0',
                                    },
                                    transition: 'all 0.15s ease',
                                }}>
                                <ListItemIcon sx={{
                                    minWidth: 32,
                                    color: active ? '#4ADE80' : '#64748B',
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <List sx={{ px: 1, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        aria-label="Sign out of EcoSphere"
                        sx={{
                            borderRadius: 2, px: 1.5, py: 0.875,
                            color: '#64748B',
                            '&:hover': {
                                bgcolor: 'rgba(239,68,68,0.08)',
                                color: '#F87171',
                                '& .MuiListItemIcon-root': { color: '#F87171' },
                            },
                        }}>
                        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Sign Out"
                            primaryTypographyProps={{ fontSize: '0.875rem' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            aria-label="Main navigation">
            <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                }}>
                {drawerContent}
            </Drawer>
            <Drawer variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
                }}
                open>
                {drawerContent}
            </Drawer>
        </Box>
    );
}

export { DRAWER_WIDTH };
export default Sidebar;
