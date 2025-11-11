import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Send as SendIcon,
  Visibility as ViewIcon,
  BarChart as ChartIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { businessUnitAPI, queryAPI } from '../services/api';

const ChatbotPage = () => {
  const { buId } = useParams();
  const navigate = useNavigate();
  const [bu, setBu] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [viewDataDialog, setViewDataDialog] = useState(false);

  useEffect(() => {
    fetchBusinessUnit();
  }, [buId]);

  const fetchBusinessUnit = async () => {
    try {
      const response = await businessUnitAPI.getById(buId);
      setBu(response.data.business_unit);
    } catch (err) {
      setError('Failed to load business unit');
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await queryAPI.execute({
        bu_id: parseInt(buId),
        query: query.trim(),
      });

      console.log('Query response:', response.data);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = () => {
    console.log('Visualize clicked - result:', result);
    if (result && result.data) {
      console.log('Navigating to visualization with data:', result.data);
      navigate('/visualization', {
        state: {
          data: result.data,
          query: query,
          explanation: result.explanation,
        },
      });
    } else {
      console.error('No data available for visualization', result);
      setError('No data available for visualization. Please execute a query first.');
    }
  };

  const handleDownload = async (format) => {
    if (!result || !result.data) return;

    try {
      const response = await queryAPI.export({
        data: result.data,
        format: format,
        filename: `${bu?.name}_query_results`,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bu?.name}_query_results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export data');
    }
  };

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
          <Typography variant="h6" component="div">
            {bu?.name || 'Loading...'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Ask a Question
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Type your question in natural language and let AI convert it to SQL
          </Typography>

          <form onSubmit={handleQuerySubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Show me total sales by region for this month"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              disabled={loading || !query.trim()}
            >
              {loading ? 'Processing...' : 'Execute Query'}
            </Button>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {result && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Insights
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.explanation}
                </Typography>
                <Chip
                  label={`${result.row_count} rows`}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${result.execution_time?.toFixed(3)}s`}
                  color="secondary"
                  size="small"
                />
              </CardContent>
            </Card>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => setViewDataDialog(true)}
                >
                  View Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ChartIcon />}
                  onClick={handleVisualize}
                >
                  Visualize Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload('csv')}
                >
                  Download CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload('xlsx')}
                >
                  Download Excel
                </Button>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Generated SQL:
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {result.sql}
              </Box>
            </Paper>
          </>
        )}

        {/* View Data Dialog */}
        <Dialog
          open={viewDataDialog}
          onClose={() => setViewDataDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Query Results</DialogTitle>
          <DialogContent>
            {result && result.data && (
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(result.data[0] || {}).map((key) => (
                        <TableCell key={key} sx={{ fontWeight: 'bold' }}>
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.data.map((row, idx) => (
                      <TableRow key={idx} hover>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>
                            {value !== null ? String(value) : 'NULL'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDataDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ChatbotPage;
