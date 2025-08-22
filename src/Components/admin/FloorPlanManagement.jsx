import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography, Modal, Box, TextField } from '@mui/material';
import { motion } from 'framer-motion';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const FloorPlanManagement = () => {
  const [floorPlans, setFloorPlans] = useState([]);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    type: '',
    bhk: '',
    size: '',
    image: '',
    thumbnail: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchFloorPlans = async () => {
      try {
        const { data, error } = await supabase.from('floor_plans').select('*, properties(name)');
        if (error) throw error;
        setFloorPlans(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchFloorPlans();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      property_id: '',
      type: '',
      bhk: '',
      size: '',
      image: '',
      thumbnail: '',
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('floor_plans')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        setFloorPlans(floorPlans.map((fp) => (fp.id === editingId ? { ...fp, ...formData } : fp)));
      } else {
        const { data, error } = await supabase.from('floor_plans').insert([formData]).select();
        if (error) throw error;
        setFloorPlans([...floorPlans, data[0]]);
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (floorPlan) => {
    setFormData(floorPlan);
    setEditingId(floorPlan.id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('floor_plans').delete().eq('id', id);
      if (error) throw error;
      setFloorPlans(floorPlans.filter((fp) => fp.id !== id));
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
        Floor Plan Management
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Button
        onClick={handleOpen}
        variant="contained"
        sx={{ mb: 2, bgcolor: 'stone.700', '&:hover': { bgcolor: 'stone.600' } }}
      >
        Add Floor Plan
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Property</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>BHK</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {floorPlans.map((floorPlan) => (
            <TableRow key={floorPlan.id}>
              <TableCell>{floorPlan.properties?.name}</TableCell>
              <TableCell>{floorPlan.type}</TableCell>
              <TableCell>{floorPlan.bhk}</TableCell>
              <TableCell>{floorPlan.size}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleEdit(floorPlan)}
                  sx={{ mr: 1, bgcolor: 'stone.700', color: 'white' }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(floorPlan.id)}
                  sx={{ bgcolor: 'red.500', color: 'white' }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? 'Edit Floor Plan' : 'Add Floor Plan'}
          </Typography>
          <TextField
            label="Property ID"
            name="property_id"
            value={formData.property_id}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="BHK"
            name="bhk"
            value={formData.bhk}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Thumbnail URL"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: 'stone.700', '&:hover': { bgcolor: 'stone.600' } }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </motion.div>
  );
};

export default FloorPlanManagement;