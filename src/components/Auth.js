import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
  Backdrop,
  FormControlLabel,
  Checkbox,
  useTheme
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Close
} from '@mui/icons-material';
import { registerUser, loginUser } from '../services/api';

const AuthPage = ({ open = true, onClose, onLogin, mode = 'login' }) => {
  const theme = useTheme();

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isServiceProvider: false
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      isServiceProvider: false
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email) {
    setMessage('Email is required.');
    return;
  }

  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    setMessage('Invalid email format.');
    return;
  }

  if (formData.password.length < 6) {
    setMessage('Password must be at least 6 characters.');
    return;
  }

  if (!isLogin && !formData.name.trim()) {
    setMessage('Name is required for registration.');
    return;
  }

  if (!isLogin && formData.password !== formData.confirmPassword) {
    setMessage('Passwords do not match.');
    return;
  }

  try {
    if (isLogin) {
      const res = await loginUser({
        email: formData.email,
        password: formData.password
      });

      const userData = {
        name: res.data.user.name,
        email: res.data.user.email,
        avatar: res.data.user.avatar,
        role: res.data.user.role,  // ✅ include role
        token: res.data.token
      };

      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      onClose?.();
      onLogin?.(userData);

      // ✅ Redirect based on role
      if (userData.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }

    } else {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isServiceProvider: formData.isServiceProvider
      });

      setMessage(res.data.message || 'Registered! Check your email.');
      onClose?.();
    }
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong.');
  }
};


  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)'
      }}
      open={open}
      onClick={onClose}
    >
      <Fade in={open}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            width: '90%',
            maxWidth: 400,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>

          <Typography variant="h5" align="center" gutterBottom>
            {isLogin ? 'Login to LifeEase' : 'Create an Account'}
          </Typography>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                margin="normal"
                fullWidth
                name="name"
                label="Name"
                onChange={handleChange}
                value={formData.name}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  )
                }}
              />
            )}

            <TextField
              margin="normal"
              fullWidth
              name="email"
              type="email"
              label="Email"
              onChange={handleChange}
              value={formData.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              onChange={handleChange}
              value={formData.password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {!isLogin && (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    )
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isServiceProvider"
                      checked={formData.isServiceProvider}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Register as a Service Provider"
                  sx={{ mt: 1 }}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, py: 1.5 }}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <Typography
            align="center"
            variant="body2"
            color="primary"
            sx={{ mt: 2, cursor: 'pointer' }}
            onClick={toggleMode}
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </Typography>

          {message && (
            <Typography align="center" color="error" sx={{ mt: 1 }}>
              {message}
            </Typography>
          )}
        </Paper>
      </Fade>
    </Backdrop>
  );
};

export default AuthPage;
