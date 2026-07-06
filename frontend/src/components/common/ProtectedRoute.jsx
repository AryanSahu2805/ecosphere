import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { tokens } from '../../theme/theme';

export default function ProtectedRoute({ requiredRole }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', bgcolor: tokens.colors.bg,
      }}>
        <CircularProgress size={32} sx={{ color: tokens.colors.primary }} />
      </Box>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
