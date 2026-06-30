import { BrowserRouter, Routes, Route, Navigate }
    from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OrganizationsPage
    from './pages/organizations/OrganizationsPage';
import LocationsPage from './pages/locations/LocationsPage';
import DepartmentsPage
    from './pages/departments/DepartmentsPage';
import EnergyRecordsPage
    from './pages/records/EnergyRecordsPage';
import TravelRecordsPage
    from './pages/records/TravelRecordsPage';
import ServerRecordsPage
    from './pages/records/ServerRecordsPage';
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

                        {/* Protected routes */}
                        <Route path="/app"
                            element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="dashboard"
                                    element={<DashboardPage />}/>
                                <Route path="organizations"
                                    element={<OrganizationsPage />}/>
                                <Route path="locations"
                                    element={<LocationsPage />}/>
                                <Route path="departments"
                                    element={<DepartmentsPage />}/>
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
                            element={<Navigate to="/login"
                                replace />} />
                        <Route path="*"
                            element={<Navigate to="/login"
                                replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
