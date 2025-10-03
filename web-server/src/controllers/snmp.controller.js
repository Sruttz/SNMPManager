const snmpManagerService = require('../services/snmp-manager.service');

// In-memory trap storage (use Redis/DB in production)
let trapStorage = [];

const snmpController = {
  // Handle SNMP GET request
  snmpGet: async (req, res, next) => {
    try {
      const { oid, agent, community } = req.body;

      // Validation
      if (!oid || !agent || !community) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: oid, agent, community'
        });
      }

      // Validate OID format
      const oidPattern = /^[0-9]+(\.[0-9]+)*$/;
      if (!oidPattern.test(oid)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OID format'
        });
      }

      console.log(`SNMP GET - OID: ${oid}, Agent: ${agent}`);

      const result = await snmpManagerService.get(oid, agent, community);

      res.json({
        success: true,
        oid: result.oid,
        value: result.value,
        type: result.type
      });
    } catch (error) {
      console.error('SNMP GET Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute SNMP GET'
      });
    }
  },

  // Handle SNMP SET request
  snmpSet: async (req, res, next) => {
    try {
      const { oid, value, type, agent, community } = req.body;

      // Validation
      if (!oid || value === undefined || !type || !agent || !community) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: oid, value, type, agent, community'
        });
      }

      // Validate OID format
      const oidPattern = /^[0-9]+(\.[0-9]+)*$/;
      if (!oidPattern.test(oid)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OID format'
        });
      }

      console.log(`SNMP SET - OID: ${oid}, Value: ${value}, Agent: ${agent}`);

      const result = await snmpManagerService.set(oid, value, type, agent, community);

      res.json({
        success: true,
        message: 'Value set successfully',
        oid: oid,
        value: value
      });
    } catch (error) {
      console.error('SNMP SET Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute SNMP SET'
      });
    }
  },

  // Handle SNMP GETNEXT request
  snmpGetNext: async (req, res, next) => {
    try {
      const { oid, agent, community } = req.body;

      // Validation
      if (!oid || !agent || !community) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: oid, agent, community'
        });
      }

      // Validate OID format
      const oidPattern = /^[0-9]+(\.[0-9]+)*$/;
      if (!oidPattern.test(oid)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OID format'
        });
      }

      console.log(`SNMP GETNEXT - OID: ${oid}, Agent: ${agent}`);

      const result = await snmpManagerService.getNext(oid, agent, community);

      res.json({
        success: true,
        nextOid: result.oid,
        value: result.value,
        type: result.type
      });
    } catch (error) {
      console.error('SNMP GETNEXT Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute SNMP GETNEXT'
      });
    }
  },

  // Get stored TRAPs
  getTraps: (req, res) => {
    try {
      res.json({
        success: true,
        traps: trapStorage,
        count: trapStorage.length
      });
    } catch (error) {
      console.error('Get TRAPs Error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve TRAPs'
      });
    }
  }
};

// Function to add trap to storage (called by trap receiver)
snmpController.addTrap = (trap) => {
  trapStorage.unshift(trap);
  // Keep only last 100 traps
  if (trapStorage.length > 100) {
    trapStorage = trapStorage.slice(0, 100);
  }
};

module.exports = snmpController;