const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyPayment,
  handleWebhook,
  getPurchasedCourses,
  paymentSuccess
} = require('../controller/paymentController');

// Stripe webhook route - no auth required and needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify/:sessionId', verifyPayment);
router.post('/purchased-courses', getPurchasedCourses);
router.post('/success', paymentSuccess);

module.exports = router;