import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/users', // adjust port if needed
});

export const registerUser = (userData) => API.post('/register', userData);
export const loginUser = (userData) => API.post('/login', userData);