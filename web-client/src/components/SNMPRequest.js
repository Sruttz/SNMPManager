import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { snmpOperations } from '../services/api';

const SNMPRequest = ({ onResponse, setLoading }) => {
  const [formData, setFormData] = useState({
    operation: 'get',
    oid: '1.3.6.1.2.1.1.1.0',
    agent: '127.0.0.1',
    community: 'public',
    value: '',
    type: 'OctetString'
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateOID = (oid) => {
    const oidPattern = /^[0-9]+(\.[0-9]+)*$/;
    return oidPattern.test(oid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateOID(formData.oid)) {
      setError('Invalid OID format. Use format: 1.3.6.1.2.1.1.1.0');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);

    try {
      let result;
      const timestamp = new Date().toISOString();

      switch (formData.operation) {
        case 'get':
          result = await snmpOperations.get(
            formData.oid,
            formData.agent,
            formData.community
          );
          onResponse({
            ...result,
            operation: 'GET',
            timestamp
          });
          break;

        case 'set':
          if (!formData.value) {
            throw { error: 'Value is required for SET operation' };
          }
          result = await snmpOperations.set(
            formData.oid,
            formData.value,
            formData.type,
            formData.agent,
            formData.community
          );
          onResponse({
            ...result,
            operation: 'SET',
            timestamp
          });
          break;

        case 'getnext':
          result = await snmpOperations.getNext(
            formData.oid,
            formData.agent,
            formData.community
          );
          onResponse({
            ...result,
            operation: 'GETNEXT',
            timestamp
          });
          break;

        default:
          throw { error: 'Invalid operation' };
      }
    } catch (err) {
      const errorMsg = err.error || err.message || 'Operation failed';
      setError(errorMsg);
      setOpenSnackbar(true);
      onResponse({
        success: false,
        error: errorMsg,
        operation: formData.operation.toUpperCase(),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Operation</InputLabel>
            <Select
              name="operation"
              value={formData.operation}
              onChange={handleChange}
              label="Operation"
            >
              <MenuItem value="get">GET</MenuItem>
              <MenuItem value="set">SET</MenuItem>
              <MenuItem value="getnext">GETNEXT</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="OID"
            name="oid"
            value={formData.oid}
            onChange={handleChange}
            placeholder="1.3.6.1.2.1.1.1.0"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Agent IP"
            name="agent"
            value={formData.agent}
            onChange={handleChange}
            placeholder="192.168.1.100"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Community String"
            name="community"
            value={formData.community}
            onChange={handleChange}
            placeholder="public"
            required
          />
        </Grid>

        {formData.operation === 'set' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Data Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Data Type"
                >
                  <MenuItem value="OctetString">String</MenuItem>
                  <MenuItem value="Integer">Integer</MenuItem>
                  <MenuItem value="Counter32">Counter32</MenuItem>
                  <MenuItem value="Gauge32">Gauge32</MenuItem>
                  <MenuItem value="TimeTicks">TimeTicks</MenuItem>
                  <MenuItem value="IpAddress">IP Address</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            fullWidth
          >
            Execute SNMP {formData.operation.toUpperCase()}
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SNMPRequest;