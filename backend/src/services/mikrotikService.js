const RouterOSAPI = require('node-routeros').RouterOSAPI;
const crypto = require('crypto');

class MikrotikService {
  constructor() {
    this.connections = new Map(); // Store active connections
    this.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'noc-management-secret-key-32bytes';
    this.ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  }

  // Encrypt password for storage
  encryptPassword(password) {
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt password for connection
  decryptPassword(encryptedPassword) {
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(this.ENCRYPTION_ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Connect to MikroTik device
  async connect(device) {
    try {
      const connectionKey = `device_${device.id}`;
      
      // Check if already connected
      if (this.connections.has(connectionKey)) {
        const existing = this.connections.get(connectionKey);
        if (existing.isConnected) {
          console.log(`Already connected to ${device.name}`);
          return existing.conn;
        }
      }

      // Parse API config
      const apiConfig = typeof device.apiConfig === 'string' 
        ? JSON.parse(device.apiConfig) 
        : device.apiConfig;

      if (!apiConfig || !apiConfig.username || !apiConfig.password) {
        throw new Error('MikroTik API configuration is incomplete');
      }

      // Decrypt password
      const password = apiConfig.password.includes(':') 
        ? this.decryptPassword(apiConfig.password)
        : apiConfig.password;

      // Create connection
      const conn = new RouterOSAPI({
        host: device.ipAddress,
        port: apiConfig.port || 8728,
        user: apiConfig.username,
        password: password,
        timeout: apiConfig.timeout || 10000,
      });

      console.log(`Connecting to MikroTik ${device.name} (${device.ipAddress})...`);
      await conn.connect();
      console.log(`✅ Connected to ${device.name}`);

      // Store connection
      this.connections.set(connectionKey, {
        conn,
        device,
        connectedAt: new Date(),
        isConnected: true,
      });

      return conn;
    } catch (error) {
      console.error(`Failed to connect to ${device.name}:`, error.message);
      throw new Error(`MikroTik connection failed: ${error.message}`);
    }
  }

  // Disconnect from device
  async disconnect(deviceId) {
    const connectionKey = `device_${deviceId}`;
    
    if (this.connections.has(connectionKey)) {
      const { conn } = this.connections.get(connectionKey);
      try {
        await conn.close();
        this.connections.delete(connectionKey);
        console.log(`Disconnected from device ${deviceId}`);
        return true;
      } catch (error) {
        console.error(`Error disconnecting from device ${deviceId}:`, error.message);
        this.connections.delete(connectionKey);
        return false;
      }
    }
    
    return false;
  }

  // Get or create connection
  async getConnection(device) {
    const connectionKey = `device_${device.id}`;
    
    if (this.connections.has(connectionKey)) {
      const { conn, isConnected } = this.connections.get(connectionKey);
      if (isConnected) {
        return conn;
      }
    }
    
    return await this.connect(device);
  }

  // Get system resources (CPU, RAM, uptime)
  async getSystemResources(device) {
    try {
      const conn = await this.getConnection(device);
      
      const resources = await conn.write('/system/resource/print');
      
      if (resources && resources.length > 0) {
        const resource = resources[0];
        return {
          cpu: resource['cpu-load'] || 0,
          memory: {
            total: parseInt(resource['total-memory']) || 0,
            free: parseInt(resource['free-memory']) || 0,
            used: (parseInt(resource['total-memory']) || 0) - (parseInt(resource['free-memory']) || 0),
          },
          disk: {
            total: parseInt(resource['total-hdd-space']) || 0,
            free: parseInt(resource['free-hdd-space']) || 0,
            used: (parseInt(resource['total-hdd-space']) || 0) - (parseInt(resource['free-hdd-space']) || 0),
          },
          uptime: resource.uptime || '0s',
          version: resource.version || 'Unknown',
          boardName: resource['board-name'] || 'Unknown',
          architecture: resource['architecture-name'] || 'Unknown',
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get system resources:`, error.message);
      throw error;
    }
  }

  // Get interface list with traffic stats
  async getInterfaces(device) {
    try {
      const conn = await this.getConnection(device);
      
      const interfaces = await conn.write('/interface/print', [
        '=stats',
      ]);
      
      return interfaces.map(iface => ({
        id: iface['.id'],
        name: iface.name,
        type: iface.type,
        status: iface.running === 'true' ? 'up' : 'down',
        disabled: iface.disabled === 'true',
        comment: iface.comment || '',
        macAddress: iface['mac-address'] || null,
        mtu: parseInt(iface.mtu) || 1500,
        rxBytes: parseInt(iface['rx-byte']) || 0,
        txBytes: parseInt(iface['tx-byte']) || 0,
        rxPackets: parseInt(iface['rx-packet']) || 0,
        txPackets: parseInt(iface['tx-packet']) || 0,
        rxErrors: parseInt(iface['rx-error']) || 0,
        txErrors: parseInt(iface['tx-error']) || 0,
        rxDrops: parseInt(iface['rx-drop']) || 0,
        txDrops: parseInt(iface['tx-drop']) || 0,
      }));
    } catch (error) {
      console.error(`Failed to get interfaces:`, error.message);
      throw error;
    }
  }

  // Get specific interface traffic
  async getInterfaceTraffic(device, interfaceName) {
    try {
      const conn = await this.getConnection(device);
      
      const result = await conn.write('/interface/monitor-traffic', [
        `=interface=${interfaceName}`,
        '=once=',
      ]);
      
      if (result && result.length > 0) {
        const traffic = result[0];
        return {
          interface: interfaceName,
          rxBps: parseInt(traffic['rx-bits-per-second']) || 0,
          txBps: parseInt(traffic['tx-bits-per-second']) || 0,
          rxPps: parseInt(traffic['rx-packets-per-second']) || 0,
          txPps: parseInt(traffic['tx-packets-per-second']) || 0,
          timestamp: new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get interface traffic:`, error.message);
      throw error;
    }
  }

  // Get IP addresses
  async getIpAddresses(device) {
    try {
      const conn = await this.getConnection(device);
      
      const addresses = await conn.write('/ip/address/print');
      
      return addresses.map(addr => ({
        id: addr['.id'],
        address: addr.address,
        network: addr.network,
        interface: addr.interface,
        disabled: addr.disabled === 'true',
        invalid: addr.invalid === 'true',
        dynamic: addr.dynamic === 'true',
      }));
    } catch (error) {
      console.error(`Failed to get IP addresses:`, error.message);
      throw error;
    }
  }

  // Get DHCP leases (active clients)
  async getDhcpLeases(device) {
    try {
      const conn = await this.getConnection(device);
      
      const leases = await conn.write('/ip/dhcp-server/lease/print', [
        '?status=bound',
      ]);
      
      return leases.map(lease => ({
        id: lease['.id'],
        address: lease.address,
        macAddress: lease['mac-address'],
        hostname: lease['host-name'] || 'Unknown',
        server: lease.server,
        status: lease.status,
        expiresAfter: lease['expires-after'] || null,
        lastSeen: lease['last-seen'] || null,
      }));
    } catch (error) {
      console.error(`Failed to get DHCP leases:`, error.message);
      throw error;
    }
  }

  // Get PPPoE active sessions
  async getPppoeActive(device) {
    try {
      const conn = await this.getConnection(device);
      
      const sessions = await conn.write('/ppp/active/print');
      
      return sessions.map(session => ({
        id: session['.id'],
        name: session.name,
        service: session.service,
        callerIdmacAddress: session['caller-id'],
        address: session.address,
        uptime: session.uptime,
        encoding: session.encoding,
      }));
    } catch (error) {
      console.error(`Failed to get PPPoE sessions:`, error.message);
      throw error;
    }
  }

  // Get wireless clients
  async getWirelessClients(device) {
    try {
      const conn = await this.getConnection(device);
      
      const clients = await conn.write('/interface/wireless/registration-table/print');
      
      return clients.map(client => ({
        interface: client.interface,
        macAddress: client['mac-address'],
        signalStrength: parseInt(client['signal-strength']) || 0,
        signalToNoise: parseInt(client['signal-to-noise']) || 0,
        txRate: client['tx-rate'],
        rxRate: client['rx-rate'],
        uptime: client.uptime,
        txBytes: parseInt(client['tx-bytes']) || 0,
        rxBytes: parseInt(client['rx-bytes']) || 0,
      }));
    } catch (error) {
      // Not all devices have wireless
      console.log(`No wireless interfaces or error:`, error.message);
      return [];
    }
  }

  // Get logs
  async getLogs(device, limit = 50) {
    try {
      const conn = await this.getConnection(device);
      
      const logs = await conn.write('/log/print', [
        `=count=${limit}`,
      ]);
      
      return logs.map(log => ({
        time: log.time,
        topics: log.topics,
        message: log.message,
      }));
    } catch (error) {
      console.error(`Failed to get logs:`, error.message);
      throw error;
    }
  }

  // Execute custom command
  async executeCommand(device, command, params = []) {
    try {
      const conn = await this.getConnection(device);
      
      console.log(`Executing command: ${command}`, params);
      const result = await conn.write(command, params);
      
      return {
        success: true,
        data: result,
        command,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error(`Failed to execute command:`, error.message);
      return {
        success: false,
        error: error.message,
        command,
        executedAt: new Date(),
      };
    }
  }

  // Test connection
  async testConnection(ipAddress, port, username, password) {
    try {
      const conn = new RouterOSAPI({
        host: ipAddress,
        port: port || 8728,
        user: username,
        password: password,
        timeout: 5000,
      });

      await conn.connect();
      
      // Get identity to verify connection
      const identity = await conn.write('/system/identity/print');
      
      await conn.close();
      
      return {
        success: true,
        message: 'Connection successful',
        identity: identity[0]?.name || 'MikroTik',
        version: identity[0]?.version || 'Unknown',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Cleanup all connections
  async disconnectAll() {
    console.log(`Disconnecting all MikroTik connections...`);
    const promises = [];
    
    for (const [key, { conn }] of this.connections.entries()) {
      promises.push(
        conn.close().catch(err => console.error(`Error closing ${key}:`, err.message))
      );
    }
    
    await Promise.all(promises);
    this.connections.clear();
    console.log(`All connections closed`);
  }

  // Get connection status
  getConnectionStatus(deviceId) {
    const connectionKey = `device_${deviceId}`;
    
    if (this.connections.has(connectionKey)) {
      const { isConnected, connectedAt } = this.connections.get(connectionKey);
      return {
        connected: isConnected,
        connectedAt,
        uptime: Date.now() - connectedAt.getTime(),
      };
    }
    
    return {
      connected: false,
      connectedAt: null,
      uptime: 0,
    };
  }
}

// Export singleton
module.exports = new MikrotikService();
