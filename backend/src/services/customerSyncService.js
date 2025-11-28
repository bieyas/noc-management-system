const { Customer } = require('../models');
const mikrotikService = require('./mikrotikService');

class CustomerSyncService {
  /**
   * Sync customer connection status from MikroTik active connections
   * @param {Object} device - MikroTik device object
   */
  async syncCustomerStatus(device) {
    try {
      // Get active PPPoE connections
      const pppoeUsers = await mikrotikService.getPPPoEUsers(device);
      
      // Get active Hotspot users
      const hotspotUsers = await mikrotikService.getHotspotActiveUsers(device);
      
      // Combine both lists
      const activeConnections = new Map();
      
      // Process PPPoE users
      if (pppoeUsers && Array.isArray(pppoeUsers)) {
        pppoeUsers.forEach(user => {
          if (user.name) {
            activeConnections.set(user.name, {
              username: user.name,
              ipAddress: user.address,
              macAddress: user['caller-id'],
              serviceType: 'pppoe',
              uptime: user.uptime,
              online: true
            });
          }
        });
      }
      
      // Process Hotspot users
      if (hotspotUsers && Array.isArray(hotspotUsers)) {
        hotspotUsers.forEach(user => {
          if (user.user) {
            activeConnections.set(user.user, {
              username: user.user,
              ipAddress: user.address,
              macAddress: user['mac-address'],
              serviceType: 'hotspot',
              uptime: user.uptime,
              online: true
            });
          }
        });
      }
      
      // Get all customers with username
      const customers = await Customer.findAll({
        where: {
          username: { $ne: null }
        }
      });
      
      // Update each customer's connection status
      const updates = [];
      const now = new Date();
      
      for (const customer of customers) {
        if (!customer.username) continue;
        
        const connection = activeConnections.get(customer.username);
        
        if (connection) {
          // Customer is online
          if (customer.connectionStatus !== 'online') {
            updates.push({
              id: customer.id,
              from: customer.connectionStatus,
              to: 'online'
            });
          }
          
          await customer.update({
            connectionStatus: 'online',
            lastOnline: now,
            ipAddress: connection.ipAddress,
            macAddress: connection.macAddress || customer.macAddress
          });
        } else {
          // Customer is offline
          if (customer.connectionStatus !== 'offline') {
            updates.push({
              id: customer.id,
              from: customer.connectionStatus,
              to: 'offline'
            });
          }
          
          await customer.update({
            connectionStatus: 'offline'
          });
        }
      }
      
      return {
        success: true,
        totalCustomers: customers.length,
        onlineCount: activeConnections.size,
        offlineCount: customers.length - activeConnections.size,
        updates: updates.length,
        details: updates
      };
      
    } catch (error) {
      console.error('Error syncing customer status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sync all customers from all MikroTik devices
   */
  async syncAllCustomers() {
    try {
      const { Device } = require('../models');
      
      // Get all MikroTik devices
      const devices = await Device.scope('withCredentials').findAll({
        where: {
          type: 'mikrotik',
          status: 'online'
        }
      });
      
      const results = [];
      
      for (const device of devices) {
        const result = await this.syncCustomerStatus(device);
        results.push({
          deviceId: device.id,
          deviceName: device.name,
          ...result
        });
      }
      
      return {
        success: true,
        devicesProcessed: devices.length,
        results
      };
      
    } catch (error) {
      console.error('Error syncing all customers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get detailed customer info including device details from MikroTik
   * @param {string} customerId - Customer ID
   */
  async getCustomerDetails(customerId) {
    try {
      const customer = await Customer.findOne({
        where: { customerId }
      });
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // If customer has username, get real-time data from MikroTik
      if (customer.username) {
        const { Device } = require('../models');
        
        const mikrotikDevices = await Device.scope('withCredentials').findAll({
          where: {
            type: 'mikrotik',
            status: 'online'
          }
        });
        
        // Try to find customer in each MikroTik
        for (const device of mikrotikDevices) {
          try {
            // Check PPPoE
            const pppoeUsers = await mikrotikService.getPPPoEUsers(device);
            const pppoeUser = pppoeUsers?.find(u => u.name === customer.username);
            
            if (pppoeUser) {
              return {
                ...customer.toJSON(),
                realTimeData: {
                  connectionType: 'pppoe',
                  ipAddress: pppoeUser.address,
                  macAddress: pppoeUser['caller-id'],
                  uptime: pppoeUser.uptime,
                  rxBytes: pppoeUser['rx-byte'],
                  txBytes: pppoeUser['tx-byte'],
                  mikrotikDevice: {
                    id: device.id,
                    name: device.name,
                    ipAddress: device.ipAddress
                  }
                }
              };
            }
            
            // Check Hotspot
            const hotspotUsers = await mikrotikService.getHotspotActiveUsers(device);
            const hotspotUser = hotspotUsers?.find(u => u.user === customer.username);
            
            if (hotspotUser) {
              return {
                ...customer.toJSON(),
                realTimeData: {
                  connectionType: 'hotspot',
                  ipAddress: hotspotUser.address,
                  macAddress: hotspotUser['mac-address'],
                  uptime: hotspotUser.uptime,
                  rxBytes: hotspotUser['bytes-in'],
                  txBytes: hotspotUser['bytes-out'],
                  mikrotikDevice: {
                    id: device.id,
                    name: device.name,
                    ipAddress: device.ipAddress
                  }
                }
              };
            }
          } catch (err) {
            console.error(`Error checking device ${device.name}:`, err.message);
          }
        }
      }
      
      // Return customer data without real-time info
      return customer.toJSON();
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Start periodic sync (runs every 2 minutes)
   */
  startPeriodicSync() {
    const SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes
    
    console.log('Starting customer sync service with 2-minute interval...');
    
    // Run immediately
    this.syncAllCustomers();
    
    // Then run periodically
    this.syncInterval = setInterval(() => {
      this.syncAllCustomers();
    }, SYNC_INTERVAL);
  }
  
  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('Customer sync service stopped');
    }
  }
}

module.exports = new CustomerSyncService();
