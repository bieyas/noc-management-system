const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlert,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
  getAlertStats
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getAlertStats);

router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.route('/:id')
  .get(getAlert)
  .delete(authorize('admin'), deleteAlert);

router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
