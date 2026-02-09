require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// --- IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const bannerRoutes = require('./routes/banner'); 

const app = express();

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://e-commerce-front-lake.vercel.app", 
    "https://e-commerce-front-admin.vercel.app" 
  ],
  credentials: true
}));

app.use('/uploads', express.static('uploads')); 

// --- ENSURE DATA DIRECTORY EXISTS ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

// --- ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/banners', bannerRoutes); 

// Health Check
app.get('/', (req, res) => {
  res.send('Fashion Store Backend (Local Mode) is Running');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
  console.log(`📂 Data will be saved to /data/users.json`);
});