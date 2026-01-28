const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const protect = require('../middleware/auth'); // Use Supabase Middleware

// ==========================================
// 1. LOGIN SUCCESS (Sync & Log History)
// @desc    Called by Frontend AFTER Supabase returns success
// ==========================================
router.post('/login-success', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Record the Login Event
        user.loginHistory.push({
            action: 'LOGIN',
            token: req.headers.authorization.split(' ')[1] // Log the Supabase token
        });
        
        await user.save();

        // Return the profile data (Just like /profile did)
        res.json({ 
            success: true, 
            user: { 
                _id: user._id, 
                email: user.email, 
                name: user.name, 
                avatar: user.avatar 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Login Sync Error" });
    }
});

// ==========================================
// 2. LOGOUT ROUTE
// ==========================================
router.post('/logout', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.loginHistory.push({ action: 'LOGOUT' });
            await user.save();
        }
        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: "Logout error" });
    }
});

// ==========================================
// 3. ADMIN: GET USER ACTIVITY
// ==========================================
router.get('/users/activity', async (req, res) => {
    try {
        // Fetch all users and their history
        const users = await User.find({}, 'email name loginHistory').sort({ 'loginHistory.timestamp': -1 });
        
        let activityLog = [];
        users.forEach(user => {
            if (user.loginHistory) {
                user.loginHistory.forEach(log => {
                    activityLog.push({
                        email: user.email,
                        name: user.name,
                        action: log.action,
                        time: log.timestamp,
                        token: log.token
                    });
                });
            }
        });

        // Sort by newest time
        activityLog.sort((a, b) => new Date(b.time) - new Date(a.time));
        res.json(activityLog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;