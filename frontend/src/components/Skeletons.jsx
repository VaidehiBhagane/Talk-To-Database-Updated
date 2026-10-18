import React from 'react';
import { Box, Skeleton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

/**
 * Skeleton loader for query results table
 * Shows 5 shimmer rows while data is loading
 */
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {[...Array(columns)].map((_, index) => (
              <TableCell key={`header-${index}`}>
                <Skeleton variant="text" width="80%" height={30} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(rows)].map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {[...Array(columns)].map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton variant="text" width="90%" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Skeleton loader for Dashboard business unit cards
 * Shows 3 card skeletons in a grid
 */
export const CardGridSkeleton = ({ count = 3 }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mt: 4 }}>
      {[...Array(count)].map((_, index) => (
        <Paper key={`card-${index}`} elevation={3} sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

/**
 * Skeleton loader for Profile statistics cards
 * Shows 3 stat card skeletons in a row
 */
export const StatCardsSkeleton = () => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
      {[...Array(3)].map((_, index) => (
        <Paper key={`stat-${index}`} elevation={2} sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={50} />
          <Skeleton variant="text" width="80%" height={20} />
        </Paper>
      ))}
    </Box>
  );
};

/**
 * Skeleton loader for charts (bar charts, pie charts, etc.)
 */
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
    </Box>
  );
};

/**
 * Skeleton loader for list items
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Box key={`list-item-${index}`} sx={{ mb: 2, p: 2, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
          <Skeleton variant="text" width="70%" height={25} />
          <Skeleton variant="text" width="90%" />
        </Box>
      ))}
    </Box>
  );
};
