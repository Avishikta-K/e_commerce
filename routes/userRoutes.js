const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Remove curly braces because auth.js exports function directly
const protect = require('../middleware/auth'); 

// ==========================================
// @route   GET /api/users/profile
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user._id now works because we fixed the signing in authRoutes
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

      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
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
        // Removed broken 'token' field
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