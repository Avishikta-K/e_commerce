const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use the Secret from your .env file
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

module.exports = async function(req, res, next) {
  // 1. Get token from header
  const token = req.header('Authorization')?.split(' ')[1];

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Verify token using SUPABASE SECRET
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    
    // decoded contains: { sub: 'supabase_user_id', email: 'user@email.com', ... }

    // 4. SYNC: Find the user in MongoDB
    let user = await User.findOne({ email: decoded.email });

    // 5. If user doesn't exist in Mongo yet, CREATE them automatically
    if (!user) {
        user = new User({
            email: decoded.email,
            supabaseId: decoded.sub, // Link the IDs
            name: 'New Member',
            avatar: ''
        });
        await user.save();
        console.log("New user created in MongoDB from Supabase Login:", user.email);
    } 
    // Optimization: If user exists but lacks supabaseId, update it
    else if (!user.supabaseId) {
        user.supabaseId = decoded.sub;
        await user.save();
    }

    // 6. Attach the MONGODB user to the request object
    // This allows your routes (like /profile) to work exactly as before using req.user._id
    req.user = user; 
    
    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};