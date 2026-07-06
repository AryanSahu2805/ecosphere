import { Drawer, Box, Typography, Divider } from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  AccountTreeOutlined,
  BoltOutlined,
  FlightTakeoffOutlined,
  StorageOutlined,
  TrackChangesOutlined,
  AssessmentOutlined,
  NotificationsOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokens } from '../../theme/theme';

export const DRAWER_WIDTH = 260;

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 18 }} />, path: '/app/dashboard', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Users',         icon: <PeopleOutlined   sx={{ fontSize: 18 }} />, path: '/app/users',         roles: ['ADMIN'] },
      { label: 'Structure', icon: <AccountTreeOutlined sx={{ fontSize: 18 }} />, path: '/app/structure', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Carbon Tracking',
    items: [
      { label: 'Energy Records', icon: <BoltOutlined sx={{ fontSize: 18 }} />, path: '/app/energy-records', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
      { label: 'Travel Records', icon: <FlightTakeoffOutlined sx={{ fontSize: 18 }} />, path: '/app/travel-records', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
      { label: 'Server Usage', icon: <StorageOutlined sx={{ fontSize: 18 }} />, path: '/app/server-records', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
    ],
  },
  {
    label: 'Sustainability',
    items: [
      { label: 'Goals', icon: <TrackChangesOutlined sx={{ fontSize: 18 }} />, path: '/app/goals', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
      { label: 'Reports', icon: <AssessmentOutlined sx={{ fontSize: 18 }} />, path: '/app/reports', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
      { label: 'Alerts', icon: <NotificationsOutlined sx={{ fontSize: 18 }} />, path: '/app/alerts', roles: ['ADMIN','SUSTAINABILITY_MANAGER','AUDITOR'] },
      { label: 'Audit Logs', icon: <HistoryOutlined sx={{ fontSize: 18 }} />, path: '/app/audit-logs', roles: ['ADMIN','AUDITOR'] },
    ],
  },
];

function NavItem({ item, active, onClick }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      aria-current={active ? 'page' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: '9px',
        borderRadius: 2,
        cursor: 'pointer',
        mx: 1.5,
        transition: 'all 0.12s ease',
        userSelect: 'none',
        ...(active ? {
          bgcolor: tokens.colors.primary,
          '& .nav-icon': { color: '#fff' },
          '& .nav-label': { color: '#fff', fontWeight: 600 },
        } : {
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.06)',
            '& .nav-icon': { color: '#CBD5E1' },
            '& .nav-label': { color: '#CBD5E1' },
          },
          '& .nav-icon': { color: '#64748B' },
          '& .nav-label': { color: '#94A3B8' },
        }),
      }}>
      <Box className="nav-icon" sx={{ display: 'flex', flexShrink: 0 }}>
        {item.icon}
      </Box>
      <Typography className="nav-label" sx={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1 }}>
        {item.label}
      </Typography>
    </Box>
  );
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const go = path => { navigate(path); onClose?.(); };
  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = user?.role?.replace(/_/g, ' ') || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5 }}>
        <Box sx={{
          width: 30, height: 30, borderRadius: 1.5,
          bgcolor: tokens.colors.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'monospace', lineHeight: 1 }}>E</Typography>
        </Box>
        <Box>
          <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1 }}>
            EcoSphere
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: 10, fontWeight: 500, mt: 0.25, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Carbon Intelligence
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_GROUPS.map((group, gi) => {
          const visible = group.items.filter(item => item.roles.includes(user?.role));
          if (!visible.length) return null;
          return (
            <Box key={gi}>
              {group.label && (
                <Typography sx={{
                  px: 3, pt: gi === 0 ? 0 : 1.5, pb: 0.75,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#334155',
                }}>
                  {group.label}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {visible.map(item => (
                  <NavItem
                    key={item.path}
                    item={item}
                    active={pathname.startsWith(item.path)}
                    onClick={() => go(item.path)}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, mb: 1 }} />

      {/* User profile */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 1.5, borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          mb: 1,
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            bgcolor: tokens.colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, noWrap: true }}>
              {user?.name || 'User'}
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: 11, textTransform: 'capitalize', lineHeight: 1.2, mt: 0.1 }}>
              {roleLabel.toLowerCase()}
            </Typography>
          </Box>
        </Box>

        {/* Logout */}
        <Box
          onClick={handleLogout}
          role="button"
          aria-label="Sign out"
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: '9px', borderRadius: 2, cursor: 'pointer',
            '& .lo-icon': { color: '#64748B' },
            '& .lo-label': { color: '#64748B' },
            '&:hover': {
              bgcolor: 'rgba(239,68,68,0.08)',
              '& .lo-icon': { color: '#F87171' },
              '& .lo-label': { color: '#F87171' },
            },
            transition: 'all 0.12s ease',
          }}>
          <Box className="lo-icon" sx={{ display: 'flex' }}>
            <LogoutOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography className="lo-label" sx={{ fontSize: 14, fontWeight: 500 }}>
            Sign Out
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }} aria-label="Main navigation">
      {/* Mobile */}
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
        <SidebarContent onClose={onClose} />
      </Drawer>

      {/* Desktop */}
      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        open>
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
