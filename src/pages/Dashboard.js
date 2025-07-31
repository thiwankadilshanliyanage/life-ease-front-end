import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Avatar,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({ name: parsedUser.name, email: parsedUser.email });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    const formDataObj = new FormData();
    formDataObj.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/users/avatar',
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedUser = { ...user, avatar: res.data.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSnackbar({ open: true, message: 'Avatar updated!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to upload avatar', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/users/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updated = {
        ...user,
        name: res.data.user.name,
        email: res.data.user.email
      };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (!user) {
    return (
      <Box
        sx={{
          height: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 2
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2, textAlign: 'center', width: 400 }}>
        <Box sx={{ mb: 2 }}>
        <Avatar
  src={`http://localhost:5000${user.avatar}`}
  alt={user.name}
  sx={{ width: 80, height: 80, margin: '0 auto' }}
/>
          <Button
            variant="text"
            component="label"
            sx={{ mt: 1 }}
          >
            Change Avatar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>

        {editMode ? (
          <>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: {user.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Role: {user.role || 'User'}
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 2, mr: 1 }}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Dashboard;
 