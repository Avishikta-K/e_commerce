require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders'); 

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Allows parsing JSON from incoming requests

// --- CORS CONFIGURATION (UPDATED) ---
app.use(cors({
  origin: [
    "http://localhost:5173",                    // Your local laptop
    "https://e-commerce-front-lake.vercel.app", // Your Customer Website
    "https://e-commerce-front-admin.vercel.app" // <--- ADDED: Your New Admin Panel
  ],
  credentials: true
}));

// Make the 'uploads' folder public
// NOTE: On Render, images here will disappear after 15-20 mins (restart). 
// For production, consider using Cloudinary or AWS S3 later.
app.use('/uploads', express.static('uploads')); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fashionstore')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// --- ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 

// Simple Health Check Route
app.get('/', (req, res) => {
  res.send('Fashion Store Backend is Running');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});