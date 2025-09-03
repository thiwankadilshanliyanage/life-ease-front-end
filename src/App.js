import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './components/Auth';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/** Small helper to read location inside App for conditional navbar */
const Layout = ({ children, user, onAuthOpen, onToggleTheme, darkMode, onLogout }) => {
  const location = useLocation();

  // Hide navbar on admin pages
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

/** Guards */
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
  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setOpenAuth(false);
    setSnackbar({ open: true, message: 'Logged in successfully!', severity: 'success' });

    // Redirect based on role (simple + reliable)
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      // For users/service providers we usually stay on Home.
      // If you prefer, you can send them to /dashboard:
      // window.location.href = '/dashboard';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSnackbar({ open: true, message: 'Logged out.', severity: 'info' });
    // Optional: force to home
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
            <Route path="/" element={<Home />} />

            {/* Admin ONLY */}
            <Route
              path="/admin"
              element={
                <RequireAdmin user={user}>
                  <AdminPanel />
                </RequireAdmin>
              }
            />

            {/* Normal user / service_provider ONLY */}
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

          <AuthPage open={openAuth} onClose={handleAuthClose} onLogin={handleLogin} />

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
      </Router>
    </ThemeProvider>
  );
}

export default App;
