const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Temporary storage for OTPs
const otpStore = {};
const SECRET_KEY = process.env.JWT_SECRET || "your_super_long_secret_key_fashion_store_2026";

// 1. LOGIN ROUTE (Generate OTP)
router.post('/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email] = otp;

    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent", code: otp });
});

// 2. VERIFY ROUTE (Login & Log History)
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

        // --- NEW: LOG LOGIN EVENT ---
        user.loginHistory.push({
            action: 'LOGIN',
            token: token.substring(0, 15) + '...' // Store partial token for tracking
        });
        await user.save();

        delete otpStore[email];

        res.json({ 
            success: true, 
            token: token, 
            user: { id: user._id, email: user.email } 
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid OTP" });
    }
});

// 3. LOGOUT ROUTE (Log History)
router.post('/logout', async (req, res) => {
    const { email } = req.body;
    try {
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                user.loginHistory.push({ action: 'LOGOUT' });
                await user.save();
            }
        }
        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: "Logout error" });
    }
});

// 4. ADMIN: GET USER ACTIVITY
router.get('/users/activity', async (req, res) => {
    try {
        // Fetch all users and their history
        const users = await User.find({}, 'email name loginHistory').sort({ 'loginHistory.timestamp': -1 });
        
        // Flatten into a single list of events
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