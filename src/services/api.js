import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/users',
});

export const registerUser = (userData) => API.post('/register', userData);
export const loginUser = (userData) => API.post('/login', userData);

export const updateProfile = (data, token) =>
  API.put('/profile', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const uploadAvatar = (formData, token) =>
  API.put('/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

export const getProfile = (token) =>
  API.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
