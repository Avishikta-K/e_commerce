require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders'); 
const authRoutes = require('./routes/authRoutes'); // <--- 1. NEW IMPORT

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Allows parsing JSON from incoming requests

// --- CORS CONFIGURATION ---
app.use(cors({
  origin: [
    "http://localhost:5173",                    // Your local laptop
    "https://e-commerce-front-lake.vercel.app", // Your Customer Website
    "https://e-commerce-front-admin.vercel.app" // Your Admin Panel
  ],
  credentials: true
}));

// Make the 'uploads' folder public
app.use('/uploads', express.static('uploads')); 

// --- DATABASE CONNECTION ---
// This uses your secure MONGO_URI from Render environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api', authRoutes); // <--- 2. ACTIVATE AUTH ROUTES (This enables /api/login)

// Simple Health Check Route
app.get('/', (req, res) => {
  res.send('Fashion Store Backend is Running');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});