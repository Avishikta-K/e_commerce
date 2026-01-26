require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 

const app = express();

// --- MIDDLEWARE (UPDATED) ---
// ⚠️ FIX: Increased limit to 50mb so Profile Images don't crash the server
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api', authRoutes); 
app.use('/api/users', userRoutes); 

// Simple Health Check Route
app.get('/', (req, res) => {
  res.send('Fashion Store Backend is Running');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});