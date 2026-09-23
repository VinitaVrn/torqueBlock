const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  gateway: {
    type: String,
    default: 'Razorpay'
  },
  gatewayOrderId: {
    type: String,
    required: true,
    index: true
  },
  gatewayPaymentId: {
    type: String
  },
  signature: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed'],
    default: 'created',
    index: true
  },
  errorDetails: {
    code: String,
    description: String,
    source: String,
    step: String,
    reason: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
