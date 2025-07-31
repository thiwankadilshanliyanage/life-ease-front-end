import React from 'react';
import { Typography, Box } from '@mui/material';

const AdminPanel = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Admin Panel</Typography>
      <Typography>Welcome, Admin! Here you can manage users, services, and approvals.</Typography>
    </Box>
  );
};

export default AdminPanel;
