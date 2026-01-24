const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importing the model you just created

// Temporary storage for OTPs (In production, use Redis or database)
const otpStore = {};

// Use a long secret key (Set this in your Render Environment Variables later)
const SECRET_KEY = process.env.JWT_SECRET || "your_super_long_secret_key_fashion_store_2026";

// 1. LOGIN ROUTE: Receives Email -> Generates OTP
router.post('/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email] = otp;

    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    // In a real app, you would send an email here.
    // For now, we send it back in the response so your frontend demo works.
    res.json({ success: true, message: "OTP sent", code: otp });
});

// 2. VERIFY ROUTE: Receives OTP -> Returns Token
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        // Find user or create a new one if they don't exist
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
            await user.save();
        }

        // GENERATE THE 200+ CHAR TOKEN
        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: '7d' }
        );

        delete otpStore[email]; // Clear the used OTP

        res.json({ 
            success: true, 
            token: token, 
            user: { id: user._id, email: user.email } 
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid OTP" });
    }
});

module.exports = router;