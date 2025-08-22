import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const WishlistManagement = () => {
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('*, users(username), properties(name)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setWishlist(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchWishlist();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);
      if (error) throw error;
      setWishlist(wishlist.filter((item) => item.id !== id));
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
        Wishlist Management
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Property</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {wishlist.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.users?.username}</TableCell>
              <TableCell>{item.properties?.name}</TableCell>
              <TableCell>{item.rating}</TableCell>
              <TableCell>{item.notes}</TableCell>
              <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleDelete(item.id)}
                  sx={{ bgcolor: 'red.500', color: 'white' }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default WishlistManagement;