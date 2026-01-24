const jwt = require('jsonwebtoken');

// 1. MATCHING SECRET KEY LOGIC
// We must use the exact same logic as authRoutes.js to ensure keys match
const SECRET_KEY = process.env.JWT_SECRET || "your_super_long_secret_key_fashion_store_2026";

module.exports = function(req, res, next) {
  // 2. Get token from header
  const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"

  // 3. Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 4. Verify token
  try {
    // Use the SECRET_KEY constant defined above, NOT just process.env
    const decoded = jwt.verify(token, SECRET_KEY);
    
    req.user = decoded; // Attach user payload (id, email) to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};