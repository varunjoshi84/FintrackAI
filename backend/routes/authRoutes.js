const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google Auth - Initiation
router.get('/google', (req, res, next) => {
  const platform = req.query.platform || 'web';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: platform  // passes through Google untouched
  })(req, res, next);
});

// Google Auth - Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {

    // Check if account is active
    if (req.user.status === 'Inactive') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=deactivated`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // User info payload
    const userInfo = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      plan: req.user.plan || 'Basic',
      isVerified: req.user.isVerified || false
    };

    // Detect iOS via state param — Google passes it back untouched
    const isIOS = req.query.state === 'ios';

    if (isIOS) {
      // Redirect to iOS app via custom URL scheme
      const iosRedirect = `fintrackai://auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`;
      console.log('iOS Google auth success, redirecting to app');
      return res.redirect(iosRedirect);
    }

    // Web redirect — completely unchanged from original
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`;
    console.log('Web Google auth success, redirecting to frontend');
    res.redirect(redirectUrl);
  }
);

module.exports = router;