const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/auth'); // Use your new Supabase auth middleware

// ==========================================
// @route   GET /api/users/profile
// @desc    Get user profile (Called by OTP.jsx to sync login)
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
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
        avatar: user.avatar,
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
// @desc    Update user profile
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      user.dob = req.body.dob || user.dob;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.address = req.body.address || user.address;
      
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      // ⚠️ REMOVED EMAIL UPDATE LOGIC
      // Email is now managed by Supabase Authentication.
      // Changing it here in MongoDB would break the link with the Supabase User ID.

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