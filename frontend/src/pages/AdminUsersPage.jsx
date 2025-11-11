import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Business,
  Delete,
  AdminPanelSettings,
  Add,
  RemoveCircle,
} from '@mui/icons-material';
import { adminAPI, businessUnitAPI } from '../services/api';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialogs
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageAccessDialog, setManageAccessDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBusinessUnits();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const response = await businessUnitAPI.getAll();
      setBusinessUnits(response.data.business_units);
    } catch (err) {
      console.error('Error fetching BUs:', err);
    }
  };

  const handleGrantAccess = async (userId, buId) => {
    setLoading(true);
    setError('');
    
    try {
      await adminAPI.grantBUAccess(userId, buId);
      setSuccess('Access granted successfully');
      fetchUsers(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId, buId) => {
    setLoading(true);
    setError('');
    
    try {
      await adminAPI.revokeBUAccess(userId, buId);
      setSuccess('Access revoked successfully');
      fetchUsers(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      await adminAPI.deleteUser(selectedUser.id);
      setSuccess('User deleted successfully');
      setDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const openManageAccessDialog = (user) => {
    setSelectedUser(user);
    setManageAccessDialog(true);
  };

  const closeManageAccessDialog = () => {
    setManageAccessDialog(false);
    setSelectedUser(null);
  };

  const getUserBUIds = (user) => {
    return user.business_units?.map(bu => bu.id) || [];
  };

  const hasAccess = (user, buId) => {
    return getUserBUIds(user).includes(buId);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">User Management</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          All Users
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Business Units</strong></TableCell>
                <TableCell><strong>Queries</strong></TableCell>
                <TableCell><strong>Member Since</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person />
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : 'primary'}
                      size="small"
                      icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${user.bu_count || 0} BUs`}
                      color="default"
                      size="small"
                      icon={<Business />}
                    />
                  </TableCell>
                  <TableCell>{user.query_count || 0}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openManageAccessDialog(user)}
                      sx={{ mr: 1 }}
                    >
                      Manage Access
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteDialog(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Manage Access Dialog */}
      <Dialog
        open={manageAccessDialog}
        onClose={closeManageAccessDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Business Unit Access - {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Grant or revoke access to business units for this user
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {businessUnits.map((bu) => {
              const userHasAccess = selectedUser && hasAccess(selectedUser, bu.id);
              
              return (
                <Grid item xs={12} sm={6} key={bu.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {bu.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {bu.description}
                          </Typography>
                          <Chip
                            label={userHasAccess ? 'Has Access' : 'No Access'}
                            color={userHasAccess ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <Box>
                          {userHasAccess ? (
                            <IconButton
                              color="error"
                              onClick={() => handleRevokeAccess(selectedUser.id, bu.id)}
                              disabled={loading}
                            >
                              <RemoveCircle />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="success"
                              onClick={() => handleGrantAccess(selectedUser.id, bu.id)}
                              disabled={loading}
                            >
                              <Add />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {selectedUser && selectedUser.business_units && selectedUser.business_units.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Current Access:
              </Typography>
              <List dense>
                {selectedUser.business_units.map((bu) => (
                  <ListItem key={bu.id}>
                    <ListItemText
                      primary={bu.name}
                      secondary={`Granted: ${new Date(bu.granted_at).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRevokeAccess(selectedUser.id, bu.id)}
                        disabled={loading}
                      >
                        <RemoveCircle />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManageAccessDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUser}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
