import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function ProtectedRoute({ requiredRole }) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center"
                 alignItems="center" minHeight="100vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
