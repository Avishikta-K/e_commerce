// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- Basic Info ---
  name: {
    type: String,
    default: 'Fashion Enthusiast'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    default: "" 
  },
  
  // --- Profile Fields ---
  // Stores "YYYY-MM-DD" or "DD/MM/YYYY" based on your frontend input
  dob: {
    type: String, 
    default: ""
  },
  bloodGroup: {
    type: String,
    default: ""
  },
  address: {
    type: String, 
    default: ""
  },
  
  // --- Avatar Logic ---
  // This single field handles BOTH cases:
  // 1. URL: "https://example.com/my-pic.jpg"
  // 2. Device Upload: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." (Frontend converts image to this string)
  avatar: {
    type: String, 
    default: ""
  },

  // --- System Fields ---
  createdAt: {
    type: Date,
    default: Date.now
  },

  // --- Login Tracking ---
  loginHistory: [{
    action: { type: String, enum: ['LOGIN', 'LOGOUT'] },
    timestamp: { type: Date, default: Date.now },
    token: String 
  }]
});

module.exports = mongoose.model('User', userSchema);