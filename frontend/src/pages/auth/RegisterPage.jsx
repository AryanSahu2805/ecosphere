import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField,
    Button, Typography, Alert,
    CircularProgress, InputAdornment,
    IconButton, MenuItem, Select,
    FormControl, InputLabel
} from '@mui/material';
import { EnergySavingsLeaf, Visibility, VisibilityOff }
    from '@mui/icons-material';
import authApi from '../../api/authApi';

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AUDITOR',
    });
    const [showPassword, setShowPassword] =
        useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        setSuccess('');
        setLoading(true);
        try {
            await authApi.register(formData);
            setSuccess(
                'Account created! Redirecting to login…'
            );
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(
                err.response?.data?.error
                || 'Registration failed. Please try again.'
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
                        Create account
                    </Typography>

                    {error && (
                        <Alert severity="error"
                            sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success"
                            sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form"
                         onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }} />

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
                            sx={{ mb: 2 }}
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

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}>
                                <MenuItem value="ADMIN">
                                    Admin
                                </MenuItem>
                                <MenuItem
                                    value="SUSTAINABILITY_MANAGER">
                                    Sustainability Manager
                                </MenuItem>
                                <MenuItem value="AUDITOR">
                                    Auditor
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || !!success}>
                            {loading
                                ? <CircularProgress
                                    size={24}
                                    color="inherit" />
                                : 'Create account'}
                        </Button>
                    </Box>

                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2"
                            color="text.secondary">
                            Already have an account?{' '}
                            <Link to="/login"
                                style={{
                                    color: 'inherit',
                                    fontWeight: 600
                                }}>
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default RegisterPage;
