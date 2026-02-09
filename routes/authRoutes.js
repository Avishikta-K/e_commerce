const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const otpStore = {};
const SECRET_KEY = process.env.JWT_SECRET || "local_dev_secret_key_123";

// 1. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase() : null;
        if (!email) return res.status(400).json({ message: "Email required" });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = otp;

        console.log(`[LOCAL AUTH] OTP for ${email}: ${otp}`);
        res.json({ success: true, message: "OTP sent", code: otp });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 2. VERIFY ROUTE
router.post('/verify-otp', async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase() : null;
        const { otp } = req.body;

        if (!email || !otp) return res.status(400).json({ success: false, message: "Missing fields" });

        if (otpStore[email] === otp) {
            let user = await User.findOne({ email });
            
            if (!user) {
                console.log(`[LOCAL AUTH] Creating new user: ${email}`);
                user = new User({ email });
            }

            const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '30d' });

            if (!Array.isArray(user.loginHistory)) user.loginHistory = [];
            
            user.loginHistory.push({
                action: 'LOGIN',
                timestamp: new Date(),
                token: token
            });

            await user.save(); // This writes to users.json
            delete otpStore[email];

            res.json({ 
                success: true, 
                token: token, 
                user: { 
                    _id: user._id, 
                    email: user.email, 
                    name: user.name,
                    avatar: user.avatar,
                    mobile: user.mobile,
                    address: user.address 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 3. LOGOUT ROUTE
router.post('/logout', async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase() : null;
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                if (!Array.isArray(user.loginHistory)) user.loginHistory = [];
                user.loginHistory.push({ action: 'LOGOUT', timestamp: new Date() });
                await user.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Logout error" });
    }
});

module.exports = router;