import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './components/Auth';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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

  const handleAuthOpen = () => {
    setOpenAuth(true);
  };

  const handleAuthClose = () => setOpenAuth(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setOpenAuth(false);
    setSnackbar({ open: true, message: 'Logged in successfully!', severity: 'success' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSnackbar({ open: true, message: 'Logged out.', severity: 'info' });
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar
          onAuthOpen={handleAuthOpen}
          onToggleTheme={toggleTheme}
          darkMode={darkMode}
          user={user}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        <AuthPage
          open={openAuth}
          onClose={handleAuthClose}
          onLogin={handleLogin}
        />

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
      </Router>
    </ThemeProvider>
  );
}

export default App;
