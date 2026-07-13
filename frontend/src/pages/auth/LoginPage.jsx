import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton,
  Checkbox, FormControlLabel, Divider,
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Visibility, VisibilityOff,
  CheckCircle, ShieldOutlined, VerifiedUserOutlined, ArrowBack,
} from '@mui/icons-material';
import { Link as MuiLink } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { tokens } from '../../theme/theme';

const FEATURES = [
  'Real-time Carbon Tracking',
  'ESG Compliance Reporting',
  'Automated Emission Calculations',
  'Multi-Organization Support',
  'Enterprise Grade Security',
];

// Fixed label — no float issues
function InputField({ label, type = 'text', name, value, onChange, startIcon, endAdornment, autoComplete }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, mb: 0.75, display: 'block' }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        InputLabelProps={{ shrink: false }}
        label=""
        placeholder={`Enter your ${label.toLowerCase()}`}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ) : undefined,
          endAdornment,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 48,
            fontSize: 14,
            '& input': { py: 0 },
          },
        }}
      />
    </Box>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { token, name, email, role, organizationId } = res.data;
      login(token, { name, email, role, organizationId });
      navigate('/app/dashboard');
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMsg  = err.response?.data?.error;
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email address before signing in. Check your inbox for a message from EcoSphere.');
      } else {
        setError(errorMsg || 'Invalid email or password.');
      }
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.colors.bg }}>

      {/* ─── Left: Branding panel ─────────────────────────────── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        flex: '0 0 42%',
        bgcolor: tokens.colors.dark,
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Accent circle */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', top: -120, right: -160,
          bgcolor: '#16A34A', opacity: 0.07,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', bottom: 40, left: -80,
          bgcolor: '#16A34A', opacity: 0.05,
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: tokens.colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'monospace' }}>E</Typography>
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            EcoSphere
          </Typography>
        </Box>

        {/* Headline */}
        <Box sx={{ mt: 'auto', mb: 6, position: 'relative', zIndex: 1 }}>
          <Typography sx={{
            color: '#F8FAFC', fontSize: 30, fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.2, mb: 2,
          }}>
            Enterprise Carbon<br />Intelligence Platform
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, mb: 4 }}>
            Track, analyze, and reduce your organization's carbon footprint with precision.
            Built for enterprise ESG compliance.
          </Typography>

          {/* Feature checklist */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {FEATURES.map(f => (
              <Box key={f} display="flex" alignItems="center" gap={1.5}>
                <Box sx={{
                  width: 20, height: 20, borderRadius: '50%',
                  bgcolor: 'rgba(22,163,74,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle sx={{ fontSize: 12, color: tokens.colors.primary }} />
                </Box>
                <Typography sx={{ color: '#CBD5E1', fontSize: 14, fontWeight: 500 }}>
                  {f}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Trust badges */}
        <Box sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1 }}>
          {[
            { icon: <ShieldOutlined sx={{ fontSize: 14 }} />, text: 'JWT Secured' },
            { icon: <VerifiedUserOutlined sx={{ fontSize: 14 }} />, text: 'Enterprise Grade' },
          ].map(b => (
            <Box key={b.text} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.75, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Box sx={{ color: tokens.colors.primary }}>{b.icon}</Box>
              <Typography sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>{b.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right: Login form ────────────────────────────────── */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', p: { xs: 3, sm: 6 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: 1.5,
              bgcolor: tokens.colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>E</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>EcoSphere</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' }, pl: 0 }}>
              Back to home
            </Button>
          </Box>

          <Typography sx={{ fontSize: 26, fontWeight: 700, color: tokens.colors.text, letterSpacing: '-0.02em', mb: 0.75 }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec, mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={submit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <InputField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              autoComplete="email"
              startIcon={<EmailOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} />}
            />

            <InputField
              label="Password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              autoComplete="current-password"
              startIcon={<LockOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} />}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw(p => !p)} edge="end"
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                  </IconButton>
                </InputAdornment>
              }
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)}
                  sx={{ '&.Mui-checked': { color: tokens.colors.primary } }} />}
                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
              />
              <MuiLink component="button" variant="body2" onClick={() => {}}
                sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 0.5, bgcolor: tokens.colors.primary, '&:hover': { bgcolor: tokens.colors.primaryDk } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: tokens.colors.primary, fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </Typography>

          {/* Security note */}
          <Box sx={{
            mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            color: tokens.colors.textMuted,
          }}>
            <ShieldOutlined sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11 }}>
              Protected by JWT Authentication · Enterprise Grade Security
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
