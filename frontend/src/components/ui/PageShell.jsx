import { Box, Typography, Breadcrumbs, Link, Button, Divider } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { tokens } from '../../theme/theme';

export default function PageShell({
  title,
  subtitle,
  breadcrumbs,   // [{ label: 'Home', href: '/app/dashboard' }, { label: 'Organizations' }]
  actions,       // React nodes for the right side
  divider = true,
  children,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: divider ? 0 : 3 }}>
        <Box>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNext sx={{ fontSize: 14, color: tokens.colors.textMuted }} />}
              sx={{ mb: 0.5 }}>
              {breadcrumbs.map((crumb, i) =>
                crumb.href ? (
                  <Link key={i} href={crumb.href} underline="hover"
                    sx={{ fontSize: 12, color: tokens.colors.textSec, fontWeight: 500 }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <Typography key={i} sx={{ fontSize: 12, color: tokens.colors.textMuted, fontWeight: 500 }}>
                    {crumb.label}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}
          <Typography variant="h2" sx={{ fontSize: tokens.fontSize.h2, fontWeight: 700, color: tokens.colors.text }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: tokens.colors.textSec, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0, mt: 0.5 }}>
            {actions}
          </Box>
        )}
      </Box>

      {divider && <Divider sx={{ my: 3 }} />}

      {children}
    </Box>
  );
}
