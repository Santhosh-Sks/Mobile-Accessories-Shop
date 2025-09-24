const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['cases', 'chargers', 'headphones', 'cables', 'screen-protectors', 'power-banks', 'speakers', 'other']
  },
  brand: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=Product+Image'
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  specifications: {
    compatibility: String,
    color: String,
    material: String,
    warranty: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  category: 'text'
});

module.exports = mongoose.model('Product', productSchema);
