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
  avatar: {
    type: String, 
    default: ""
  },

  // --- System Fields ---
  createdAt: {
    type: Date,
    default: Date.now
  },

  // --- Login Tracking (FIXED) ---
  loginHistory: {
    type: [{
      action: { type: String, enum: ['LOGIN', 'LOGOUT'] },
      timestamp: { type: Date, default: Date.now },
      token: String 
    }],
    default: [] // <--- CRITICAL FIX: Ensures this is always an array
  }
});

module.exports = mongoose.model('User', userSchema);