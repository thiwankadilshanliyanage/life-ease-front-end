import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slide
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ onAuthOpen, onToggleTheme, darkMode, user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elevate, setElevate] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) setShowNavbar(false);
      else setShowNavbar(true);
      setElevate(currentY > 50);
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <Slide appear={false} direction="down" in={showNavbar}>
        <AppBar
          position="fixed"
          elevation={elevate ? 4 : 0}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            height: elevate ? 56 : 64,
            transition: 'all 0.3s ease'
          }}
        >
          <Toolbar sx={{ minHeight: elevate ? 56 : 64 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={logo}
                alt="LifeEase Japan"
                sx={{
                  height: elevate ? 35 : 40,
                  width: elevate ? 35 : 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: 1,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
                onClick={() => navigate('/')}
              />
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                LifeEase Japan
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              {user?.role === 'admin' ? (
                <>
                  <Button
                    onClick={() => navigate('/admin')}
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Admin
                  </Button>
                  <Button onClick={onLogout} sx={{ color: 'white' }}>
                    Logout
                  </Button>
                </>
              ) : user ? (
                <>
                  {user?.role === 'service_provider' && (
                    <Button
                      onClick={() => navigate('/provider/services')}
                      sx={{ color: 'white' }}
                    >
                      My Services
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/dashboard')}
                    sx={{ color: 'white' }}
                    startIcon={<AccountCircleIcon />}
                  >
                    {user.name}
                  </Button>
                  <Button onClick={onLogout} sx={{ color: 'white' }}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={onAuthOpen} sx={{ color: 'white' }}>
                  Login
                </Button>
              )}

              <IconButton onClick={onToggleTheme} sx={{ color: 'white' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Box>

            <IconButton
              sx={{ display: { xs: 'block', sm: 'none' }, color: 'white' }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Slide>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        transitionDuration={300}
      >
        <Box sx={{ width: 220 }} role="presentation" onClick={toggleDrawer}>
          <List>
            {user?.role === 'admin' ? (
              <>
                <ListItem button onClick={() => navigate('/admin')}>
                  <ListItemText primary="Admin" />
                </ListItem>
                <ListItem button onClick={onLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : user ? (
              <>
                <ListItem button onClick={() => navigate('/dashboard')}>
                  <ListItemText primary={user.name} />
                </ListItem>
                {user?.role === 'service_provider' && (
                  <ListItem button onClick={() => navigate('/provider/services')}>
                    <ListItemText primary="My Services" />
                  </ListItem>
                )}
                <ListItem button onClick={onLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <ListItem button onClick={onAuthOpen}>
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
