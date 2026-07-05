import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Phase 8: skip-to-main-content for keyboard users */}
            <Box
                component="a"
                href="#main-content"
                sx={{
                    position: 'absolute',
                    left: '-100%',
                    top: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 1,
                    zIndex: 9999,
                    borderRadius: 1,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:focus': { left: 8, top: 8 },
                }}>
                Skip to main content
            </Box>

            <Navbar onMenuClick={() => setMobileOpen(prev => !prev)} />
            <Sidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <Box
                component="main"
                id="main-content"
                sx={{
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
