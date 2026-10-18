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
  InputAdornment,
} from '@mui/material';
import { getErrorMessage, isAuthError } from '../services/errorHandler';
import { TableSkeleton } from '../components/Skeletons';
import VoiceMicButton from '../components/VoiceMicButton';
import {
  ArrowBack,
  Send as SendIcon,
  Visibility as ViewIcon,
  BarChart as ChartIcon,
  Download as DownloadIcon,
  AutoAwesome as SparkleIcon,
  PictureAsPdf as PdfIcon,  // NEW: Icon for PDF export
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
  const [summary, setSummary] = useState('');  // NEW: State for AI summary
  const [summaryLoading, setSummaryLoading] = useState(false);  // NEW: Loading state for summary

  useEffect(() => {
    fetchBusinessUnit();
  }, [buId]);

  const fetchBusinessUnit = async () => {
    try {
      const response = await businessUnitAPI.getById(buId);
      setBu(response.data.business_unit);
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Failed to load business unit');
      setError(errorMsg);
      if (isAuthError(err)) {
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSummary('');  // NEW: Clear previous summary

    try {
      const response = await queryAPI.execute({
        bu_id: parseInt(buId),
        query: query.trim(),
      });

      console.log('Query response:', response.data);
      setResult(response.data);
      
      // NEW: Call summarization endpoint (non-blocking)
      // Call even for empty results to show "No results" message
      if (response.data.success && response.data.data) {
        console.log('Calling fetchSummary with', response.data.data.length, 'results');
        fetchSummary(response.data.data, query.trim());
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Query execution failed');
      setError(errorMsg);
      if (isAuthError(err)) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to fetch AI summary
  const fetchSummary = async (results, question) => {
    setSummaryLoading(true);
    try {
      const response = await queryAPI.summarize({
        results: results,
        question: question,
      });
      
      if (response.data.success && response.data.summary) {
        setSummary(response.data.summary);
      }
    } catch (err) {
      // Silently fail - summarization is non-critical
      console.log('Summary generation failed (non-critical):', err);
    } finally {
      setSummaryLoading(false);
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
      const errorMsg = getErrorMessage(err, 'Failed to export data');
      setError(errorMsg);
    }
  };

  // NEW: Handle PDF export with AI summary
  const handleDownloadPDF = async () => {
    if (!result || !result.data) return;

    try {
      const response = await queryAPI.exportPDF({
        results: result.data,
        summary: summary || 'No summary available',
        query_text: query,
        // chart_base64: null, // TODO: Add chart snapshot in future
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bu?.name}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Failed to export PDF');
      setError(errorMsg);
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                    <VoiceMicButton
                      onTranscript={(text) => setQuery(text)}
                      tooltipText="Click to speak your query"
                    />
                  </InputAdornment>
                ),
              }}
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
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && <TableSkeleton rows={5} columns={5} />}

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
                {/* NEW: Export PDF Button */}
                <Button
                  variant="contained"
                  startIcon={<PdfIcon />}
                  onClick={handleDownloadPDF}
                  sx={{ 
                    bgcolor: '#ff0055',
                    '&:hover': { bgcolor: '#cc0044' }
                  }}
                >
                  Export PDF
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

            {/* NEW: AI Summary Card - Shows below the generated SQL */}
            {(summary || summaryLoading) && (
              <Card 
                sx={{ 
                  mt: 3, 
                  bgcolor: '#e3f2fd',  // Light blue background
                  borderLeft: '4px solid #2196f3'  // Blue accent border
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SparkleIcon sx={{ mr: 1, color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ color: '#1565c0' }}>
                      AI Summary
                    </Typography>
                  </Box>
                  {summaryLoading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      ✨ Generating AI insights...
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                      {summary}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
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
