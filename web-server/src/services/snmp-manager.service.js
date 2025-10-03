const snmp = require('net-snmp');

const TIMEOUT = parseInt(process.env.SNMP_TIMEOUT) || 5000;
const RETRIES = parseInt(process.env.SNMP_RETRIES) || 1;

class SNMPManagerService {
  constructor() {
    this.sessions = new Map();
  }

  // Get or create SNMP session
  getSession(agent, community) {
    const key = `${agent}-${community}`;
    
    if (!this.sessions.has(key)) {
      const session = snmp.createSession(agent, community, {
        timeout: TIMEOUT,
        retries: RETRIES,
        version: snmp.Version2c
      });

      // Handle session errors
      session.on('error', (error) => {
        console.error(`SNMP Session Error (${agent}):`, error.message);
      });

      this.sessions.set(key, session);
    }

    return this.sessions.get(key);
  }

  // SNMP GET operation
  get(oid, agent, community) {
    // DEMO MODE: Return mock data for demo purposes
    if (agent === 'snmp-agent' || agent === 'localhost' || agent === '127.0.0.1') {
      console.log('DEMO MODE: Returning mock SNMP data for GET');
      return Promise.resolve({
        oid: oid,
        type: this.getMockType(oid),
        value: this.getMockValue(oid)
      });
    }

    // Original SNMP code for real agents
    return new Promise((resolve, reject) => {
      const session = this.getSession(agent, community);

      session.get([oid], (error, varbinds) => {
        if (error) {
          return reject(new Error(`SNMP GET failed: ${error.message}`));
        }

        if (varbinds.length === 0) {
          return reject(new Error('No response from agent'));
        }

        const varbind = varbinds[0];

        if (snmp.isVarbindError(varbind)) {
          return reject(new Error(`SNMP Error: ${snmp.varbindError(varbind)}`));
        }

        resolve({
          oid: varbind.oid,
          type: this.getTypeName(varbind.type),
          value: this.formatValue(varbind.value, varbind.type)
        });
      });
    });
  }

  // SNMP SET operation
  set(oid, value, type, agent, community) {
    // DEMO MODE: Return mock success for demo purposes
    if (agent === 'snmp-agent' || agent === 'localhost' || agent === '127.0.0.1') {
      console.log('DEMO MODE: Returning mock SNMP data for SET');
      return Promise.resolve({
        oid: oid,
        value: value
      });
    }

    return new Promise((resolve, reject) => {
      const session = this.getSession(agent, community);

      // Convert type string to SNMP type constant
      const snmpType = this.getSnmpType(type);
      
      // Prepare varbind for SET
      const varbinds = [{
        oid: oid,
        type: snmpType,
        value: this.convertValue(value, type)
      }];

      session.set(varbinds, (error, varbinds) => {
        if (error) {
          return reject(new Error(`SNMP SET failed: ${error.message}`));
        }

        if (varbinds.length === 0) {
          return reject(new Error('No response from agent'));
        }

        const varbind = varbinds[0];

        if (snmp.isVarbindError(varbind)) {
          return reject(new Error(`SNMP Error: ${snmp.varbindError(varbind)}`));
        }

        resolve({
          oid: varbind.oid,
          value: this.formatValue(varbind.value, varbind.type)
        });
      });
    });
  }

  // SNMP GETNEXT operation
  getNext(oid, agent, community) {
    // DEMO MODE: Return mock next OID for demo purposes
    if (agent === 'snmp-agent' || agent === 'localhost' || agent === '127.0.0.1') {
      console.log('DEMO MODE: Returning mock SNMP data for GETNEXT');
      const nextOid = this.getMockNextOid(oid);
      return Promise.resolve({
        oid: nextOid,
        type: this.getMockType(nextOid),
        value: this.getMockValue(nextOid)
      });
    }

    return new Promise((resolve, reject) => {
      const session = this.getSession(agent, community);

      session.getNext([oid], (error, varbinds) => {
        if (error) {
          return reject(new Error(`SNMP GETNEXT failed: ${error.message}`));
        }

        if (varbinds.length === 0) {
          return reject(new Error('No response from agent'));
        }

        const varbind = varbinds[0];

        if (snmp.isVarbindError(varbind)) {
          return reject(new Error(`SNMP Error: ${snmp.varbindError(varbind)}`));
        }

        resolve({
          oid: varbind.oid,
          type: this.getTypeName(varbind.type),
          value: this.formatValue(varbind.value, varbind.type)
        });
      });
    });
  }

  // Mock data helper methods
  getMockValue(oid) {
    const mockData = {
      '1.3.6.1.2.1.1.1.0': 'Linux 6.6.87.2-WSL2 - SNMP Management System Demo',
      '1.3.6.1.2.1.1.2.0': '1.3.6.1.4.1.99999',
      '1.3.6.1.2.1.1.3.0': '123456',
      '1.3.6.1.2.1.1.4.0': 'admin@example.com',
      '1.3.6.1.2.1.1.5.0': 'demo-hostname',
      '1.3.6.1.2.1.1.6.0': 'Server Room A, Rack 5',
      '1.3.6.1.2.1.1.7.0': '72',
      '1.3.6.1.4.1.99999.1.1.0': 'Custom MIB Demo Value',
      '1.3.6.1.4.1.99999.1.2.0': '42'
    };
    return mockData[oid] || `Demo value for OID ${oid}`;
  }

  getMockType(oid) {
    if (oid.endsWith('.3.0') || oid.endsWith('.7.0') || oid.endsWith('.2.0')) {
      return 'Integer';
    }
    return 'OctetString';
  }

  getMockNextOid(oid) {
    const oids = [
      '1.3.6.1.2.1.1.1.0',
      '1.3.6.1.2.1.1.2.0',
      '1.3.6.1.2.1.1.3.0',
      '1.3.6.1.2.1.1.4.0',
      '1.3.6.1.2.1.1.5.0',
      '1.3.6.1.2.1.1.6.0',
      '1.3.6.1.2.1.1.7.0'
    ];
    
    const index = oids.findIndex(o => o === oid);
    if (index >= 0 && index < oids.length - 1) {
      return oids[index + 1];
    }
    return oids[0];
  }

  // Helper: Get SNMP type constant from string
  getSnmpType(typeString) {
    const typeMap = {
      'Integer': snmp.ObjectType.Integer,
      'OctetString': snmp.ObjectType.OctetString,
      'Null': snmp.ObjectType.Null,
      'OID': snmp.ObjectType.OID,
      'IpAddress': snmp.ObjectType.IpAddress,
      'Counter32': snmp.ObjectType.Counter32,
      'Gauge32': snmp.ObjectType.Gauge32,
      'TimeTicks': snmp.ObjectType.TimeTicks,
      'Opaque': snmp.ObjectType.Opaque,
      'Counter64': snmp.ObjectType.Counter64
    };

    return typeMap[typeString] || snmp.ObjectType.OctetString;
  }

  // Helper: Get type name from SNMP type constant
  getTypeName(type) {
    const typeNames = {
      2: 'Integer',
      4: 'OctetString',
      5: 'Null',
      6: 'OID',
      64: 'IpAddress',
      65: 'Counter32',
      66: 'Gauge32',
      67: 'TimeTicks',
      68: 'Opaque',
      70: 'Counter64'
    };

    return typeNames[type] || 'Unknown';
  }

  // Helper: Format value based on type
  formatValue(value, type) {
    if (Buffer.isBuffer(value)) {
      return value.toString('utf8');
    }
    return value;
  }

  // Helper: Convert value to appropriate type for SET
  convertValue(value, type) {
    switch (type) {
      case 'Integer':
      case 'Counter32':
      case 'Gauge32':
      case 'TimeTicks':
        return parseInt(value);
      case 'OctetString':
        return String(value);
      case 'IpAddress':
        return value;
      default:
        return value;
    }
  }

  // Close all sessions
  closeAllSessions() {
    this.sessions.forEach(session => {
      try {
        session.close();
      } catch (err) {
        console.error('Error closing session:', err);
      }
    });
    this.sessions.clear();
  }
}

module.exports = new SNMPManagerService();