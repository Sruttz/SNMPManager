const express = require('express');
const router = express.Router();
const snmpController = require('../controllers/snmp.controller');

// SNMP GET operation
router.post('/get', snmpController.snmpGet);

// SNMP SET operation
router.post('/set', snmpController.snmpSet);

// SNMP GETNEXT operation
router.post('/getnext', snmpController.snmpGetNext);

// Get SNMP TRAPs
router.get('/traps', snmpController.getTraps);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'SNMP routes working' });
});

module.exports = router;