import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, LinearProgress, IconButton,
} from '@mui/material';
import {
  CheckCircle, RadioButtonUnchecked,
  LocationOn, AccountTree, BoltOutlined,
  PersonAdd, Close, ForestOutlined,
} from '@mui/icons-material';
import authApi from '../../api/authApi';

const STORAGE_KEY = 'ecosphere_onboarding_dismissed';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [status, setStatus]       = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await authApi.getOnboardingStatus();
      setStatus(res.data);
      const allDone =
        res.data.hasLocation &&
        res.data.hasDepartment &&
        res.data.hasRecord &&
        res.data.hasInvite;
      if (allDone) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setDismissed(true);
      }
    } catch {
      setDismissed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  if (loading || dismissed || !status) return null;

  const steps = [
    {
      key: 'hasLocation',
      label: 'Add your first office location',
      description: 'Set up where your organization operates',
      icon: <LocationOn fontSize="small" />,
      action: () => navigate('/app/structure'),
      actionLabel: 'Go to Structure',
    },
    {
      key: 'hasDepartment',
      label: 'Create a department',
      description: 'Organize teams within your locations',
      icon: <AccountTree fontSize="small" />,
      action: () => navigate('/app/structure'),
      actionLabel: 'Go to Structure',
    },
    {
      key: 'hasRecord',
      label: 'Log your first carbon record',
      description: 'Start tracking energy, travel, or server emissions',
      icon: <BoltOutlined fontSize="small" />,
      action: () => navigate('/app/energy-records'),
      actionLabel: 'Log Energy Record',
    },
    {
      key: 'hasInvite',
      label: 'Invite a team member',
      description: 'Add a Sustainability Manager or Auditor',
      icon: <PersonAdd fontSize="small" />,
      action: () => navigate('/app/users'),
      actionLabel: 'Go to Users',
    },
  ];

  const completedCount = steps.filter(s => status[s.key]).length;
  const progressPct    = (completedCount / 4) * 100;
  const nextStep       = steps.find(s => !status[s.key]);

  return (
    <Card sx={{
      mb: 3,
      border: '1px solid #BBF7D0',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      borderRadius: 3,
    }}>
      <CardContent sx={{ p: 3 }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 40, height: 40, bgcolor: '#16A34A', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ForestOutlined sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.dark">
                Complete Your Setup
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completedCount} of 4 steps completed
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleDismiss} aria-label="Dismiss setup guide"
            sx={{ color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Progress bar */}
        <LinearProgress variant="determinate" value={progressPct}
          sx={{
            mb: 2.5, height: 8, borderRadius: 4,
            bgcolor: '#D1FAE5',
            '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 4 },
          }}
        />

        {/* Steps grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {steps.map(step => {
            const done   = status[step.key];
            const isNext = nextStep?.key === step.key;
            return (
              <Box key={step.key} sx={{
                p: 2, borderRadius: 2,
                bgcolor: done ? '#DCFCE7' : isNext ? 'white' : '#F8FAFC',
                border: '1px solid',
                borderColor: done ? '#86EFAC' : isNext ? '#16A34A' : '#E2E8F0',
                display: 'flex', flexDirection: 'column', gap: 1,
                opacity: done ? 0.85 : 1,
              }}>
                <Box display="flex" alignItems="center" gap={1}>
                  {done
                    ? <CheckCircle sx={{ color: '#16A34A', fontSize: 20 }} />
                    : <RadioButtonUnchecked sx={{ color: isNext ? '#16A34A' : '#CBD5E1', fontSize: 20 }} />
                  }
                  <Typography variant="body2"
                    fontWeight={done ? 500 : 600}
                    sx={{
                      color: done ? '#166534' : '#0F172A',
                      textDecoration: done ? 'line-through' : 'none',
                      opacity: done ? 0.7 : 1,
                    }}>
                    {step.label}
                  </Typography>
                </Box>
                {!done && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                      {step.description}
                    </Typography>
                    {isNext && (
                      <Button size="small" variant="contained" onClick={step.action}
                        sx={{
                          ml: 3.5, alignSelf: 'flex-start',
                          fontSize: '0.75rem', py: 0.5,
                          background: 'linear-gradient(135deg,#16A34A,#0D9488)',
                        }}>
                        {step.actionLabel} →
                      </Button>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          You can dismiss this guide anytime using the × button. It won't appear again.
        </Typography>
      </CardContent>
    </Card>
  );
}
