import React, { useState } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import SNMPRequest from './components/SNMPRequest';
import SNMPResponse from './components/SNMPResponse';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleResponse = (response) => {
    setResponses(prev => [response, ...prev]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SNMP Management System
            </Typography>
            <Typography variant="body2">
              Team Project - Network Management
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              SNMP Operations
            </Typography>
            <SNMPRequest 
              onResponse={handleResponse}
              setLoading={setLoading}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Response History
            </Typography>
            <SNMPResponse responses={responses} loading={loading} />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;