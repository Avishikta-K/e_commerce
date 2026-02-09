const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Temporary storage for OTPs
const otpStore = {};
const SECRET_KEY = process.env.JWT_SECRET || "your_super_long_secret_key_fashion_store_2026";

// ==========================================
// 1. LOGIN ROUTE (Generate OTP)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        // Force lowercase to ensure same account is found every time
        const email = req.body.email ? req.body.email.toLowerCase() : null;
        
        if (!email) return res.status(400).json({ message: "Email required" });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = otp;

        console.log(`[AUTH] OTP for ${email}: ${otp}`);
        res.json({ success: true, message: "OTP sent", code: otp });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// ==========================================
// 2. VERIFY ROUTE (Login & Log History)
// ==========================================
router.post('/verify-otp', async (req, res) => {
    try {
        // Force lowercase
        const email = req.body.email ? req.body.email.toLowerCase() : null;
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP required" });
        }

        console.log(`[AUTH] Verifying: ${email} with OTP: ${otp}`);

        if (otpStore[email] === otp) {
            let user = await User.findOne({ email });
            
            // If user doesn't exist, create them
            if (!user) {
                console.log(`[AUTH] Creating new user: ${email}`);
                user = new User({ email });
            }

            // Create token
            const token = jwt.sign(
                { _id: user._id, email: user.email }, 
                SECRET_KEY, 
                { expiresIn: '30d' }
            );

            // --- CRITICAL FIX FOR 500 ERROR ---
            // If loginHistory is undefined (old account) or null, make it an empty array
            if (!user.loginHistory || !Array.isArray(user.loginHistory)) {
                user.loginHistory = [];
            }

            // Now safely push
            user.loginHistory.push({
                action: 'LOGIN',
                timestamp: new Date(),
                token: token
            });

            await user.save();

            // Clear the used OTP
            delete otpStore[email];

            // Return FULL profile data
            res.json({ 
                success: true, 
                token: token, 
                user: { 
                    _id: user._id, 
                    email: user.email, 
                    name: user.name,
                    avatar: user.avatar || "",
                    mobile: user.mobile || "",      
                    dob: user.dob || "",            
                    bloodGroup: user.bloodGroup || "", 
                    address: user.address || ""     
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("❌ VERIFY OTP SERVER ERROR:", error);
        
        // Handle "Duplicate Key" error (Race condition)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "User conflict. Please try again." });
        }

        res.status(500).json({ success: false, message: "Server error verifying OTP", error: error.message });
    }
});

// ==========================================
// 3. LOGOUT ROUTE
// ==========================================
router.post('/logout', async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : null;
    try {
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                // Safety check before push
                if (!Array.isArray(user.loginHistory)) {
                    user.loginHistory = [];
                }
                
                user.loginHistory.push({ action: 'LOGOUT', timestamp: new Date() });
                await user.save();
            }
        }
        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).json({ message: "Logout error" });
    }
});

// ==========================================
// 4. ADMIN: GET USER ACTIVITY
// ==========================================
router.get('/users/activity', async (req, res) => {
    try {
        const users = await User.find({}, 'email name loginHistory').sort({ 'loginHistory.timestamp': -1 });
        
        let activityLog = [];
        users.forEach(user => {
            if (user.loginHistory && Array.isArray(user.loginHistory)) {
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

        // Sort by most recent time
        activityLog.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        res.json(activityLog);
    } catch (err) {
        console.error("Activity Log Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;