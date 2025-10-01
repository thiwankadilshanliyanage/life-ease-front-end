// src/services/api.js
import axios from 'axios';
import { inc, dec } from '../utils/loadingBus';

// Single source of truth for backend URL
export const BASE_URL = 'http://localhost:5000';

/* -------------------- AXIOS INSTANCES -------------------- */
const API = axios.create({ baseURL: `${BASE_URL}/api/users` });
const SERVICES = axios.create({ baseURL: `${BASE_URL}/api/services` });

// Attach token on every request (both instances)
const withToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

API.interceptors.request.use(withToken);
SERVICES.interceptors.request.use(withToken);

// 🔄 Global loading interceptors
const addLoadingInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      inc();
      return config;
    },
    (error) => {
      dec();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      dec();
      return response;
    },
    (error) => {
      dec();
      return Promise.reject(error);
    }
  );
};

addLoadingInterceptors(API);
addLoadingInterceptors(SERVICES);

/* -------------------- AUTH / USERS -------------------- */
export const registerUser = (userData) => API.post('/register', userData);
export const loginUser    = (userData) => API.post('/login', userData);

// Profile
export const getProfile    = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const uploadAvatar  = (formData) =>
  API.put('/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Service provider (user)
export const submitServiceProviderProfile = (payload) =>
  API.post('/service-provider/submit', payload);

/* -------------------- ADMIN -------------------- */
export const listProviders     = (status) => API.get('/admin/providers', { params: status ? { status } : {} });
export const approveProvider   = (userId) => API.put(`/admin/providers/${userId}/approve`);
export const rejectProvider    = (userId) => API.put(`/admin/providers/${userId}/reject`);
export const getAdminStats     = () => API.get('/admin/stats');
export const listUsersAdmin    = (params = {}) => API.get('/admin/users', { params });
export const getAdminOverview  = () => API.get('/admin/overview');

/* -------------------- SERVICES (PUBLIC + PROVIDER) -------------------- */
// Public
export const listServices = (params = {}) => SERVICES.get('/', { params });
export const getService   = (id) => SERVICES.get(`/${id}`);

// Provider (owner) list & detail
export const listMyServices  = (params = {}) => SERVICES.get('/mine', { params });
export const getServiceOwner = (id) => SERVICES.get(`/${id}/owner`);

// Provider CRUD
export const createService = (data) => SERVICES.post('/', data);
export const updateService = (id, data) => SERVICES.put(`/${id}`, data);
export const deleteService = (id) => SERVICES.delete(`/${id}`);

// ✅ NEW: upload service images (multiple)
export const uploadServiceImages = (files) => {
  const fd = new FormData();
  [...files].forEach((f) => fd.append('images', f)); // "images" matches server field
  return SERVICES.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
