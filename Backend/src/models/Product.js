const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    index: true
  },
  model: {
    type: String,
    required: [true, 'Tyre model is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  size: {
    type: String,
    required: [true, 'Tyre size is required'],
    trim: true,
    index: true
  },
  rimSize: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Supersport', 'Sport Touring', 'Adventure / Dual Sport', 'Cruiser / Custom', 'Track / Racing', 'Urban / Commuter'],
    default: 'Sport Touring',
    index: true
  },
  specifications: {
    position: {
      type: String,
      enum: ['Front', 'Rear', 'Set'],
      default: 'Front'
    },
    speedRating: {
      type: String,
      default: 'W (270 km/h)'
    },
    loadIndex: {
      type: String,
      default: '58 (236 kg)'
    },
    construction: {
      type: String,
      default: 'Radial - Tubeless'
    }
  },
  b2bPrice: {
    type: Number,
    required: [true, 'B2B price is required'],
    min: [0, 'Price must be positive']
  },
  mrp: {
    type: Number,
    min: [0, 'MRP must be positive']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

productSchema.index({ brand: 'text', model: 'text', size: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
