import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton, Chip,
} from '@mui/material';
import {
  LockOutlined, Visibility, VisibilityOff,
  CheckCircleOutlined, ErrorOutlineRounded, PersonOutlined,
} from '@mui/icons-material';
import invitationsApi from '../../api/invitationsApi';
import { tokens } from '../../theme/theme';

const Label = ({ children }) => (
  <Box component="label" sx={{ fontSize: 13, fontWeight: 600, color: tokens.colors.text, display: 'block', mb: 0.75 }}>
    {children}
  </Box>
);

const ROLE_DISPLAY = {
  SUSTAINABILITY_MANAGER: 'Sustainability Manager',
  AUDITOR: 'Auditor',
};

export default function AcceptInvitePage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [formData,   setFormData]   = useState({ name: '', password: '', confirmPassword: '' });
  const [showPw,     setShowPw]     = useState(false);
  const [showCfm,    setShowCfm]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await invitationsApi.validate(token);
        if (res.data.valid) {
          setInvitation(res.data);
        } else {
          setError(res.data.message);
        }
      } catch {
        setError('Unable to validate invitation. Please try again.');
      } finally { setLoading(false); }
    };
    validate();
  }, [token]);

  const handle = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError('Name is required.'); return; }
    if (formData.password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setFormError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      await invitationsApi.accept({ token, name: formData.name, password: formData.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally { setSubmitting(false); }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: tokens.colors.bg, gap: 2 }}>
        <CircularProgress sx={{ color: tokens.colors.primary }} />
        <Typography sx={{ color: tokens.colors.textSec, fontSize: 14 }}>Validating your invitation…</Typography>
      </Box>
    );
  }

  // Success state
  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: tokens.colors.bg, p: 3 }}>
        <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 4, border: `1px solid ${tokens.colors.border}` }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <CheckCircleOutlined sx={{ fontSize: 32, color: tokens.colors.primary }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: tokens.colors.text, mb: 1 }}>Account Created!</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec }}>Redirecting you to sign in…</Typography>
        </Box>
      </Box>
    );
  }

  // Error state (invalid/expired token)
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: tokens.colors.bg, p: 3 }}>
        <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 4, border: `1px solid ${tokens.colors.border}` }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <ErrorOutlineRounded sx={{ fontSize: 32, color: tokens.colors.danger }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: tokens.colors.text, mb: 1 }}>Invalid Invitation</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec, mb: 3 }}>{error}</Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ bgcolor: tokens.colors.primary }}>Go to Sign In</Button>
        </Box>
      </Box>
    );
  }

  // Valid invitation — show the form
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.colors.bg }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        justifyContent: 'space-between', flex: '0 0 40%',
        bgcolor: tokens.colors.dark, p: 6, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E")` }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={8}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>E</Typography>
            </Box>
            <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16 }}>EcoSphere</Typography>
          </Box>

          <Typography sx={{ color: '#F8FAFC', fontSize: 24, fontWeight: 700, lineHeight: 1.25, mb: 2 }}>
            You've been invited to join{' '}
            <Box component="span" sx={{ color: '#4ADE80' }}>{invitation?.organizationName}</Box>
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, mb: 3 }}>
            Set up your account to start collaborating on carbon emissions tracking and sustainability goals.
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'rgba(22,163,74,0.08)', borderRadius: 2, border: '1px solid rgba(22,163,74,0.2)', display: 'inline-flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Your role</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
              {ROLE_DISPLAY[invitation?.role] || invitation?.role}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ color: '#334155', fontSize: 12, position: 'relative', zIndex: 1 }}>
          © 2026 EcoSphere. Enterprise Carbon Intelligence Platform.
        </Typography>
      </Box>

      {/* Right panel — form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 }, overflowY: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 420, py: 2 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: tokens.colors.text, letterSpacing: '-0.02em', mb: 0.75 }}>
            Accept your invitation
          </Typography>
          <Typography sx={{ fontSize: 14, color: tokens.colors.textSec, mb: 3 }}>
            Create your account to join <strong>{invitation?.organizationName}</strong>.
          </Typography>

          {/* Email locked */}
          <Box sx={{ mb: 2.5 }}>
            <Label>Email address</Label>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2, py: 1.25, borderRadius: 2, bgcolor: tokens.colors.surface,
              border: `1px solid ${tokens.colors.border}`,
            }}>
              <Typography sx={{ fontSize: 14, color: tokens.colors.text, fontWeight: 500 }}>
                {invitation?.invitedEmail}
              </Typography>
              <Chip
                label={ROLE_DISPLAY[invitation?.role] || invitation?.role}
                size="small"
                sx={{ bgcolor: tokens.colors.primaryLt, color: tokens.colors.primaryDk, fontWeight: 700, fontSize: 11 }}
              />
            </Box>
          </Box>

          {formError && <Alert severity="error" sx={{ mb: 2.5 }}>{formError}</Alert>}

          <Box component="form" onSubmit={submit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Label>Full Name</Label>
              <TextField fullWidth name="name" value={formData.name} onChange={handle} required
                placeholder="e.g. Priya Sharma"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Password</Label>
              <TextField fullWidth name="password" type={showPw ? 'text' : 'password'} value={formData.password} onChange={handle} required
                placeholder="Min. 8 characters" autoComplete="new-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(p => !p)} edge="end" aria-label="Toggle password">
                        {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Box>
              <Label>Confirm Password</Label>
              <TextField fullWidth name="confirmPassword" type={showCfm ? 'text' : 'password'} value={formData.confirmPassword} onChange={handle} required
                placeholder="Re-enter your password" autoComplete="new-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: tokens.colors.textMuted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowCfm(p => !p)} edge="end" aria-label="Toggle confirm password">
                        {showCfm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { height: 46 } }} />
            </Box>

            <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}
              sx={{ mt: 0.5, bgcolor: tokens.colors.primary, '&:hover': { bgcolor: tokens.colors.primaryDk } }}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Accept Invitation & Create Account'}
            </Button>
          </Box>

          <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, textAlign: 'center', mt: 3 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: tokens.colors.primary, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
