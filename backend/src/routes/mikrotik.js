const express = require('express');
const router = express.Router();
const mikrotikService = require('../services/mikrotikService');
const { Device } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// Test MikroTik connection (without saving)
router.post('/test-connection', async (req, res) => {
  try {
    const { ipAddress, port, username, password } = req.body;

    if (!ipAddress || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'IP address, username, and password are required',
      });
    }

    const result = await mikrotikService.testConnection(
      ipAddress,
      port || 8728,
      username,
      password
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Connect to device
router.post('/:id/connect', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    if (device.type !== 'mikrotik') {
      return res.status(400).json({
        success: false,
        message: 'Device is not a MikroTik device',
      });
    }

    await mikrotikService.connect(device);

    res.status(200).json({
      success: true,
      message: `Connected to ${device.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Disconnect from device
router.post('/:id/disconnect', async (req, res) => {
  try {
    const result = await mikrotikService.disconnect(parseInt(req.params.id));

    res.status(200).json({
      success: true,
      message: 'Device disconnected',
      disconnected: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get connection status
router.get('/:id/connection-status', async (req, res) => {
  try {
    const status = mikrotikService.getConnectionStatus(parseInt(req.params.id));

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get system resources
router.get('/:id/resources', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const resources = await mikrotikService.getSystemResources(device);

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get interfaces
router.get('/:id/interfaces', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const interfaces = await mikrotikService.getInterfaces(device);

    res.status(200).json({
      success: true,
      data: interfaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get interface traffic
router.get('/:id/interfaces/:name/traffic', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const traffic = await mikrotikService.getInterfaceTraffic(device, req.params.name);

    res.status(200).json({
      success: true,
      data: traffic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get IP addresses
router.get('/:id/ip-addresses', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const addresses = await mikrotikService.getIpAddresses(device);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get DHCP leases
router.get('/:id/dhcp-leases', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const leases = await mikrotikService.getDhcpLeases(device);

    res.status(200).json({
      success: true,
      data: leases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get PPPoE active sessions
router.get('/:id/pppoe-sessions', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const sessions = await mikrotikService.getPppoeActive(device);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get wireless clients
router.get('/:id/wireless-clients', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const clients = await mikrotikService.getWirelessClients(device);

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get device logs
router.get('/:id/logs', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const logs = await mikrotikService.getLogs(device, limit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Execute command (admin only)
router.post('/:id/command', authorize('admin'), async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    const { command, params } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required',
      });
    }

    const result = await mikrotikService.executeCommand(device, command, params || []);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
