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
  Badge,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  QueryStats as QueryIcon,
  TrendingUp as TrendingIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { adminAPI, businessUnitAPI } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createBUDialog, setCreateBUDialog] = useState(false);
  const [newBU, setNewBU] = useState({
    name: '',
    description: '',
    schema_name: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBU = async () => {
    try {
      await businessUnitAPI.create(newBU);
      setCreateBUDialog(false);
      setNewBU({ name: '', description: '', schema_name: '' });
      fetchAnalytics();
    } catch (err) {
      console.error('Error creating business unit:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/profile')}
            sx={{ mr: 1 }}
          >
            <AccountCircleIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/admin/notifications')}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            color="inherit"
            onClick={() => setCreateBUDialog(true)}
          >
            Create Business Unit
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Overview
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h3">{analytics?.total_users || 0}</Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Click to manage →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Business Units</Typography>
                </Box>
                <Typography variant="h3">{analytics?.total_business_units || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <QueryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Queries</Typography>
                </Box>
                <Typography variant="h3">{analytics?.total_queries || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Success Rate</Typography>
                </Box>
                <Typography variant="h3">{analytics?.success_rate || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Queries by Business Unit
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.queries_by_bu || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bu_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="query_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Users by Business Unit
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.active_users_by_bu || []}
                    dataKey="active_users"
                    nameKey="bu_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(analytics?.active_users_by_bu || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Query Activity
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Query</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(analytics?.recent_activity || []).map((activity, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{activity.username}</TableCell>
                    <TableCell>{activity.bu_name}</TableCell>
                    <TableCell>{activity.query_text}</TableCell>
                    <TableCell>
                      <Typography
                        color={activity.status === 'success' ? 'success.main' : 'error.main'}
                      >
                        {activity.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Create BU Dialog */}
      <Dialog open={createBUDialog} onClose={() => setCreateBUDialog(false)}>
        <DialogTitle>Create New Business Unit</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newBU.name}
            onChange={(e) => setNewBU({ ...newBU, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newBU.description}
            onChange={(e) => setNewBU({ ...newBU, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Schema Name"
            value={newBU.schema_name}
            onChange={(e) => setNewBU({ ...newBU, schema_name: e.target.value })}
            margin="normal"
            helperText="Database schema name for this business unit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBUDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBU} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
