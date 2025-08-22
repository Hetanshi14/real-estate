import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { checkAdmin } from '../../utils/auth';
import { Typography, Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      const isAdmin = await checkAdmin();
      if (!isAdmin) navigate('/login', { state: { from: '/admin' } });
    };
    verifyAdmin();
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-rose-100 min-h-screen"
    >
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            width: 240,
            bgcolor: 'stone.800',
            color: 'white',
            minHeight: '100vh',
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Admin Panel
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/dashboard">
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/users">
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/properties">
                <ListItemText primary="Properties" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/floor-plans">
                <ListItemText primary="Floor Plans" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/wishlist">
                <ListItemText primary="Wishlist" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'rose.100' }}>
          <Outlet />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AdminLayout;