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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Badge,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  PersonAdd,
  Lock,
} from '@mui/icons-material';
import { notificationAPI } from '../services/api';

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', requestId: null });

  useEffect(() => {
    fetchNotifications();
    fetchAccessRequests();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const response = await notificationAPI.getAccessRequests('pending');
      setAccessRequests(response.data.access_requests || []);
    } catch (err) {
      console.error('Error fetching access requests:', err);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    setError('');
    try {
      await notificationAPI.approveRequest(requestId);
      setAccessRequests(accessRequests.filter(req => req.id !== requestId));
      setConfirmDialog({ open: false, type: '', requestId: null });
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    setError('');
    try {
      await notificationAPI.rejectRequest(requestId);
      setAccessRequests(accessRequests.filter(req => req.id !== requestId));
      setConfirmDialog({ open: false, type: '', requestId: null });
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_user':
        return <PersonAdd color="primary" />;
      case 'access_request':
        return <Lock color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Notifications & Requests
          </Typography>
          <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
            <NotificationsIcon />
          </Badge>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab
              label={
                <Badge badgeContent={accessRequests.length} color="error">
                  Access Requests
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                  All Notifications
                </Badge>
              }
            />
          </Tabs>
        </Paper>

        {/* Access Requests Tab */}
        {tabValue === 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Access Requests</Typography>
              <Chip label={`${accessRequests.length} Pending`} color="warning" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {accessRequests.length === 0 ? (
              <Alert severity="info">No pending access requests</Alert>
            ) : (
              <List>
                {accessRequests.map((request) => (
                  <ListItem
                    key={request.id}
                    sx={{
                      bgcolor: '#f9f9f9',
                      mb: 2,
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {request.user_name}
                          </Typography>
                          <Chip label="Pending" size="small" color="warning" />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Email:</strong> {request.user_email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Business Unit:</strong> {request.bu_name}
                          </Typography>
                          {request.message && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Message:</strong> {request.message}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Requested: {formatDate(request.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => setConfirmDialog({ open: true, type: 'approve', requestId: request.id })}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          onClick={() => setConfirmDialog({ open: true, type: 'reject', requestId: request.id })}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* All Notifications Tab */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">All Notifications</Typography>
              <Button onClick={handleMarkAllRead} size="small">
                Mark All as Read
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {notifications.length === 0 ? (
              <Alert severity="info">No notifications</Alert>
            ) : (
              <List>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      bgcolor: notification.is_read ? '#fff' : '#e3f2fd',
                      mb: 1,
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {getNotificationIcon(notification.notification_type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.is_read && (
                      <Chip label="New" size="small" color="primary" sx={{ ml: 2 }} />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '', requestId: null })}>
        <DialogTitle>
          {confirmDialog.type === 'approve' ? 'Approve Access Request?' : 'Reject Access Request?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'approve'
              ? 'Are you sure you want to approve this access request? The user will gain access to the business unit.'
              : 'Are you sure you want to reject this access request? The user will be notified.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', requestId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              confirmDialog.type === 'approve'
                ? handleApproveRequest(confirmDialog.requestId)
                : handleRejectRequest(confirmDialog.requestId)
            }
            color={confirmDialog.type === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading}
          >
            {confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotificationsPage;
