import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Navbar from './components/Navbar';
import AuthPage from './components/Auth';
import GlobalLoading from './components/GlobalLoading'; // 👈 NEW

import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CreateService from './pages/CreateService';
import MyServices from './pages/MyServices';
import EditService from './pages/EditService';

/** Layout wrapper so we can hide navbar on admin pages */
const Layout = ({ children, user, onAuthOpen, onToggleTheme, darkMode, onLogout }) => {
  const location = useLocation();
  const hideNavbar = user?.role === 'admin' && location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNavbar && (
        <Navbar
          onAuthOpen={onAuthOpen}
          onToggleTheme={onToggleTheme}
          darkMode={darkMode}
          user={user}
          onLogout={onLogout}
        />
      )}
      {children}
    </>
  );
};

/** Route guards */
const RequireAdmin = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const RequireNonAdmin = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

const RequireProvider = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'service_provider') return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [openAuth, setOpenAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: '#1976d2' },
        },
      }),
    [darkMode]
  );

  const handleAuthOpen = () => setOpenAuth(true);
  const handleAuthClose = () => setOpenAuth(false);
  const toggleTheme = () => setDarkMode((v) => !v);

  const handleLogin = (userData) => {
    // Expecting userData to include: id, name, email, avatar, role, token
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setOpenAuth(false);
    setSnackbar({ open: true, message: 'Logged in successfully!', severity: 'success' });

    if (userData.role === 'admin') {
      window.location.href = '/admin';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSnackbar({ open: true, message: 'Logged out.', severity: 'info' });
    window.location.href = '/';
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout
          user={user}
          onAuthOpen={handleAuthOpen}
          onToggleTheme={toggleTheme}
          darkMode={darkMode}
          onLogout={handleLogout}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail onAuthOpen={handleAuthOpen} />} />

            {/* Provider-only */}
            <Route
              path="/provider/services"
              element={
                <RequireProvider user={user}>
                  <MyServices />
                </RequireProvider>
              }
            />
            <Route
              path="/provider/services/new"
              element={
                <RequireProvider user={user}>
                  <CreateService />
                </RequireProvider>
              }
            />
            <Route
              path="/provider/services/:id/edit"
              element={
                <RequireProvider user={user}>
                  <EditService />
                </RequireProvider>
              }
            />

            {/* Admin-only */}
            <Route
              path="/admin"
              element={
                <RequireAdmin user={user}>
                  <AdminPanel />
                </RequireAdmin>
              }
            />

            {/* Normal user or provider (not admin) */}
            <Route
              path="/dashboard"
              element={
                <RequireNonAdmin user={user}>
                  <Dashboard />
                </RequireNonAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Auth modal */}
          <AuthPage open={openAuth} onClose={handleAuthClose} onLogin={handleLogin} />

          {/* Global snackbar */}
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
        </Layout>

        {/* 👇 Renders above everything while requests are in flight */}
        <GlobalLoading />
      </Router>
    </ThemeProvider>
  );
}

export default App;
