const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  // New fields for group messages
  groupId: {
    type: String,
    required: false
  },
  senderName: {
    type: String,
    required: false
  }
});

// Add indexes for faster lookup
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });
messageSchema.index({ groupId: 1 }, { sparse: true });

module.exports = mongoose.model('Message', messageSchema);