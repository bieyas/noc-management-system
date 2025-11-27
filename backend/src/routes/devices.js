const express = require('express');
const router = express.Router();
const {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceStats,
  getDeviceLogs
} = require('../controllers/deviceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getDeviceStats);

router.route('/')
  .get(getDevices)
  .post(createDevice);

router.route('/:id')
  .get(getDevice)
  .put(updateDevice)
  .delete(authorize('admin'), deleteDevice);

router.get('/:id/logs', getDeviceLogs);

module.exports = router;
