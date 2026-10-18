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
  Tooltip,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Brightness4 as DarkModeIcon,  // NEW: Dark mode icon
  Brightness7 as LightModeIcon,  // NEW: Light mode icon
} from '@mui/icons-material';

const Header = ({ toggleTheme, themeMode }) => {
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
              {/* NEW: Theme Toggle Button */}
              <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  onClick={toggleTheme}
                  color="inherit"
                  sx={{
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      border: '2px solid rgba(0, 255, 136, 0.6)',
                      background: 'rgba(0, 255, 136, 0.1)',
                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                    },
                  }}
                >
                  {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

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

              {/* User Avatar with Username */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 3,
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  background: 'rgba(0, 255, 136, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid rgba(0, 255, 136, 0.6)',
                    background: 'rgba(0, 255, 136, 0.1)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                  },
                }}
                onClick={handleMenuOpen}
              >
                <Avatar
                  src={storedUser.profile_picture}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'transparent',
                    background: storedUser.profile_picture ? 'none' : 'linear-gradient(135deg, #00ff88 0%, #00ddff 100%)',
                    color: '#000',
                    fontWeight: 700,
                    fontFamily: 'Orbitron',
                    fontSize: '1.1rem',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                    border: '2px solid rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {!storedUser.profile_picture && storedUser.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#00ff88', 
                      fontWeight: 600,
                      fontFamily: 'Rajdhani',
                      lineHeight: 1.2,
                    }}
                  >
                    {storedUser.username}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {storedUser.role === 'admin' ? 'Administrator' : 'User'}
                  </Typography>
                </Box>
              </Box>

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
