const snmp = require('net-snmp');
const os = require('os');

class CustomMIB {
  constructor() {
    this.mib = new Map();
    this.startTime = Date.now();
  }

  initialize() {
    // System group (1.3.6.1.2.1.1)
    this.addOid('1.3.6.1.2.1.1.1.0', {
      type: snmp.ObjectType.OctetString,
      value: `${os.type()} ${os.release()} - SNMP Agent Simulator`,
      writable: false
    });

    this.addOid('1.3.6.1.2.1.1.2.0', {
      type: snmp.ObjectType.OID,
      value: '1.3.6.1.4.1.99999',
      writable: false
    });

    this.addOid('1.3.6.1.2.1.1.3.0', {
      type: snmp.ObjectType.TimeTicks,
      value: () => Math.floor((Date.now() - this.startTime) / 10),
      writable: false
    });

    this.addOid('1.3.6.1.2.1.1.4.0', {
      type: snmp.ObjectType.OctetString,
      value: 'admin@example.com',
      writable: true
    });

    this.addOid('1.3.6.1.2.1.1.5.0', {
      type: snmp.ObjectType.OctetString,
      value: os.hostname(),
      writable: true
    });

    this.addOid('1.3.6.1.2.1.1.6.0', {
      type: snmp.ObjectType.OctetString,
      value: 'Server Room A, Rack 5',
      writable: true
    });

    this.addOid('1.3.6.1.2.1.1.7.0', {
      type: snmp.ObjectType.Integer,
      value: 72,
      writable: false
    });

    // Host Resources (1.3.6.1.2.1.25)
    this.addOid('1.3.6.1.2.1.25.1.1.0', {
      type: snmp.ObjectType.TimeTicks,
      value: () => Math.floor(os.uptime() * 100),
      writable: false
    });

    // CPU Info
    this.addOid('1.3.6.1.2.1.25.3.3.1.2.1', {
      type: snmp.ObjectType.OctetString,
      value: os.cpus()[0].model,
      writable: false
    });

    // Memory Info
    this.addOid('1.3.6.1.2.1.25.2.2.0', {
      type: snmp.ObjectType.Integer,
      value: () => Math.floor(os.totalmem() / 1024),
      writable: false
    });

    this.addOid('1.3.6.1.2.1.25.2.3.1.6.1', {
      type: snmp.ObjectType.Integer,
      value: () => Math.floor(os.freemem() / 1024),
      writable: false
    });

    // Interface group (1.3.6.1.2.1.2)
    const interfaces = os.networkInterfaces();
    let ifIndex = 1;

    Object.keys(interfaces).forEach(ifName => {
      // Interface description
      this.addOid(`1.3.6.1.2.1.2.2.1.2.${ifIndex}`, {
        type: snmp.ObjectType.OctetString,
        value: ifName,
        writable: false
      });

      // Interface type (6 = ethernetCsmacd)
      this.addOid(`1.3.6.1.2.1.2.2.1.3.${ifIndex}`, {
        type: snmp.ObjectType.Integer,
        value: 6,
        writable: false
      });

      // Interface speed (simulated 1Gbps)
      this.addOid(`1.3.6.1.2.1.2.2.1.5.${ifIndex}`, {
        type: snmp.ObjectType.Gauge32,
        value: 1000000000,
        writable: false
      });

      // Interface admin status (1 = up)
      this.addOid(`1.3.6.1.2.1.2.2.1.7.${ifIndex}`, {
        type: snmp.ObjectType.Integer,
        value: 1,
        writable: true
      });

      // Interface operational status (1 = up)
      this.addOid(`1.3.6.1.2.1.2.2.1.8.${ifIndex}`, {
        type: snmp.ObjectType.Integer,
        value: 1,
        writable: false
      });

      // Inbound octets (simulated)
      this.addOid(`1.3.6.1.2.1.2.2.1.10.${ifIndex}`, {
        type: snmp.ObjectType.Counter32,
        value: () => Math.floor(Math.random() * 1000000000),
        writable: false
      });

      // Outbound octets (simulated)
      this.addOid(`1.3.6.1.2.1.2.2.1.16.${ifIndex}`, {
        type: snmp.ObjectType.Counter32,
        value: () => Math.floor(Math.random() * 1000000000),
        writable: false
      });

      ifIndex++;
    });

    // Custom enterprise OIDs (1.3.6.1.4.1.99999)
    this.addOid('1.3.6.1.4.1.99999.1.1.0', {
      type: snmp.ObjectType.OctetString,
      value: 'Custom MIB Value 1',
      writable: true
    });

    this.addOid('1.3.6.1.4.1.99999.1.2.0', {
      type: snmp.ObjectType.Integer,
      value: 42,
      writable: true
    });

    this.addOid('1.3.6.1.4.1.99999.1.3.0', {
      type: snmp.ObjectType.Counter32,
      value: () => Math.floor(Date.now() / 1000),
      writable: false
    });

    console.log(`MIB initialized with ${this.mib.size} OIDs`);
  }

  addOid(oid, config) {
    this.mib.set(oid, config);
  }

  getOid(oid) {
    return this.mib.get(oid);
  }

  hasOid(oid) {
    return this.mib.has(oid);
  }

  getAllOids() {
    return Array.from(this.mib.keys()).sort();
  }

  listAllOids() {
    return this.getAllOids();
  }

  updateOid(oid, value) {
    if (this.mib.has(oid)) {
      const config = this.mib.get(oid);
      if (config.writable) {
        config.value = value;
        return true;
      }
    }
    return false;
  }
}

module.exports = new CustomMIB();