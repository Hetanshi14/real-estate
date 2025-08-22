import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  const updateUserRole = async (id, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);
      if (error) throw error;
      setUsers(users.map((user) => (user.id === id ? { ...user, role: newRole } : user)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h4" sx={{ mb: 2, color: 'stone.800' }}>
        User Management
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="developer">Developer</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default UserManagement;