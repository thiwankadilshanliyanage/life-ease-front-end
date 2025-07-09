import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthPage from './components/Auth';
import { Modal, Paper, Slide } from '@mui/material';

function App() {
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthOpen = (mode) => {
    setAuthMode(mode);
    setOpenAuth(true);
  };

  const handleAuthClose = () => setOpenAuth(false);

  return (
    <Router>
      <Navbar onAuthOpen={handleAuthOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <Modal
        open={openAuth}
        onClose={handleAuthClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Slide direction="down" in={openAuth} mountOnEnter unmountOnExit>
          <Paper
            elevation={10}
            sx={{
              width: 400,
              p: 4,
              borderRadius: 3,
            }}
          >
            <AuthPage mode={authMode} />
          </Paper>
        </Slide>
      </Modal>
    </Router>
  );
}

export default App;
