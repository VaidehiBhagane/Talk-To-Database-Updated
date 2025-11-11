import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
        borderTop: '2px solid rgba(0, 255, 136, 0.3)',
        boxShadow: '0 -4px 20px rgba(0, 255, 136, 0.2)',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
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
                  fontSize: '18px',
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
                }}
              >
                Talk to Database
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              AI-Powered Multi-Department Data Query Platform. Query your databases using natural language.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                component="a"
                href="https://github.com/VaidehiBhagane"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#00ff88',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(0, 255, 136, 0.6)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                component="a"
                href="https://www.linkedin.com/in/vaidehi-bhagane-261668372/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#00ff88',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(0, 255, 136, 0.6)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  },
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                size="small"
                component="a"
                href="vaidehi.bh4087@gmail.com"
                sx={{
                  color: '#00ff88',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(0, 255, 136, 0.6)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  },
                }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="h6"
              sx={{
                color: '#00ff88',
                fontFamily: 'Orbitron',
                fontWeight: 600,
                mb: 2,
                fontSize: '1rem',
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                onClick={() => navigate('/')}
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Home
              </Link>
              <Link
                onClick={() => navigate('/login')}
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Login
              </Link>
              <Link
                onClick={() => navigate('/signup')}
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Sign Up
              </Link>
              <Link
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Dashboard
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                color: '#00ff88',
                fontFamily: 'Orbitron',
                fontWeight: 600,
                mb: 2,
                fontSize: '1rem',
              }}
            >
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Documentation
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                API Reference
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Tutorials
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00ff88',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                Support
              </Link>
            </Box>
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                color: '#00ff88',
                fontFamily: 'Orbitron',
                fontWeight: 600,
                mb: 2,
                fontSize: '1rem',
              }}
            >
              Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon sx={{ color: '#00ff88', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Natural Language Queries
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ color: '#00ff88', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Secure & Role-Based
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon sx={{ color: '#00ff88', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Real-Time Analytics
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(0, 255, 136, 0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {currentYear} Talk to Database. All rights reserved. Built with AI-powered technology.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'all 0.3s',
                '&:hover': {
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'all 0.3s',
                '&:hover': {
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'all 0.3s',
                '&:hover': {
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
