import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const snmpOperations = {
  get: async (oid, agent, community) => {
    try {
      const response = await api.post('/snmp/get', {
        oid,
        agent,
        community
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error occurred' };
    }
  },

  set: async (oid, value, type, agent, community) => {
    try {
      const response = await api.post('/snmp/set', {
        oid,
        value,
        type,
        agent,
        community
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error occurred' };
    }
  },

  getNext: async (oid, agent, community) => {
    try {
      const response = await api.post('/snmp/getnext', {
        oid,
        agent,
        community
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error occurred' };
    }
  },

  getTraps: async () => {
    try {
      const response = await api.get('/snmp/traps');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error occurred' };
    }
  }
};

export default api;