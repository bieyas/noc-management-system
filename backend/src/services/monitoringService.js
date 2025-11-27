const ping = require('ping');
const { Device, NetworkLog, Alert, sequelize } = require('../models');
const socketService = require('./socketService');
const mikrotikService = require('./mikrotikService');

class MonitoringService {
  constructor() {
    this.isRunning = false;
  }

  // Check device connectivity (ping for regular devices, API for MikroTik)
  async checkDevice(device) {
    try {
      // For MikroTik devices with API config, use API check
      if (device.type === 'mikrotik' && device.apiConfig) {
        return await this.checkMikrotikDevice(device);
      }
      
      // For other devices, use ping
      return await this.pingDevice(device);
    } catch (error) {
      console.error(`Error checking device ${device.name}:`, error.message);
      return { alive: false, error: error.message };
    }
  }

  // Check MikroTik device via API
  async checkMikrotikDevice(device) {
    try {
      // Try to get system resources (lightweight check)
      const resources = await mikrotikService.getSystemResources(device);
      
      const logData = {
        deviceId: device.id,
        logType: 'ping',
        status: 'success',
        responseTime: null,
        message: 'MikroTik API responding'
      };

      await NetworkLog.create(logData);

      // Update device status
      const newStatus = 'online';
      const previousStatus = device.status;

      if (newStatus !== previousStatus) {
        await this.updateDeviceStatus(device, newStatus, previousStatus);
      } else {
        // Just update lastSeen
        device.lastSeen = new Date();
        await device.save();
      }

      return { alive: true, mikrotik: true };
    } catch (error) {
      // If API check fails, fallback to ping
      return await this.pingDevice(device);
    }
  }

  // Ping a single device
  async pingDevice(device) {
    try {
      const result = await ping.promise.probe(device.ipAddress, {
        timeout: 10,
        extra: ['-c', '3']
      });

      const logData = {
        deviceId: device.id,
        logType: 'ping',
        status: result.alive ? 'success' : 'failed',
        responseTime: result.alive ? parseFloat(result.time) : null,
        message: result.alive ? 'Device is online' : 'Device is offline'
      };

      // Save log
      await NetworkLog.create(logData);

      // Update device status
      const newStatus = result.alive ? 'online' : 'offline';
      const previousStatus = device.status;

      if (newStatus !== previousStatus) {
        await this.updateDeviceStatus(device, newStatus, previousStatus);
      } else if (result.alive) {
        device.lastSeen = new Date();
        await device.save();
      }

      return result;
    } catch (error) {
      console.error(`Error pinging device ${device.name}:`, error.message);
      return { alive: false, error: error.message };
    }
  }

  // Update device status and create alerts
  async updateDeviceStatus(device, newStatus, previousStatus) {
    try {
      device.status = newStatus;
      device.lastSeen = newStatus === 'online' ? new Date() : device.lastSeen;
      await device.save();

      // Emit device status update via WebSocket
      socketService.emitDeviceStatus(device.id, newStatus, {
        deviceName: device.name,
        ipAddress: device.ipAddress,
        lastSeen: device.lastSeen
      });

        // Create alert if device went offline
        if (newStatus === 'offline') {
          const alert = await Alert.create({
            deviceId: device.id,
            severity: 'high',
            type: 'device-down',
            title: `Device ${device.name} is offline`,
            description: `Device ${device.name} (${device.ipAddress}) is not responding to ping requests.`,
            status: 'active'
          });

          // Emit alert via WebSocket
          socketService.emitNewAlert(alert.toJSON());
        } else {
          // Create alert when device comes back online
          const alert = await Alert.create({
            deviceId: device.id,
            severity: 'info',
            type: 'device-up',
            title: `Device ${device.name} is back online`,
            description: `Device ${device.name} (${device.ipAddress}) is now responding.`,
            status: 'active'
          });

          // Emit alert via WebSocket
          socketService.emitNewAlert(alert.toJSON());
        }
      }

      return result;
    } catch (error) {
      console.error(`Error pinging device ${device.name}:`, error.message);
      return { alive: false, error: error.message };
    }
  }

  // Monitor all devices
  async monitorAllDevices() {
    try {
      // Query devices where monitoring.enabled = true in JSON field
      const devices = await Device.scope('withCredentials').findAll({
        where: sequelize.literal("JSON_EXTRACT(monitoring, '$.enabled') = true")
      });

      console.log(`Monitoring ${devices.length} devices...`);

      for (const device of devices) {
        await this.checkDevice(device);
      }

      console.log('Device monitoring completed');
    } catch (error) {
      console.error('Error in monitoring service:', error.message);
    }
  }

  // Check for high latency
  async checkLatency(device, threshold = 100) {
    try {
      const result = await ping.promise.probe(device.ipAddress, {
        timeout: 10,
        extra: ['-c', '5']
      });

      if (result.alive && parseFloat(result.time) > threshold) {
        await Alert.create({
          deviceId: device.id,
          severity: 'medium',
          type: 'high-latency',
          title: `High latency detected on ${device.name}`,
          description: `Device ${device.name} has latency of ${result.time}ms (threshold: ${threshold}ms)`,
          status: 'active',
          metadata: {
            latency: result.time,
            threshold: threshold
          }
        });
      }

      return result;
    } catch (error) {
      console.error(`Error checking latency for ${device.name}:`, error.message);
      return null;
    }
  }

  // Start monitoring service
  start(interval = 60000) {
    if (this.isRunning) {
      console.log('Monitoring service is already running');
      return;
    }

    console.log(`Starting monitoring service with ${interval}ms interval...`);
    this.isRunning = true;

    // Run immediately
    this.monitorAllDevices();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.monitorAllDevices();
    }, interval);
  }

  // Stop monitoring service
  stop() {
    if (!this.isRunning) {
      console.log('Monitoring service is not running');
      return;
    }

    console.log('Stopping monitoring service...');
    clearInterval(this.intervalId);
    this.isRunning = false;
  }
}

module.exports = new MonitoringService();
