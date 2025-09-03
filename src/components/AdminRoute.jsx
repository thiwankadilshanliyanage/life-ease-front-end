import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const role = userRaw ? JSON.parse(userRaw).role : null;

  if (!token) return <Navigate to="/" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
