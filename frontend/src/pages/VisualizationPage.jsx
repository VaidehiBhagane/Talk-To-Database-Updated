import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { queryAPI } from '../services/api';

const VisualizationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('auto');
  const [visualization, setVisualization] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, query, explanation } = location.state || {};

  const generateVisualization = useCallback(async () => {
    if (!data) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Generating visualization with:', { chartType, dataLength: data.length });
      
      const response = await queryAPI.visualize({
        data: data,
        chart_type: chartType,
        title: 'Query Results Visualization',
        query_text: query || '',
      });

      console.log('Visualization response:', response.data);
      setVisualization(response.data);
    } catch (err) {
      console.error('Visualization error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate visualization';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [data, chartType, query]);

  useEffect(() => {
    generateVisualization();
  }, [generateVisualization]);

  if (!data) {
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
            <Typography variant="h6">Visualization</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="warning">
            No data available for visualization. Please execute a query first.
          </Alert>
        </Container>
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
          <Typography variant="h6">Data Visualization</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {explanation && (
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Insights
            </Typography>
            <Typography variant="body1">{explanation}</Typography>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="auto">Auto Detect</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="scatter">Scatter Plot</MenuItem>
                <MenuItem value="table">Table</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && visualization && visualization.success && visualization.figure && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {visualization.data_summary?.rows} rows × {visualization.data_summary?.columns} columns | Chart Type: {visualization.chart_type}
              </Typography>
              <Plot
                data={visualization.figure.data}
                layout={{
                  ...visualization.figure.layout,
                  autosize: true,
                  responsive: true,
                }}
                config={{
                  displayModeBar: true,
                  displaylogo: false,
                  responsive: true,
                }}
                style={{ width: '100%', height: '600px' }}
              />
            </Box>
          )}

          {!loading && visualization && !visualization.success && (
            <Alert severity="error">
              {visualization.error || 'Failed to generate visualization'}
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VisualizationPage;
