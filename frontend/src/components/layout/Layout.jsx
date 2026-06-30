import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Navbar onMenuClick={() =>
                setMobileOpen(prev => !prev)} />
            <Sidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                bgcolor: 'background.default',
                minHeight: '100vh',
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}

export default Layout;
