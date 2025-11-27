const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  processPayment,
  deletePayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getPaymentStats);

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPayment)
  .put(updatePayment)
  .delete(authorize('admin'), deletePayment);

router.put('/:id/process', processPayment);

module.exports = router;
