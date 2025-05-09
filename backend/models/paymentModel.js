const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeSessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user doesn't purchase the same course twice

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;