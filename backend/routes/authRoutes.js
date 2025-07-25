const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Check if account is active
    if (req.user.status === 'Inactive') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=deactivated`);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Include additional user info if available
    const userInfo = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      plan: req.user.plan || 'Basic',
      isVerified: req.user.isVerified || false
    };
    
    console.log('Google auth callback - user info:', userInfo);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
  }
);

module.exports = router;