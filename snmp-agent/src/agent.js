const dgram = require('dgram');
const customMib = require('./mib/custom-mib');
const oidHandler = require('./handlers/oid-handler');

const PORT = parseInt(process.env.AGENT_PORT) || 161;
const COMMUNITY_READ = process.env.COMMUNITY_READ || 'public';
const COMMUNITY_WRITE = process.env.COMMUNITY_WRITE || 'private';

console.log('Starting Simple SNMP Agent...');
console.log(`Port: ${PORT}`);
console.log(`Read Community: ${COMMUNITY_READ}`);
console.log(`Write Community: ${COMMUNITY_WRITE}`);

// Initialize MIB
customMib.initialize();

// Create UDP socket
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
});

server.on('message', (msg, rinfo) => {
    console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
    
    try {
        // Simple SNMP response - just echo back with values from MIB
        // This is a simplified implementation
        
        // Parse basic SNMP structure (simplified)
        // For demo purposes, we'll respond to any request with a predefined OID
        
        // In a real implementation, you'd parse the SNMP PDU properly
        // For now, send a basic SNMP GET response
        
        const oid = '1.3.6.1.2.1.1.1.0';
        const result = oidHandler.getValue(oid);
        
        if (result) {
            console.log(`Responding with OID: ${oid}, Value: ${result.value}`);
        }
        
        // Echo response (simplified - in production you'd build proper SNMP packet)
        server.send(msg, 0, msg.length, rinfo.port, rinfo.address, (err) => {
            if (err) {
                console.error('Error sending response:', err);
            } else {
                console.log('Response sent');
            }
        });
        
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`SNMP Agent listening on ${address.address}:${address.port}`);
    console.log('Registered OIDs:');
    const allOids = customMib.getAllOids();
    allOids.slice(0, 10).forEach(oid => console.log(`  - ${oid}`));
    if (allOids.length > 10) {
        console.log(`  ... and ${allOids.length - 10} more`);
    }
    console.log('Agent ready to receive SNMP requests');
});

// Bind to port
server.bind(PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
});