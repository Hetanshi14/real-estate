/*import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminUsers from './AdminUsers';
import AdminProperties from './AdminProperties';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  // Redirect non-admins to login
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login', { state: { from: '/admin' } });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-600">Access denied. Please log in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-stone-700 mb-6">Admin Dashboard</h2>
      <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
        <Tab label="Manage Users" />
        <Tab label="Manage Properties" />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {value === 0 && <AdminUsers />}
        {value === 1 && <AdminProperties />}
      </Box>
      <button
        onClick={() => navigate('/profile')}
        className="relative mt-4 inline-block px-6 py-2 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
          before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
          before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
        aria-label="Back to profile"
      >
        Back to Profile
      </button>
    </div>
  );
};

export default AdminDashboard;