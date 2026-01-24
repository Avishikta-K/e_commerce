const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth'); // Import middleware

// @route   POST /api/orders
// @desc    Create a new order (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;
    
    const newOrder = new Order({
      user: req.user.id, // <--- Link order to logged-in user
      customer,
      items,
      totalAmount,
      status: 'Processing',
      date: new Date()
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order Create Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/orders
// @desc    Get logged-in user's orders
router.get('/', auth, async (req, res) => {
  try {
    // <--- Filter: Find orders where 'user' matches the token ID
    const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ... (PUT and DELETE routes remain mostly the same, maybe add auth check) ...

module.exports = router;