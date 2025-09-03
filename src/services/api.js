import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/users',
});

// Attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (userData) => API.post('/register', userData);
export const loginUser = (userData) => API.post('/login', userData);

// Profile
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const uploadAvatar = (formData) =>
  API.put('/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Service provider (user)
export const submitServiceProviderProfile = (payload) =>
  API.post('/service-provider/submit', payload);

// Admin
export const getPendingProviders = () =>
  API.get('/admin/providers/pending');

// export const approveProvider = (userId) =>
//   API.put(`/approve-provider/${userId}`);

// export const rejectProvider = (userId, reason) =>
//   API.put(`/reject-provider/${userId}`, { reason });


// --- ADD ---
export const listProviders = (token, status) =>
  API.get('/admin/providers', {
    params: status ? { status } : {},
    headers: { Authorization: `Bearer ${token}` },
  });

export const approveProvider = (token, userId) =>
  API.put(`/admin/providers/${userId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const rejectProvider = (token, userId) =>
  API.put(`/admin/providers/${userId}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // --- Admin stats + users list ---
export const getAdminStats = (token) =>
  API.get('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listUsersAdmin = (token, params = {}) =>
  API.get('/admin/users', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
