import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, ForestOutlined } from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'already' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axiosInstance.get(`/auth/verify?token=${token}`);
        if (res.data.message?.includes('already')) {
          setStatus('already');
        } else {
          setStatus('success');
        }
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Invalid or expired link.');
      }
    };
    verify();
  }, [token]);

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ bgcolor: '#0F172A' }}>
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2, borderRadius: 4 }}>
        <CardContent sx={{ p: 5, textAlign: 'center' }}>

          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={4}>
            <ForestOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} color="primary">EcoSphere</Typography>
          </Box>

          {status === 'loading' && (
            <>
              <CircularProgress color="primary" sx={{ mb: 3 }} />
              <Typography color="text.secondary">Verifying your email…</Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} mb={1}>Email Verified!</Typography>
              <Typography color="text.secondary" mb={4}>
                Your account is now active. You can sign in to your EcoSphere dashboard.
              </Typography>
              <Button variant="contained" fullWidth size="large"
                onClick={() => navigate('/login')}
                sx={{ background: 'linear-gradient(135deg,#16A34A,#0D9488)' }}>
                Sign In to Dashboard
              </Button>
            </>
          )}

          {status === 'already' && (
            <>
              <CheckCircle sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} mb={1}>Already Verified</Typography>
              <Typography color="text.secondary" mb={4}>
                Your email is already verified. Sign in to continue.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} mb={1}>Verification Failed</Typography>
              <Typography color="text.secondary" mb={4}>{message}</Typography>
              <Button component={Link} to="/register" variant="outlined" fullWidth>
                Back to Register
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}
