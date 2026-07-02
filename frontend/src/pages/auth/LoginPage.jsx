import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField,
    Button, Typography, Alert,
    CircularProgress, InputAdornment,
    IconButton
} from '@mui/material';
import { EnergySavingsLeaf, Visibility, VisibilityOff }
    from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '', password: ''
    });
    const [showPassword, setShowPassword] =
        useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.login(formData);
            const { token, name, email, role,
                    organizationId } = res.data;
            login(token, {
                name, email, role, organizationId
            });
            navigate('/app/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.error
                || 'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minHeight="100vh"
             display="flex"
             alignItems="center"
             justifyContent="center"
             bgcolor="background.default"
             p={2}>
            <Card sx={{ maxWidth: 420, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box textAlign="center" mb={4}>
                        <EnergySavingsLeaf sx={{
                            fontSize: 48,
                            color: 'primary.main'
                        }} />
                        <Typography variant="h5"
                            fontWeight={700}
                            color="primary">
                            EcoSphere
                        </Typography>
                        <Typography variant="body2"
                            color="text.secondary">
                            Enterprise Carbon Intelligence
                        </Typography>
                    </Box>

                    <Typography variant="h6"
                        fontWeight={600} mb={3}>
                        Sign in
                    </Typography>

                    {error && (
                        <Alert severity="error"
                            sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form"
                         onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }} />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword
                                ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment
                                        position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowPassword(
                                                    p => !p)}
                                            edge="end">
                                            {showPassword
                                                ? <VisibilityOff />
                                                : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }} />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}>
                            {loading
                                ? <CircularProgress
                                    size={24}
                                    color="inherit" />
                                : 'Sign in'}
                        </Button>
                    </Box>

                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2"
                            color="text.secondary">
                            Don't have an account?{' '}
                            <Link to="/register"
                                style={{
                                    color: 'inherit',
                                    fontWeight: 600
                                }}>
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LoginPage;
