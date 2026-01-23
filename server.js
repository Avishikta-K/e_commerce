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
    "http://localhost:5173",                    // Allows your local laptop to connect
    "https://e-commerce-front-lake.vercel.app"  // Allows your Live Vercel site to connect
  ],
  credentials: true
}));

// Make the 'uploads' folder public
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