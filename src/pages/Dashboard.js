import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Paper, Typography, Button, Box, CircularProgress, Avatar, TextField,
  Snackbar, Alert, Divider, Grid, Stack
} from '@mui/material';

import {
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
  uploadAvatar as apiUploadAvatar,
  BASE_URL
} from '../services/api';

import ProviderApprovalSection from '../components/ProviderApprovalSection';

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);         // full user from API
  const [loading, setLoading] = useState(true);

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);

  // UI
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const loadProfile = async () => {
    try {
      const res = await apiGetProfile();
      const freshUser = res.data.user || res.data; // backend returns the user directly
      setUser(freshUser);
      setFormData({ name: freshUser.name || '', email: freshUser.email || '' });
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleProfileChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await apiUploadAvatar(fd);

      // Update in-memory user (full API user)
      const updated = { ...user, avatar: res.data.avatar };
      setUser(updated);

      // Also update the lightweight login snapshot in localStorage (preserve token/role)
      const lsRaw = localStorage.getItem('user');
      if (lsRaw) {
        const ls = JSON.parse(lsRaw);
        localStorage.setItem('user', JSON.stringify({ ...ls, avatar: res.data.avatar }));
      }

      setSnack({ open: true, message: 'Avatar updated!', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to upload avatar', severity: 'error' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await apiUpdateProfile(formData);
      const updated = { ...user, name: res.data.user.name, email: res.data.user.email };
      setUser(updated);

      // Keep localStorage snapshot in sync (preserve token/role)
      const lsRaw = localStorage.getItem('user');
      if (lsRaw) {
        const ls = JSON.parse(lsRaw);
        localStorage.setItem('user', JSON.stringify({ ...ls, name: res.data.user.name, email: res.data.user.email }));
      }

      setEditMode(false);
      setSnack({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to update profile', severity: 'error' });
    }
  };

  if (loading || !user) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isProvider = user.role === 'service_provider';
  const approvalStatus = (user.serviceProviderProfile?.approvalStatus || '').trim().toLowerCase();
  const isApproved = approvalStatus === 'approved';

  const avatarSrc =
    avatarPreview ||
    (user.avatar
      ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`)
      : '');

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 2,
        pt: 6,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1000, display: 'grid', gap: 2 }}>
        {/* Profile Card */}
        <Paper elevation={6} sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={avatarSrc}
              alt={user.name}
              sx={{ width: 80, height: 80 }}
            />
            <div>
              <Typography variant="h5" fontWeight={700} gutterBottom>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">Email: {user.email}</Typography>
              <Typography variant="body2" color="text.secondary">Role: {user.role}</Typography>
            </div>
            <Box sx={{ flex: 1 }} />
            <Button variant="text" component="label">
              Change Avatar
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {editMode ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleProfileChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleProfileChange} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleSaveProfile} sx={{ mr: 1 }}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Button variant="contained" sx={{ mr: 1 }} onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Paper>

        {/* Service Provider Approval / Submission */}
        {isProvider && (
          <>
            <ProviderApprovalSection onRefreshUser={loadProfile} />

            {/* Optional quick actions when approved */}
            {isApproved && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
                  <Alert severity="success" sx={{ flex: 1 }}>
                    You are approved! You can create and manage services.
                  </Alert>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      component={RouterLink}
                      to="/provider/services"
                    >
                      My Services
                    </Button>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/provider/services/new"
                    >
                      Create Service
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
