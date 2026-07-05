import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Alert,
    CircularProgress, InputAdornment,
    IconButton, Stack
} from '@mui/material';
import {
    EnergySavingsLeaf, Visibility, VisibilityOff,
    ArrowBack, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';

function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData(
        prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.login(formData);
            const { token, name, email, role, organizationId } = res.data;
            login(token, { name, email, role, organizationId });
            navigate('/app/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally { setLoading(false); }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F172A' }}>
            {/* Left panel */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flex: '0 0 45%', flexDirection: 'column',
                justifyContent: 'space-between', p: 6,
                background: `
                    radial-gradient(ellipse at 30% 20%,
                      rgba(22,163,74,0.2) 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 70%,
                      rgba(13,148,136,0.15) 0%, transparent 50%),
                    #0F172A
                `,
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Box>
                    <Box display="flex" alignItems="center" gap={1.5} mb={8}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <EnergySavingsLeaf sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9' }}>
                            EcoSphere
                        </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={700}
                        sx={{ color: '#F8FAFC', lineHeight: 1.2, mb: 2 }}>
                        Welcome back to your sustainability dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', lineHeight: 1.7 }}>
                        Track emissions, monitor goals, and generate compliance
                        reports for your organization.
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 5 }}>
                        {[
                            'Real-time CO₂ calculations',
                            'Role-based access control',
                            'ESG-ready PDF reports',
                            'Automated alert system',
                        ].map(item => (
                            <Box key={item} display="flex" alignItems="center" gap={1.5}>
                                <CheckCircle sx={{ color: '#16A34A', fontSize: 18 }} />
                                <Typography variant="body2"
                                    sx={{ color: '#94A3B8', fontWeight: 500 }}>
                                    {item}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}
                    sx={{ color: '#475569', alignSelf: 'flex-start',
                          '&:hover': { color: '#94A3B8' } }}>
                    Back to home
                </Button>
            </Box>

            {/* Right panel */}
            <Box sx={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', p: { xs: 3, md: 6 },
                bgcolor: '#FFFFFF', borderRadius: { md: '24px 0 0 24px' },
            }}>
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center', gap: 1, mb: 4,
                    }}>
                        <EnergySavingsLeaf color="primary" />
                        <Typography variant="h6" fontWeight={700} color="primary">
                            EcoSphere
                        </Typography>
                    </Box>

                    <Typography variant="h4" fontWeight={700}
                        sx={{ color: '#0F172A', mb: 1 }}>
                        Sign in
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={4}>
                        Enter your credentials to access your dashboard
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField fullWidth label="Email address" name="email"
                            type="email" value={formData.email}
                            onChange={handleChange} required
                            autoComplete="email" sx={{ mb: 2.5 }}
                            inputProps={{ 'aria-label': 'Email address' }} />

                        <TextField fullWidth label="Password" name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password} onChange={handleChange}
                            required autoComplete="current-password" sx={{ mb: 4 }}
                            inputProps={{ 'aria-label': 'Password' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            onClick={() => setShowPassword(p => !p)}
                                            edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }} />

                        <Button type="submit" fullWidth variant="contained"
                            size="large" disabled={loading}
                            aria-label="Sign in to EcoSphere"
                            sx={{
                                py: 1.75, fontSize: '1rem',
                                background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                                mb: 3,
                            }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                        </Button>
                    </Box>

                    <Typography variant="body2" textAlign="center" color="text.secondary">
                        Don't have an account?{' '}
                        <Link to="/register" style={{
                            color: '#16A34A', fontWeight: 600, textDecoration: 'none',
                        }}>
                            Create account
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default LoginPage;
