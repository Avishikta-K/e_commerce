const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');

// --- Multer Storage Setup ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/products
// @desc    Get all products or filter by category
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let products;
    if (category) {
      products = await Product.find({ category: category });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imagePath = '';

    // Handle Image Logic
    if (req.file) {
      imagePath = 'http://localhost:5000/uploads/' + req.file.filename;
    } 
    else if (req.body.image) {
       imagePath = req.body.image;
    } else {
      return res.status(400).json({ message: "Product image is required (file or URL)" });
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity, 
      category: req.body.category,
      image: imagePath, 
      sizes: req.body.sizes, 
      colors: req.body.colors,
      inStock: req.body.quantity > 0 
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- NEW: GET SINGLE PRODUCT BY ID ---
// @route   GET /api/products/:id
// @desc    Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    // If ID format is invalid (like '1' from static data), return 404
    // This allows the frontend to fall back to static data gracefully
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;