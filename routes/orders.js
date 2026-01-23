const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ... (Existing POST and GET routes remain unchanged) ...

// @route   POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;
    const newOrder = new Order({
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
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; 
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW ROUTE: DELETE ORDER ---
// @route   DELETE /api/orders/:id
// @desc    Permanently delete an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;