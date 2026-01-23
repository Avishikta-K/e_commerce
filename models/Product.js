const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  // --- ADDED QUANTITY HERE ---
  quantity: {
    type: Number,
    required: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Men', 'Women', 'Accessories', 'Kids'] 
  },
  image: { 
    type: String, 
    required: true 
  },
  sizes: [{ type: String }],    
  colors: [{ type: String }],   
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);