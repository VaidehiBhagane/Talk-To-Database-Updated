import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
} from '@mui/icons-material';
import { businessUnitAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessUnits();
  }, []);

  const fetchBusinessUnits = async () => {
    try {
      const response = await businessUnitAPI.getAll();
      setBusinessUnits(response.data.business_units);
    } catch (err) {
      console.error('Error fetching business units:', err);
    } finally {
      setLoading(false);
    }
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {storedUser.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a business unit to start querying data
          </Typography>
          {storedUser.role === 'admin' && (
            <Chip
              label="Admin"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : businessUnits.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="text.secondary">
                No business units available
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                Contact your administrator to get access to business units
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {businessUnits.map((bu) => (
              <Grid item xs={12} sm={6} md={4} key={bu.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/chatbot/${bu.id}`)}
                    sx={{ height: '100%', p: 2 }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          <BusinessIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          {bu.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {bu.description || 'No description available'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
