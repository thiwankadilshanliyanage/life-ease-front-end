import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { registerUser, loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ mode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        const res = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setMessage(res.data.message || 'Registered! Check your email.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <Box>
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
    </Box>
  );
};

export default AuthPage;
