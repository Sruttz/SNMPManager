const customMib = require('../mib/custom-mib');
const snmp = require('net-snmp');

class OIDHandler {
  getValue(oid) {
    const oidConfig = customMib.getOid(oid);

    if (!oidConfig) {
      console.log(`OID not found: ${oid}`);
      return null;
    }

    let value = oidConfig.value;

    // If value is a function, call it to get dynamic value
    if (typeof value === 'function') {
      value = value();
    }

    return {
      type: oidConfig.type,
      value: value
    };
  }

  setValue(oid, value, type) {
    const oidConfig = customMib.getOid(oid);

    if (!oidConfig) {
      console.log(`OID not found: ${oid}`);
      return false;
    }

    if (!oidConfig.writable) {
      console.log(`OID is not writable: ${oid}`);
      return false;
    }

    // Update the value
    return customMib.updateOid(oid, value);
  }

  getNextOid(oid) {
    const allOids = customMib.getAllOids();
    
    // Find the next OID in lexicographic order
    for (let i = 0; i < allOids.length; i++) {
      if (this.compareOids(allOids[i], oid) > 0) {
        return allOids[i];
      }
    }

    // No next OID found
    return null;
  }

  // Compare two OIDs lexicographically
  compareOids(oid1, oid2) {
    const parts1 = oid1.split('.').map(Number);
    const parts2 = oid2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }
}

module.exports = new OIDHandler();