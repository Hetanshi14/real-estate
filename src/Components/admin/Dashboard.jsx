import React from 'react';
import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const Dashboard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Typography variant="h4" sx={{ mb: 2, color: 'stone.800' }}>
      Admin Dashboard
    </Typography>
    <Typography sx={{ color: 'stone.600' }}>
      Manage users, properties, floor plans, and wishlist entries from the sidebar.
    </Typography>
  </motion.div>
);

export default Dashboard;