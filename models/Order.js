const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
      // --- NEW FIELDS ---
      color: { type: String }, // Stores Hex Code or Name
      size: { type: String }   // Stores S, M, L, etc.
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Processing' }, // Processing, Shipped, Delivered
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);