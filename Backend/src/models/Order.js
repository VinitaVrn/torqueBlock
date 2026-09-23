const mongoose = require('mongoose');

const orderItemSnapshotSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const orderAddressSchema = new mongoose.Schema({
  name: { type: String },
  companyName: { type: String },
  phone: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: {
    type: [orderItemSnapshotSchema],
    validate: [val => val.length > 0, 'Order must contain at least one item']
  },
  shippingAddress: {
    type: orderAddressSchema,
    required: true
  },
  billingAddress: {
    type: orderAddressSchema,
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
    index: true
  },
  orderStatus: {
    type: String,
    enum: ['Pending Payment', 'Paid/Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending Payment',
    index: true
  },
  gatewayOrderId: {
    type: String,
    index: true
  },
  gatewayPaymentId: {
    type: String
  },
  paymentFailureReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
