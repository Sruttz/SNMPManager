import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const SNMPResponse = ({ responses, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (responses.length === 0) {
    return (
      <Alert severity="info">
        No operations performed yet. Execute an SNMP operation to see results.
      </Alert>
    );
  }

  return (
    <Box>
      {responses.map((response, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={response.operation}
                  color="primary"
                  size="small"
                />
                {response.success ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(response.timestamp).toLocaleString()}
              </Typography>
            </Box>

            {response.success ? (
              <Box>
                {response.oid && (
                  <Typography variant="body2" gutterBottom>
                    <strong>OID:</strong> {response.oid}
                  </Typography>
                )}
                {response.nextOid && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Next OID:</strong> {response.nextOid}
                  </Typography>
                )}
                {response.value !== undefined && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Value:</strong> {response.value}
                  </Typography>
                )}
                {response.type && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {response.type}
                  </Typography>
                )}
                {response.message && (
                  <Typography variant="body2" color="success.main">
                    {response.message}
                  </Typography>
                )}
              </Box>
            ) : (
              <Alert severity="error">
                {response.error || 'Operation failed'}
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SNMPResponse;