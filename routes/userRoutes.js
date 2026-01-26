const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- THE FIX IS HERE ---
// Removed curly braces { } because your auth.js exports the function directly
const protect = require('../middleware/auth'); 

// ==========================================
// @route   GET /api/users/profile
// @desc    Get current user's profile details
// @access  Private
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
    // Find user by ID attached to request by 'protect' middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        bloodGroup: user.bloodGroup,
        address: user.address,
        avatar: user.avatar, // Returns URL or Base64 string
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// @route   PUT /api/users/profile
// @desc    Update user profile (Avatar, Info, Address)
// @access  Private
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Update Basic Fields
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      user.dob = req.body.dob || user.dob;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.address = req.body.address || user.address;

      // 2. Update Avatar 
      // Accepts direct URL string OR Base64 string from frontend file reader
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      // 3. Update Email (with Uniqueness Check)
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use by another account' });
        }
        user.email = req.body.email;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        dob: updatedUser.dob,
        bloodGroup: updatedUser.bloodGroup,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        token: req.token // Optional: If you need to refresh token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;