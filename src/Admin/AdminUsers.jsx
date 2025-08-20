import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  TableSortLabel, Tooltip
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

// ErrorBoundary (same as AdminProperties)
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
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

const AdminUsers = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUpdateRole, setUserToUpdateRole] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Get current user from AuthContext
  const { user } = useContext(AuthContext);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users from the public.users table
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, created_at, developer_logo, developer_image');
      if (error) throw error;
      console.log('Fetched users:', data); // Debug log
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSuccess(`User role updated to ${newRole} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open role change confirmation dialog
  const openRoleDialog = (userId, role) => {
    setUserToUpdateRole(userId);
    setNewRole(role);
    setRoleDialogOpen(true);
  };

  // Confirm role change
  const confirmRoleChange = async () => {
    if (userToUpdateRole && newRole) {
      await handleRoleChange(userToUpdateRole, newRole);
    }
    setRoleDialogOpen(false);
    setUserToUpdateRole(null);
    setNewRole('');
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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

  // Sort and filter users
  const sortedAndFilteredUsers = [...users]
    .filter((u) => roleFilter === 'All' || u.role === roleFilter)
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Paginate users
  const paginatedUsers = sortedAndFilteredUsers.slice(
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

        {/* Role Filter */}
        <div className="mb-4">
          <label className="text-stone-700 mr-2">Filter by Role:</label>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border-stone-300"
            aria-label="Filter users by role"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="developer">Developer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </div>

        {/* Loading Symbol (Zivaas Logo) */}
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
            {/* Empty State Message */}
            {sortedAndFilteredUsers.length === 0 ? (
              <div className="text-center text-stone-600 py-4">
                No users found. Please check your database or RLS policies.
              </div>
            ) : (
              <>
                {/* Users Table */}
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'username'}
                          direction={sortField === 'username' ? sortDirection : 'asc'}
                          onClick={() => handleSort('username')}
                        >
                          Username
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'email'}
                          direction={sortField === 'email' ? sortDirection : 'asc'}
                          onClick={() => handleSort('email')}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'role'}
                          direction={sortField === 'role' ? sortDirection : 'asc'}
                          onClick={() => handleSort('role')}
                        >
                          Role
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'created_at'}
                          direction={sortField === 'created_at' ? sortDirection : 'asc'}
                          onClick={() => handleSort('created_at')}
                        >
                          Created At
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Developer Logo</TableCell>
                      <TableCell>Developer Image</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onChange={(e) => openRoleDialog(u.id, e.target.value)}
                            aria-label={`Change role for ${u.username}`}
                          >
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="developer">Developer</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          {u.developer_logo ? (
                            <img
                              src={u.developer_logo}
                              alt={`${u.username} logo`}
                              className="h-10 w-auto object-contain"
                              onError={(e) => {
                                console.error(`Failed to load logo for ${u.username}`);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {u.developer_image ? (
                            <img
                              src={u.developer_image}
                              alt={`${u.username} image`}
                              className="h-10 w-auto object-contain"
                              onError={(e) => {
                                console.error(`Failed to load image for ${u.username}`);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {u.id === user?.id ? (
                            <Tooltip title="Cannot delete your own account">
                              <span>
                                <Button color="error" disabled>
                                  Delete
                                </Button>
                              </span>
                            </Tooltip>
                          ) : (
                            <Button
                              color="error"
                              className="hover:before:bg-stone-600"
                              onClick={() => openDeleteDialog(u.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={sortedAndFilteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this user?
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

        {/* Role Change Confirmation Dialog */}
        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogContent>
            Are you sure you want to change this user’s role to {newRole}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default AdminUsers;