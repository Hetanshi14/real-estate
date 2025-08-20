import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  TableSortLabel
} from '@mui/material';

// Simple ErrorBoundary component (if not already defined elsewhere)
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  React.useEffect(() => {
    const errorHandler = (error) => {
      console.error(error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
  if (hasError) {
    return (
      <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
        Something went wrong. Please try again.
      </div>
    );
  }
  return children;
};

const AdminProperties = () => {
  // State management
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('properties').select('*');
      if (error) throw error;
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle approving a property
  const handleApproveProperty = async (propertyId) => {
    try {
      const { error } = await supabase.from('properties').update({ status: 'Approved' }).eq('id', propertyId);
      if (error) throw error;
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, status: 'Approved' } : p)));
      setSuccess('Property approved successfully!');
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle unapproving a property
  const handleUnapproveProperty = async (propertyId) => {
    try {
      const { error } = await supabase.from('properties').update({ status: 'Pending' }).eq('id', propertyId);
      if (error) throw error;
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, status: 'Pending' } : p)));
      setSuccess('Property unapproved successfully!');
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting a property
  const handleDeleteProperty = async (propertyId) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) throw error;
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setSuccess('Property deleted successfully!');
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (propertyId) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (propertyToDelete) {
      await handleDeleteProperty(propertyToDelete);
    }
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  // Clear error or success message
  const clearMessage = () => {
    setError(null);
    setSuccess(null);
  };

  // Handle sorting
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Sort and filter properties
  const sortedAndFilteredProperties = [...properties]
    .filter((p) => statusFilter === 'All' || p.status === statusFilter)
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Paginate properties
  const paginatedProperties = sortedAndFilteredProperties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
        {/* Error and Success Messages */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
            <button className="ml-2 text-red-700 hover:text-red-900" onClick={clearMessage}>
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            {success}
            <button className="ml-2 text-green-700 hover:text-green-900" onClick={clearMessage}>
              ×
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-4">
          <label className="text-stone-700 mr-2">Filter by Status:</label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-stone-300"
            aria-label="Filter properties by status"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Under Construction">Under Construction</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
          </Select>
        </div>

        {loading ? (
          <div className="col-span-full min-h-screen flex justify-center items-center h-72 w-auto" aria-busy="true">
            <div className="flex flex-col items-center">
              <img
                src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
                alt="Zivaas Logo"
                className="h-32 w-auto object-contain animate-pulse"
                onError={(e) => {
                  console.error("AdminUsers: Failed to load logo image");
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Properties Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'location'}
                      direction={sortField === 'location' ? sortDirection : 'asc'}
                      onClick={() => handleSort('location')}
                    >
                      Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'status'}
                      direction={sortField === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'price'}
                      direction={sortField === 'price' ? sortDirection : 'asc'}
                      onClick={() => handleSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'property_type'}
                      direction={sortField === 'property_type' ? sortDirection : 'asc'}
                      onClick={() => handleSort('property_type')}
                    >
                      Property Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>{property.name}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.status}</TableCell>
                    <TableCell>{property.price ? `$${property.price.toLocaleString()}` : 'N/A'}</TableCell>
                    <TableCell>{property.property_type || 'N/A'}</TableCell>
                    <TableCell>
                      {property.status !== 'Approved' && (
                        <Button
                          color="primary"
                          className="mr-2 hover:before:bg-stone-600"
                          onClick={() => handleApproveProperty(property.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {property.status === 'Approved' && (
                        <Button
                          color="warning"
                          className="mr-2 hover:before:bg-stone-600"
                          onClick={() => handleUnapproveProperty(property.id)}
                        >
                          Unapprove
                        </Button>
                      )}
                      <Button
                        color="error"
                        className="hover:before:bg-stone-600"
                        onClick={() => openDeleteDialog(property.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedAndFilteredProperties.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this property?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default AdminProperties;