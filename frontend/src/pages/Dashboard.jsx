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
  Chip,
  Button,
  CardActions,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assessment as AssessmentIcon,  // NEW: Icon for EDA
} from '@mui/icons-material';
import { businessUnitAPI } from '../services/api';
import { getErrorMessage, isAuthError } from '../services/errorHandler';
import { CardGridSkeleton } from '../components/Skeletons';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBusinessUnits();
  }, []);

  const fetchBusinessUnits = async () => {
    try {
      const response = await businessUnitAPI.getAll();
      setBusinessUnits(response.data.business_units);
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Failed to load business units');
      setError(errorMsg);
      if (isAuthError(err)) {
        setTimeout(() => navigate('/login'), 2000);
      }
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <CardGridSkeleton count={3} />
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
                    sx={{ p: 2 }}
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
                  {/* NEW: EDA Button */}
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AssessmentIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/eda/${bu.id}`);
                      }}
                      sx={{ width: '90%' }}
                    >
                      Analyze Table
                    </Button>
                  </CardActions>
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
