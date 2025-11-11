import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Container,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate(storedUser.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: 4,
            }}
            onClick={() => navigate(isAuthenticated ? (storedUser.role === 'admin' ? '/admin' : '/dashboard') : '/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                fontWeight: 'bold',
                color: '#000',
                fontFamily: 'Orbitron',
              }}
            >
              TTD
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00ff88 0%, #00ddff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              }}
            >
              Talk to Database
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation */}
          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    background: 'rgba(0, 255, 136, 0.1)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)',
                  },
                }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    border: '2px solid rgba(0, 255, 136, 0.6)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/signup')}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)',
                  color: '#000',
                  fontWeight: 600,
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                  '&:hover': {
                    boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Dashboard Button */}
              <Button
                color="inherit"
                startIcon={storedUser.role === 'admin' ? <AdminIcon /> : <DashboardIcon />}
                onClick={handleDashboard}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    background: 'rgba(0, 255, 136, 0.1)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)',
                  },
                }}
              >
                {storedUser.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Button>

              {/* User Menu */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    border: '2px solid rgba(0, 255, 136, 0.6)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'transparent',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00ddff 100%)',
                    color: '#000',
                    fontWeight: 700,
                    fontFamily: 'Orbitron',
                  }}
                >
                  {storedUser.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 8px 30px rgba(0, 255, 136, 0.2)',
                  },
                }}
              >
                <MenuItem disabled>
                  <PersonIcon sx={{ mr: 1, color: '#00ff88' }} />
                  <Typography sx={{ color: '#00ff88', fontWeight: 600 }}>
                    {storedUser.username}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleProfile}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
