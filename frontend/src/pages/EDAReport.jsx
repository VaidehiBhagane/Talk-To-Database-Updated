import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { businessUnitAPI, queryAPI } from '../services/api';
import { getErrorMessage, isAuthError } from '../services/errorHandler';
import { StatCardsSkeleton, TableSkeleton } from '../components/Skeletons';

const EDAReport = () => {
  const { buId } = useParams();
  const navigate = useNavigate();
  const [bu, setBu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edaData, setEdaData] = useState(null);

  useEffect(() => {
    fetchBusinessUnit();
    performEDA();
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

  const performEDA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await queryAPI.performEDA({
        business_unit_id: parseInt(buId),
      });

      console.log('EDA response:', response.data);
      setEdaData(response.data);
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'EDA analysis failed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title, value, icon, color = 'primary') => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderColumnStats = (columns) => {
    return Object.entries(columns).map(([colName, stats]) => (
      <Card key={colName} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {stats.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={stats.dtype} size="small" color="primary" />
            <Chip label={stats.type} size="small" />
            <Chip
              label={`${stats.null_percentage}% null`}
              size="small"
              color={stats.null_percentage > 20 ? 'error' : 'success'}
            />
            <Chip label={`${stats.unique_count} unique`} size="small" />
          </Box>

          {stats.type === 'numeric' && stats.mean !== null && (
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Min
                </Typography>
                <Typography variant="body1">
                  {stats.min?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Max
                </Typography>
                <Typography variant="body1">
                  {stats.max?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Mean
                </Typography>
                <Typography variant="body1">
                  {stats.mean?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Std Dev
                </Typography>
                <Typography variant="body1">
                  {stats.std?.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          )}

          {stats.type === 'categorical' && stats.top_values && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top Values:
              </Typography>
              {stats.top_values.map((item, idx) => (
                <Chip
                  key={idx}
                  label={`${item.value} (${item.count})`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    ));
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
          <AssessmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Data Analysis - {bu?.name || 'Loading...'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            <StatCardsSkeleton />
            <TableSkeleton rows={10} columns={4} />
          </>
        ) : edaData ? (
          <>
            {/* AI Summary Section */}
            {edaData.summary && (
              <Card
                sx={{
                  mb: 3,
                  bgcolor: '#e3f2fd',
                  borderLeft: '4px solid #2196f3',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1, color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ color: '#1565c0' }}>
                      AI Insights
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {edaData.summary}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Basic Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatCard(
                  'Total Rows',
                  edaData.stats.row_count.toLocaleString(),
                  <AssessmentIcon color="primary" />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatCard(
                  'Columns',
                  edaData.stats.column_count,
                  <AssessmentIcon color="secondary" />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatCard(
                  'Duplicates',
                  edaData.stats.duplicate_rows,
                  edaData.stats.duplicate_rows > 0 ? (
                    <WarningIcon color="warning" />
                  ) : (
                    <CheckIcon color="success" />
                  ),
                  edaData.stats.duplicate_rows > 0 ? 'warning' : 'success'
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatCard(
                  'Anomalies',
                  edaData.anomalies.length,
                  edaData.anomalies.length > 0 ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <CheckIcon color="success" />
                  ),
                  edaData.anomalies.length > 0 ? 'error' : 'success'
                )}
              </Grid>
            </Grid>

            {/* Table Name */}
            {edaData.table_name && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Analyzing table: <strong>{edaData.table_name}</strong> (first
                1000 rows)
              </Alert>
            )}

            {/* Column Statistics */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Column Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {edaData.stats.columns &&
                renderColumnStats(edaData.stats.columns)}
            </Paper>

            {/* Anomalies Section */}
            {edaData.anomalies && edaData.anomalies.length > 0 && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Anomalies Detected
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {edaData.anomalies.length} rows with unusual values detected
                  (Z-score &gt; 3)
                </Alert>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Row Index
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Anomalous Columns
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Values
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {edaData.anomalies.map((anomaly, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            bgcolor: 'rgba(255, 0, 0, 0.05)',
                            '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.1)' },
                          }}
                        >
                          <TableCell>{anomaly.row_index}</TableCell>
                          <TableCell>
                            {anomaly.anomalous_columns
                              .map((col) => col.column)
                              .join(', ')}
                          </TableCell>
                          <TableCell>
                            {anomaly.anomalous_columns.map((col, i) => (
                              <Chip
                                key={i}
                                label={`${col.column}: ${col.value} (Z=${col.z_score.toFixed(
                                  2
                                )})`}
                                size="small"
                                color="error"
                                sx={{ mr: 1, mb: 0.5 }}
                              />
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        ) : null}
      </Container>
    </Box>
  );
};

export default EDAReport;
