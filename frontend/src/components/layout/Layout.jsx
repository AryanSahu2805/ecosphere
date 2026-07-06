import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import { tokens } from '../../theme/theme';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.colors.bg }}>
      {/* Skip to main content — keyboard accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute', left: '-9999px', top: 0,
          bgcolor: tokens.colors.primary, color: '#fff',
          p: 1.5, zIndex: 9999, borderRadius: 1,
          textDecoration: 'none', fontWeight: 600, fontSize: 14,
          '&:focus': { left: 8, top: 8 },
        }}>
        Skip to main content
      </Box>

      <Navbar onMenuClick={() => setMobileOpen(p => !p)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: tokens.colors.bg,
          pt: '60px', // Navbar height
        }}>
        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
