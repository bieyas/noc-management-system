const express = require('express');
const router = express.Router();
const {
  getBandwidthUsage,
  getSingleBandwidthUsage,
  createBandwidthUsage,
  getCustomerBandwidthSummary,
  getTopConsumers
} = require('../controllers/bandwidthController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getBandwidthUsage)
  .post(createBandwidthUsage);

router.get('/top', getTopConsumers);
router.get('/customer/:customerId/summary', getCustomerBandwidthSummary);
router.get('/:id', getSingleBandwidthUsage);

module.exports = router;
