const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth'); // Import middleware

// --- 1. CREATE ORDER (User Only) ---
// @route   POST /api/orders
// @desc    Create a new order (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;
    
    const newOrder = new Order({
      user: req.user.id, // Link order to the logged-in user
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

// --- 2. GET MY ORDERS (User Only) ---
// @route   GET /api/orders
// @desc    Get logged-in user's orders history
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// --- ADMIN ROUTES (Used by AdminPanel) ---
// ==========================================

// --- 3. GET ALL ORDERS (Admin) ---
// @route   GET /api/orders/all
// @desc    Get ALL orders for Admin Panel (Populates User Info)
router.get('/all', async (req, res) => {
  try {
    // .populate('user') fills in the Name and Email from the User ID
    const orders = await Order.find()
      .populate('user', 'name email') 
      .sort({ date: -1 });
      
    res.json(orders);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 4. UPDATE ORDER STATUS (Admin) ---
// @route   PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();
    
    // Return the updated order with populated user data so UI doesn't break
    const updatedOrder = await Order.findById(req.params.id).populate('user', 'name email');
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. DELETE ORDER (Admin) ---
// @route   DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;