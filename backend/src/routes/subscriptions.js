const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .get(getSubscription)
  .put(updateSubscription)
  .delete(authorize('admin'), deleteSubscription);

router.put('/:id/status', updateSubscriptionStatus);

module.exports = router;
