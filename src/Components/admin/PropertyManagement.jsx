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

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    carpet_area: '',
    configuration: '',
    property_type: '',
    total_floors: '',
    total_units: '',
    status: '',
    rera_number: '',
    amenities: [],
    developer_id: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) throw error;
        setProperties(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProperties();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      location: '',
      price: '',
      carpet_area: '',
      configuration: '',
      property_type: '',
      total_floors: '',
      total_units: '',
      status: '',
      rera_number: '',
      amenities: [],
      developer_id: '',
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amenities' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        carpet_area: parseInt(formData.carpet_area) || 0,
        total_floors: parseInt(formData.total_floors) || 0,
        total_units: parseInt(formData.total_units) || 0,
      };
      if (editingId) {
        const { error } = await supabase
          .from('properties')
          .update(formattedData)
          .eq('id', editingId);
        if (error) throw error;
        setProperties(properties.map((p) => (p.id === editingId ? { ...p, ...formattedData } : p)));
      } else {
        const { data, error } = await supabase.from('properties').insert([formattedData]).select();
        if (error) throw error;
        setProperties([...properties, data[0]]);
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (property) => {
    setFormData({
      ...property,
      amenities: property.amenities.join(','),
    });
    setEditingId(property.id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setProperties(properties.filter((p) => p.id !== id));
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
        Property Management
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Button
        onClick={handleOpen}
        variant="contained"
        sx={{ mb: 2, bgcolor: 'stone.700', '&:hover': { bgcolor: 'stone.600' } }}
      >
        Add Property
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Developer ID</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.name}</TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>{property.price}</TableCell>
              <TableCell>{property.developer_id}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleEdit(property)}
                  sx={{ mr: 1, bgcolor: 'stone.700', color: 'white' }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(property.id)}
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
            {editingId ? 'Edit Property' : 'Add Property'}
          </Typography>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Carpet Area"
            name="carpet_area"
            type="number"
            value={formData.carpet_area}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Configuration"
            name="configuration"
            value={formData.configuration}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Property Type"
            name="property_type"
            value={formData.property_type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Total Floors"
            name="total_floors"
            type="number"
            value={formData.total_floors}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Total Units"
            name="total_units"
            type="number"
            value={formData.total_units}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="RERA Number"
            name="rera_number"
            value={formData.rera_number}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Amenities (comma-separated)"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Developer ID"
            name="developer_id"
            value={formData.developer_id}
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

export default PropertyManagement;