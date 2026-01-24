const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    default: 'Fashion Enthusiast'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // --- NEW: Track Login Activity ---
  loginHistory: [{
    action: { type: String, enum: ['LOGIN', 'LOGOUT'] },
    timestamp: { type: Date, default: Date.now },
    token: String // Optional: Store the token (truncated) for reference
  }]
});

module.exports = mongoose.model('User', userSchema);