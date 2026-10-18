import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ChatbotPage from './pages/ChatbotPage';
import VisualizationPage from './pages/VisualizationPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import EDAReport from './pages/EDAReport';

// NEW: Create dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
      light: '#5dffb8',
      dark: '#00cc6f',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff',
      light: '#ff5dff',
      dark: '#cc00cc',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#00ff88',
      light: '#5dffb8',
    },
    error: {
      main: '#ff0055',
      light: '#ff5d8f',
    },
    warning: {
      main: '#ffaa00',
      light: '#ffcc5d',
    },
    info: {
      main: '#00ddff',
      light: '#5de9ff',
    },
  },
  typography: {
    fontFamily: [
      'Orbitron',
      'Rajdhani',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
    },
    h2: {
      fontWeight: 700,
      textShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
    },
    h3: {
      fontWeight: 600,
      textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
    },
    h4: {
      fontWeight: 600,
      textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.1), 0 0 40px rgba(0, 255, 136, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(0, 255, 136, 0.5)',
            boxShadow: '0 8px 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 255, 136, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
          border: '1px solid rgba(0, 255, 136, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
            transform: 'scale(1.02)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%)',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 255, 136, 0.3)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 136, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ff88',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '6px',
        },
        filled: {
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0d0d0d',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        },
        root: {
          borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          borderColor: 'rgba(0, 255, 136, 0.5)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
        },
        standardError: {
          backgroundColor: 'rgba(255, 0, 85, 0.1)',
          borderColor: 'rgba(255, 0, 85, 0.5)',
          boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 170, 0, 0.1)',
          borderColor: 'rgba(255, 170, 0, 0.5)',
          boxShadow: '0 0 20px rgba(255, 170, 0, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 221, 255, 0.1)',
          borderColor: 'rgba(0, 221, 255, 0.5)',
          boxShadow: '0 0 20px rgba(0, 221, 255, 0.2)',
        },
      },
    },
  },
});

// NEW: Create light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00cc6f',
      light: '#5dffb8',
      dark: '#009955',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#cc00cc',
      light: '#ff5dff',
      dark: '#990099',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    success: {
      main: '#00cc6f',
      light: '#5dffb8',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
    },
  },
  typography: {
    fontFamily: [
      'Orbitron',
      'Rajdhani',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '1px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '6px',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  // NEW: Theme mode state
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // NEW: Load theme preference from localStorage
    const storedTheme = localStorage.getItem('themeMode');
    if (storedTheme) {
      setThemeMode(storedTheme);
    }
  }, []);

  // NEW: Toggle theme function
  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // NEW: Select theme based on mode
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout hideHeaderFooter><HomePage /></Layout>} />
          <Route path="/login" element={<Layout hideHeaderFooter><LoginPage setUser={setUser} /></Layout>} />
          <Route path="/signup" element={<Layout hideHeaderFooter><SignupPage setUser={setUser} /></Layout>} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><Dashboard user={user} /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot/:buId"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><ChatbotPage user={user} /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualization"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><VisualizationPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><ProfilePage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/eda/:buId"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><EDAReport /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><AdminDashboard user={user} /></Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><AdminNotificationsPage user={user} /></Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Layout toggleTheme={toggleTheme} themeMode={themeMode}><AdminUsersPage user={user} /></Layout>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
