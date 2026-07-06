import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton, Divider,
} from '@mui/material';
import {
  BusinessOutlined, PersonOutlined, EmailOutlined,
  LockOutlined, Visibility, VisibilityOff, ShieldOutlined, ArrowBack,
} from '@mui/icons-material';
import authApi from '../../api/authApi';
import { tokens } from '../../theme/theme';

const Label = ({ children }) => (
  <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>
    {children}
  </Box>
);

export default function RegisterPage() {
  const [form, setForm] = useState({
    organizationName: '', name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const navigate = useNavigate();

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.registerCompany({
        organizationName: form.organizationName,
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess('Organization created! Your admin account is ready.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.colors.bg }}>

      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', flex: '0 0 40%',
        bgcolor: tokens.colors.dark, p: 6,
        position: 'relative', overflow: 'hidden', justifyContent: 'space-between',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', top: -100, right: -100, bgcolor: '#16A34A', opacity: 0.06, pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={8}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>E</Typography>
            </Box>
            <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>EcoSphere</Typography>
          </Box>

          <Typography sx={{ color: '#F8FAFC', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 2 }}>
            Start measuring your carbon footprint today
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 14, lineHeight: 1.7 }}>
            Create your organization's workspace and start tracking CO₂ emissions across every department, location, and activity.
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              'Organization workspace created instantly',
              'Full administrator access from day one',
              'Invite your team via email',
              'ESG-ready reports in minutes',
            ].map(item => (
              <Box key={item} display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tokens.colors.primary, flexShrink: 0 }} />
                <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ color: '#334155', fontSize: 12, position: 'relative', zIndex: 1 }}>
          © 2026 EcoSphere. Enterprise Carbon Intelligence Platform.
        </Typography>
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 }, overflowY: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 440, py: 2 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: 'monospace' }}>E</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>EcoSphere</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' }, pl: 0 }}>
              Back to home
            </Button>
          </Box>

          <Typography sx={{ fontSize: 24, fontWeight: 700, color: tokens.colors.text, letterSpacing: '-0.02em', mb: 0.75 }}>
            Register your organization
          </Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec, mb: 3 }}>
            Set up your company's workspace and get started.
          </Typography>

          {error   && <Alert severity="error"   sx={{ mb: 2.5 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

          <Box component="form" onSubmit={submit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Label>Organization Name</Label>
              <TextField fullWidth name="organizationName" value={form.organizationName} onChange={handle} required
                placeholder="e.g. Acme Corporation" helperText="This will be your company's workspace"
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Your Full Name</Label>
              <TextField fullWidth name="name" value={form.name} onChange={handle} required
                placeholder="e.g. Jane Smith"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Work Email</Label>
              <TextField fullWidth name="email" type="email" value={form.email} onChange={handle} required
                placeholder="e.g. jane@yourcompany.com" autoComplete="email"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Password</Label>
              <TextField fullWidth name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} required
                placeholder="Min. 8 characters" autoComplete="new-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(p => !p)} edge="end" aria-label="Toggle password visibility">
                        {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Confirm Password</Label>
              <TextField fullWidth name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handle} required
                placeholder="Re-enter your password" autoComplete="new-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm(p => !p)} edge="end" aria-label="Toggle confirm password visibility">
                        {showConfirm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || !!success}
              sx={{ mt: 0.5, bgcolor: tokens.colors.primary, '&:hover': { bgcolor: tokens.colors.primaryDk } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Organization Account'}
            </Button>
          </Box>

          <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}` }}>
            <Typography sx={{ fontSize: 12, color: tokens.colors.textSec, textAlign: 'center', lineHeight: 1.5 }}>
              Your account will have <strong>Administrator access</strong>. You can invite team members from your dashboard after signing in.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: tokens.colors.primary, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: tokens.colors.textMuted }}>
            <ShieldOutlined sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 11 }}>Enterprise Grade Security · JWT Authentication</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
