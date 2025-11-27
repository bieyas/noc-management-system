const express = require('express');
const router = express.Router();
const socketService = require('../services/socketService');

// Test WebSocket events
router.post('/emit-test', (req, res) => {
  try {
    const { event, data } = req.body;

    switch (event) {
      case 'device-status':
        socketService.emitDeviceStatus(data.deviceId, data.status, data);
        break;
      case 'alert':
        socketService.emitNewAlert(data);
        break;
      case 'bandwidth':
        socketService.emitBandwidthUpdate(data);
        break;
      case 'payment':
        socketService.emitPaymentUpdate(data.paymentId, data.status, data);
        break;
      case 'stats':
        socketService.emitStatsUpdate(data);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown event type'
        });
    }

    res.status(200).json({
      success: true,
      message: `Event ${event} emitted successfully`,
      connectedClients: socketService.getConnectedCount()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get WebSocket status
router.get('/ws-status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      connectedClients: socketService.getConnectedCount(),
      isInitialized: socketService.io !== null
    }
  });
});

module.exports = router;
