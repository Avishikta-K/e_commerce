const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');

// Reuse existing multer storage setup logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// @route   GET /api/banners
// @desc    Get all hero banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 }); // Newest first
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/banners
// @desc    Create a new banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imagePath = '';
    if (req.file) {
      // Ensure this matches your server's static file serving URL
      imagePath = 'https://fashion-store-ak.onrender.com/uploads/' + req.file.filename; 
    } else if (req.body.image) {
       imagePath = req.body.image;
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    const banner = new Banner({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: imagePath
    });

    const newBanner = await banner.save();
    res.status(201).json(newBanner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/banners/:id
// @desc    Delete a banner
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;