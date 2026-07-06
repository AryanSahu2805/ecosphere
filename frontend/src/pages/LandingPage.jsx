import { Box, Typography, Button, Container,
         Chip, Stack }
    from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    EnergySavingsLeaf, BarChart, TrackChanges, Security,
    Assessment, Notifications, ArrowForward, CheckCircle
} from '@mui/icons-material';

function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <BarChart sx={{ fontSize: 32 }} />,
            title: 'Carbon Tracking',
            description:
                'Track energy, travel, and server emissions across every department and location in real time.',
            color: '#16A34A',
        },
        {
            icon: <TrackChanges sx={{ fontSize: 32 }} />,
            title: 'Sustainability Goals',
            description:
                'Set science-based targets, monitor progress automatically, and stay on track with live dashboards.',
            color: '#0D9488',
        },
        {
            icon: <Notifications sx={{ fontSize: 32 }} />,
            title: 'Intelligent Alerts',
            description:
                'Get notified when emissions spike or goals fall behind — before they become compliance issues.',
            color: '#2563EB',
        },
        {
            icon: <Assessment sx={{ fontSize: 32 }} />,
            title: 'ESG Reporting',
            description:
                'Generate audit-ready PDF and CSV reports for regulators, investors, and sustainability disclosures.',
            color: '#D97706',
        },
        {
            icon: <Security sx={{ fontSize: 32 }} />,
            title: 'Audit Trail',
            description:
                'Every action is logged. Full transparency for auditors with complete change history.',
            color: '#7C3AED',
        },
        {
            icon: <EnergySavingsLeaf sx={{ fontSize: 32 }} />,
            title: 'Multi-Org Support',
            description:
                'Manage multiple organizations, locations, and departments from a single enterprise dashboard.',
            color: '#0891B2',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A' }}>

            {/* Navigation bar */}
            <Box sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                backdropFilter: 'blur(20px)', bgcolor: 'rgba(15,23,42,0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                px: 4, py: 2, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
            }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <EnergySavingsLeaf sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9' }}>
                        EcoSphere
                    </Typography>
                    <Chip label="Enterprise" size="small" sx={{
                        bgcolor: 'rgba(22,163,74,0.15)', color: '#4ADE80',
                        border: '1px solid rgba(22,163,74,0.3)',
                        fontWeight: 600, fontSize: '0.7rem',
                    }} />
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" onClick={() => navigate('/login')}
                        sx={{
                            color: '#F1F5F9', borderColor: 'rgba(255,255,255,0.2)',
                            '&:hover': { borderColor: '#16A34A', bgcolor: 'rgba(22,163,74,0.1)' },
                        }}>
                        Sign In
                    </Button>
                    <Button variant="contained" onClick={() => navigate('/register')}
                        endIcon={<ArrowForward />}
                        sx={{
                            background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                            boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
                        }}>
                        Register Your Organization
                    </Button>
                </Stack>
            </Box>

            {/* Hero section */}
            <Box sx={{
                pt: { xs: 14, md: 18 }, pb: { xs: 10, md: 16 },
                px: { xs: 3, md: 6 }, position: 'relative',
                overflow: 'hidden', textAlign: 'center',
            }}>
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: `
                        radial-gradient(ellipse 80% 60% at 50% 0%,
                          rgba(22,163,74,0.15) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 80% 30%,
                          rgba(13,148,136,0.12) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 40% at 20% 30%,
                          rgba(37,99,235,0.1) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                }} />

                <Container maxWidth="md" sx={{ position: 'relative' }}>
                  <Box sx={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', textAlign: 'center',
                  }}>
                    <Chip label="🌿 Enterprise Carbon Intelligence Platform" sx={{
                        mb: 3, bgcolor: 'rgba(22,163,74,0.1)', color: '#4ADE80',
                        border: '1px solid rgba(22,163,74,0.25)',
                        fontWeight: 600, fontSize: '0.8rem', height: 32,
                    }} />

                    <Typography variant="h2" fontWeight={800} sx={{
                        color: '#F8FAFC',
                        fontSize: { xs: '2.5rem', md: '3.75rem' },
                        lineHeight: 1.15, letterSpacing: '-0.03em', mb: 3,
                    }}>
                        Measure, manage, and{' '}
                        <Box component="span" sx={{
                            background: 'linear-gradient(135deg, #4ADE80, #2DD4BF)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            reduce your carbon footprint
                        </Box>
                    </Typography>

                    <Typography variant="h6" sx={{
                        color: '#94A3B8', mb: 5, fontWeight: 400, lineHeight: 1.7,
                        fontSize: { xs: '1rem', md: '1.2rem' },
                    }}>
                        EcoSphere gives enterprises real-time visibility into CO₂
                        emissions across every department, location, and activity —
                        with the analytics and reporting needed for ESG compliance.
                    </Typography>

                    {/* CTA Buttons */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        mt: 4,
                        width: '100%',
                    }}>
                        <Button variant="contained" size="large"
                            onClick={() => navigate('/register')}
                            endIcon={<ArrowForward />}
                            sx={{
                                px: 4, py: 1.75, fontSize: '1rem',
                                background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                                boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(22,163,74,0.45)' },
                            }}>
                            Register Your Organization
                        </Button>
                        <Button variant="outlined" size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                px: 4, py: 1.75, fontSize: '1rem',
                                color: '#CBD5E1', borderColor: 'rgba(255,255,255,0.15)',
                                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' },
                            }}>
                            Sign In to Dashboard
                        </Button>
                    </Box>

                    {/* Trust badges */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 3,
                        mt: 3,
                        width: '100%',
                    }}>
                        {['JWT Secured', 'Role-Based Access', 'Audit Logging', 'ESG Ready']
                            .map(badge => (
                                <Box key={badge} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <CheckCircle sx={{ fontSize: 16, color: '#4ADE80' }} />
                                    <Typography variant="caption"
                                        sx={{ color: '#64748B', fontWeight: 500 }}>
                                        {badge}
                                    </Typography>
                                </Box>
                            ))}
                    </Box>
                  </Box>
                </Container>
            </Box>

            {/* Stats strip */}
            <Box sx={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.02)', py: 4,
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    maxWidth: 900, mx: 'auto', px: 4, gap: 2,
                }}>
                    {[
                        { value: '10+', label: 'Emission Sources Tracked' },
                        { value: '3', label: 'User Roles' },
                        { value: 'Real-time', label: 'CO₂ Calculations' },
                        { value: 'ESG', label: 'Compliance Ready' },
                    ].map(stat => (
                        <Box key={stat.label} textAlign="center">
                            <Typography variant="h4" fontWeight={800} sx={{
                                background: 'linear-gradient(135deg, #4ADE80, #2DD4BF)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="body2"
                                sx={{ color: '#64748B', fontWeight: 500 }}>
                                {stat.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Features grid */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 }, px: { xs: 3, md: 4 } }}>
                <Box textAlign="center" mb={8}>
                    <Typography variant="overline"
                        sx={{ color: '#4ADE80', fontWeight: 700, letterSpacing: '0.1em' }}>
                        EVERYTHING YOU NEED
                    </Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ color: '#F8FAFC', mt: 1 }}>
                        Enterprise-grade sustainability intelligence
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 3,
                    alignItems: 'stretch',
                }}>
                    {features.map(feature => (
                        <Box key={feature.title} sx={{
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 4, p: 3,
                            display: 'flex', flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                                borderColor: `${feature.color}40`,
                                transform: 'translateY(-4px)',
                                boxShadow: `0 16px 40px ${feature.color}15`,
                            },
                        }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: 3,
                                bgcolor: `${feature.color}20`,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                color: feature.color, mb: 2.5, fontSize: 28,
                            }}>
                                {feature.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={700}
                                sx={{ color: '#F1F5F9', mb: 1 }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2"
                                sx={{ color: '#64748B', lineHeight: 1.7, flexGrow: 1 }}>
                                {feature.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>

            {/* CTA section */}
            <Box sx={{
                bgcolor: 'rgba(22,163,74,0.06)', borderTop: '1px solid rgba(22,163,74,0.15)',
                py: { xs: 8, md: 12 }, textAlign: 'center', px: 3,
            }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: '#F8FAFC', mb: 2 }}>
                    Ready to take control of your carbon footprint?
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', mb: 5 }}>
                    Join forward-thinking enterprises using EcoSphere for
                    ESG compliance and sustainability reporting.
                </Typography>
                <Button variant="contained" size="large"
                    onClick={() => navigate('/register')}
                    endIcon={<ArrowForward />}
                    sx={{
                        px: 5, py: 2, fontSize: '1.05rem',
                        background: 'linear-gradient(135deg, #16A34A, #0D9488)',
                        boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
                    }}>
                    Register Your Organization
                </Button>
            </Box>

            {/* Footer */}
            <Box sx={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                py: 4, px: { xs: 3, md: 8 },
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 2,
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <EnergySavingsLeaf sx={{ color: '#16A34A', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                        EcoSphere
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#334155' }}>
                    © 2026 EcoSphere. Enterprise Carbon Intelligence Platform.
                </Typography>
            </Box>
        </Box>
    );
}

export default LandingPage;
