const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerStats,
  syncCustomerStatus
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id)
router.get('/stats', getCustomerStats);

// Sync route
router.post('/sync', syncCustomerStatus);
router.post('/sync/:deviceId', syncCustomerStatus);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

router.put('/:id/status', updateCustomerStatus);

module.exports = router;
