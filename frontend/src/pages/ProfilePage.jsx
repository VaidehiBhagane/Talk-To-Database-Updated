import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Email,
  Lock,
  Business,
  Send,
  Pending,
  CameraAlt,
  Delete,
} from '@mui/icons-material';
import { profileAPI } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [availableBUs, setAvailableBUs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit profile state
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  
  // BU request dialog
  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedBU, setSelectedBU] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAvailableBUs();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      setProfile(response.data.profile);
      setEmail(response.data.profile.email);
      setProfilePicture(response.data.profile.profile_picture);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const fetchAvailableBUs = async () => {
    try {
      const response = await profileAPI.getAvailableBusinessUnits();
      setAvailableBUs(response.data.available_business_units || []);
    } catch (err) {
      console.error('Error fetching available BUs:', err);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should not exceed 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
      handleUpdateProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfilePicture = async (base64Image) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileAPI.update({ profile_picture: base64Image });
      setSuccess('Profile picture updated successfully');
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profile_picture = base64Image;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileAPI.update({ profile_picture: null });
      setProfilePicture(null);
      setSuccess('Profile picture removed successfully');
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profile_picture = null;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { email };

      // Only include password if user wants to change it
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }

      await profileAPI.update(updateData);
      setSuccess('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!selectedBU) return;

    setLoading(true);
    setError('');

    try {
      await profileAPI.requestAccess({
        bu_id: selectedBU.id,
        message: requestMessage,
      });
      
      setSuccess(`Access request sent for ${selectedBU.name}`);
      setRequestDialog(false);
      setSelectedBU(null);
      setRequestMessage('');
      
      // Refresh data
      fetchProfile();
      fetchAvailableBUs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">My Profile</Typography>
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

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#00ff88',
                  fontWeight: 600
                }}
              >
                <Person /> Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Profile Picture */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box>
                      <IconButton
                        sx={{
                          bgcolor: '#00ff88',
                          color: '#000',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: '#00ddff',
                            boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                          },
                          mb: profilePicture ? 0.5 : 0,
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CameraAlt fontSize="small" />
                      </IconButton>
                      {profilePicture && (
                        <IconButton
                          sx={{
                            bgcolor: '#ff00ff',
                            color: '#000',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: '#ff4444',
                              boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)',
                            },
                          }}
                          onClick={handleRemoveProfilePicture}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                >
                  <Avatar
                    src={profilePicture}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'transparent',
                      background: profilePicture ? 'none' : 'linear-gradient(135deg, #00ff88 0%, #00ddff 100%)',
                      color: '#000',
                      fontWeight: 700,
                      fontFamily: 'Orbitron',
                      fontSize: '3rem',
                      boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
                      border: '3px solid rgba(0, 255, 136, 0.3)',
                    }}
                  >
                    {!profilePicture && profile.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profile.username}
                  disabled
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Role"
                  value={profile.role}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label={profile.role === 'admin' ? 'Admin' : 'User'}
                        color={profile.role === 'admin' ? 'error' : 'primary'}
                        size="small"
                      />
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Member Since"
                  value={new Date(profile.created_at).toLocaleDateString()}
                  disabled
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdateProfile}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </Paper>
          </Grid>

          {/* Change Password */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#00ff88',
                  fontWeight: 600
                }}
              >
                <Lock /> Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleUpdateProfile}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </Paper>
          </Grid>

          {/* My Business Units */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#00ff88',
                  fontWeight: 600
                }}
              >
                <Business /> My Business Units
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {profile.business_units && profile.business_units.length > 0 ? (
                <List>
                  {profile.business_units.map((bu) => (
                    <ListItem 
                      key={bu.id} 
                      sx={{ 
                        bgcolor: 'rgba(0, 255, 136, 0.05)', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid rgba(0, 255, 136, 0.2)'
                      }}
                    >
                      <ListItemText
                        primary={bu.name}
                        secondary={bu.description}
                        primaryTypographyProps={{ 
                          sx: { color: '#00ff88', fontWeight: 500 } 
                        }}
                        secondaryTypographyProps={{
                          sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <Chip label="Access Granted" color="success" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No business units assigned</Alert>
              )}
            </Paper>
          </Grid>

          {/* Request Access to BU */}
          {profile.role !== 'admin' && (
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: '#00ff88',
                    fontWeight: 600
                  }}
                >
                  <Send /> Request Business Unit Access
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {availableBUs.length > 0 ? (
                  <List>
                    {availableBUs.map((bu) => (
                      <ListItem 
                        key={bu.id} 
                        sx={{ 
                          bgcolor: 'rgba(255, 0, 255, 0.05)', 
                          mb: 1, 
                          borderRadius: 1,
                          border: '1px solid rgba(255, 0, 255, 0.2)'
                        }}
                      >
                        <ListItemText
                          primary={bu.name}
                          secondary={bu.description}
                          primaryTypographyProps={{ 
                            sx: { color: '#ff00ff', fontWeight: 500 } 
                          }}
                          secondaryTypographyProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' }
                          }}
                        />
                        <ListItemSecondaryAction>
                          {bu.has_pending_request ? (
                            <Chip
                              label="Pending"
                              color="warning"
                              size="small"
                              icon={<Pending />}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedBU(bu);
                                setRequestDialog(true);
                              }}
                            >
                              Request
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">You have access to all available business units!</Alert>
                )}

                {/* Pending Requests */}
                {profile.pending_requests && profile.pending_requests.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ color: '#00ff88', fontWeight: 500 }}
                    >
                      Pending Requests:
                    </Typography>
                    <List dense>
                      {profile.pending_requests.map((req) => (
                        <ListItem key={req.id}>
                          <ListItemText
                            primary={req.bu_name}
                            secondary={`Requested: ${new Date(req.created_at).toLocaleDateString()}`}
                            primaryTypographyProps={{
                              sx: { color: 'rgba(255, 255, 255, 0.9)' }
                            }}
                            secondaryTypographyProps={{
                              sx: { color: 'rgba(255, 255, 255, 0.6)' }
                            }}
                          />
                          <Chip label="Pending" color="warning" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Request Access Dialog */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Access to {selectedBU?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedBU?.description}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message (Optional)"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Why do you need access to this business unit?"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestAccess}
            disabled={loading}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
