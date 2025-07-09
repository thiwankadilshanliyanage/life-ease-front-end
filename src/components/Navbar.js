import React, { useState } from 'react';
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
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ onAuthOpen }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img
              src={logo}
              alt="LifeEase Japan"
              style={{
                height: 40,
                width: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 8
              }}
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

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button
              color="inherit"
              onClick={() => onAuthOpen('login')}
              sx={{ color: 'white' }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => onAuthOpen('register')}
              sx={{ color: 'white' }}
            >
              Register
            </Button>
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { xs: 'block', sm: 'none' }, color: 'white' }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 200 }} role="presentation" onClick={toggleDrawer}>
          <List>
            <ListItem button onClick={() => onAuthOpen('login')}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button onClick={() => onAuthOpen('register')}>
              <ListItemText primary="Register" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
