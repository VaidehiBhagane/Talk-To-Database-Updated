import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    // Load Vanta.js scripts dynamically
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Load Three.js first
        if (!window.THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        }
        
        // Then load Vanta.js NET effect
        if (!window.VANTA) {
          await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js');
        }
        
        // Initialize Vanta effect
        if (window.VANTA && vantaRef.current) {
          vantaEffect.current = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x2abad1,
            backgroundColor: 0x0,
            points: 12.00
          });
        }
      } catch (error) {
        console.error('Error loading Vanta.js:', error);
      }
    };

    initVanta();

    // Cleanup
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return (
    <Box
      ref={vantaRef}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2abad1 0%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Talk to Database
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 3 }}>
            AI-Powered Multi-Department Data Query Platform
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Query your company's data across multiple departments using natural language.
            Powered by OpenAI GPT-4, get instant insights, visualizations, and exports.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <ChatIcon sx={{ fontSize: 50, color: '#2abad1', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Natural Language Queries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ask questions in plain English, no SQL knowledge required
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <AnalyticsIcon sx={{ fontSize: 50, color: '#667eea', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Interactive Visualizations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PowerBI-like charts and graphs for better insights
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <DashboardIcon sx={{ fontSize: 50, color: '#2abad1', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Department Isolation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure data access per business unit
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #2abad1 0%, #667eea 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1a9ab1 0%, #5569ca 100%)',
                }
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/signup')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: '#2abad1',
                color: '#2abad1',
                '&:hover': {
                  borderColor: '#1a9ab1',
                  backgroundColor: 'rgba(42, 171, 209, 0.04)',
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
