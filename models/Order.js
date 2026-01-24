const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 1. LINK TO USER MODEL (Account Holder)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This allows .populate('user') to work
    required: true 
  },
  // 2. SHIPPING DETAILS (Entered at checkout)
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true }
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      image: String,
      color: { type: String },
      size: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);