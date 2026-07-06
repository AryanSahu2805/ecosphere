import { BrowserRouter, Routes, Route, Navigate }
    from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import LandingPage from './pages/LandingPage';
import StructurePage from './pages/structure/StructurePage';
import UsersPage from './pages/users/UsersPage';
import AcceptInvitePage from './pages/auth/AcceptInvitePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EnergyRecordsPage from './pages/records/EnergyRecordsPage';
import TravelRecordsPage from './pages/records/TravelRecordsPage';
import ServerRecordsPage from './pages/records/ServerRecordsPage';
import GoalsPage from './pages/goals/GoalsPage';
import AlertsPage from './pages/alerts/AlertsPage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login"
                            element={<LoginPage />} />
                        <Route path="/register"
                            element={<RegisterPage />} />
                        <Route path="/accept-invite/:token"
                            element={<AcceptInvitePage />} />

                        {/* Protected routes */}
                        <Route path="/app"
                            element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="dashboard"
                                    element={<DashboardPage />}/>
                                <Route path="users"
                                    element={<UsersPage />}/>
                                <Route path="structure"
                                    element={<StructurePage />}/>
                                <Route path="energy-records"
                                    element={<EnergyRecordsPage />}/>
                                <Route path="travel-records"
                                    element={<TravelRecordsPage />}/>
                                <Route path="server-records"
                                    element={<ServerRecordsPage />}/>
                                <Route path="goals"
                                    element={<GoalsPage />}/>
                                <Route path="alerts"
                                    element={<AlertsPage />}/>
                                <Route path="reports"
                                    element={<ReportsPage />}/>
                                <Route path="audit-logs"
                                    element={<AuditLogsPage />}/>
                            </Route>
                        </Route>

                        {/* Redirects */}
                        <Route path="/"
                            element={<LandingPage />} />
                        <Route path="*"
                            element={<Navigate to="/"
                                replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
