const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
  verifySession,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Stripe webhook is mounted separately in index.js to use express.raw

router.post('/create-checkout', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getSubscriptionStatus);
router.post('/verify-session', protect, verifySession);

module.exports = router;
