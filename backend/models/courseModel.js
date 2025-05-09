const mongoose = require('mongoose');
require('./moduleModel');
require('./quizModel');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'developer'],
    required: [true, 'role is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required']
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  isPremium: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 9.99
  },
  stripeProductId: {
    type: String
  },
  stripePriceId: {
    type: String
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;