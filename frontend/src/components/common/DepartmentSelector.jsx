import { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import organizationsApi from '../../api/organizationsApi';
import locationsApi from '../../api/locationsApi';
import departmentsApi from '../../api/departmentsApi';
import { useAuth } from '../../context/AuthContext';

export default function DepartmentSelector({
  value,
  onChange,
  disabled = false,
  preSelectedOrgId = null,
}) {
  const { isAdmin, getOrgId } = useAuth();

  const [organizations,    setOrganizations]    = useState([]);
  const [locations,        setLocations]        = useState([]);
  const [departments,      setDepartments]      = useState([]);
  const [selectedOrgId,    setSelectedOrgId]    = useState('');
  const [selectedLocId,    setSelectedLocId]    = useState('');
  const [selectedDeptId,   setSelectedDeptId]   = useState(value || '');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingDepts,     setLoadingDepts]     = useState(false);

  // On mount
  useEffect(() => {
    if (isAdmin()) {
      organizationsApi.getAll().then(res => {
        setOrganizations(res.data);
        if (preSelectedOrgId) {
          setSelectedOrgId(preSelectedOrgId);
        }
      }).catch(() => {});
    } else {
      const orgId = getOrgId();
      if (orgId) setSelectedOrgId(orgId);
    }
  }, [preSelectedOrgId]);

  // Org → locations
  useEffect(() => {
    if (!selectedOrgId) return;
    setLocations([]);
    setDepartments([]);
    setSelectedLocId('');
    setSelectedDeptId('');
    onChange('');
    setLoadingLocations(true);
    locationsApi.getByOrganization(selectedOrgId)
      .then(res => setLocations(res.data))
      .catch(() => {})
      .finally(() => setLoadingLocations(false));
  }, [selectedOrgId]);

  // Location → departments
  useEffect(() => {
    if (!selectedLocId) return;
    setDepartments([]);
    setSelectedDeptId('');
    onChange('');
    setLoadingDepts(true);
    departmentsApi.getByLocation(selectedLocId)
      .then(res => setDepartments(res.data))
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
  }, [selectedLocId]);

  const handleDeptChange = (deptId) => {
    setSelectedDeptId(deptId);
    onChange(deptId);
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
        Location &amp; Department *
      </Typography>

      {/* Step 1: Organization (admin only) */}
      {isAdmin() && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Organization</InputLabel>
          <Select value={selectedOrgId} label="Organization" disabled={disabled}
            onChange={e => setSelectedOrgId(e.target.value)}>
            {organizations.map(org => (
              <MenuItem key={org.id} value={org.id} sx={{ fontSize: 14 }}>{org.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Step 2: Location */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Location</InputLabel>
        <Select value={selectedLocId} label="Location"
          disabled={disabled || !selectedOrgId || loadingLocations}
          onChange={e => setSelectedLocId(e.target.value)}>
          {loadingLocations && <MenuItem disabled sx={{ fontSize: 14 }}>Loading…</MenuItem>}
          {!loadingLocations && locations.length === 0 && selectedOrgId && (
            <MenuItem disabled sx={{ fontSize: 14 }}>No locations — add one in Structure page</MenuItem>
          )}
          {locations.map(loc => (
            <MenuItem key={loc.id} value={loc.id} sx={{ fontSize: 14 }}>
              {loc.name}{loc.country ? ` (${loc.country})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Step 3: Department */}
      <FormControl fullWidth>
        <InputLabel>Department</InputLabel>
        <Select value={selectedDeptId} label="Department"
          disabled={disabled || !selectedLocId || loadingDepts}
          onChange={e => handleDeptChange(e.target.value)}>
          {loadingDepts && <MenuItem disabled sx={{ fontSize: 14 }}>Loading…</MenuItem>}
          {!loadingDepts && departments.length === 0 && selectedLocId && (
            <MenuItem disabled sx={{ fontSize: 14 }}>No departments — add one in Structure page</MenuItem>
          )}
          {departments.map(dept => (
            <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: 14 }}>{dept.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedDeptId && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          ✓ Recording for:{' '}
          {departments.find(d => d.id === selectedDeptId)?.name || ''}
          {' · '}
          {locations.find(l => l.id === selectedLocId)?.name || ''}
        </Typography>
      )}
    </Box>
  );
}
