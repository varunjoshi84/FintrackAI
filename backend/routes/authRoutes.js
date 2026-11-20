const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const { signToken } = require('../utils/jwt');
const { createAuthCode, exchangeAuthCode } = require('../utils/authCodeStore');

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Google Auth - Initiation with cryptographic state (Anti-CSRF)
router.get('/google', (req, res, next) => {
  const platform = req.query.platform === 'ios' ? 'ios' : 'web';
  const csrfNonce = crypto.randomBytes(16).toString('hex');

  // Store state in session for validation
  if (req.session) {
    req.session.oauthState = `${platform}:${csrfNonce}`;
  }

  // Encoded state contains platform & random nonce
  const state = `${platform}:${csrfNonce}`;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
});

// 2. Google Auth - Callback with state validation & PKCE code exchange
router.get('/google/callback', (req, res, next) => {
  const frontendUrl = getFrontendUrl();
  const returnedState = req.query.state || '';

  // Validate state against session to prevent Login-CSRF attacks
  if (req.session && req.session.oauthState && req.session.oauthState !== returnedState) {
    console.error('[SECURITY] OAuth state mismatch - potential CSRF attack detected.');
    return res.redirect(`${frontendUrl}/login?error=csrf_detected`);
  }

  // Clear state after check
  if (req.session) {
    delete req.session.oauthState;
  }

  // Failure redirect points to real frontend /login page, never a non-existent backend path
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl}/login?error=google_auth_failed`,
    session: false,
  })(req, res, next);
}, (req, res) => {
  const frontendUrl = getFrontendUrl();

  // Check if account is active
  if (req.user.status === 'Inactive') {
    return res.redirect(`${frontendUrl}/login?error=deactivated`);
  }

  // Generate standardized JWT token
  const token = signToken({
    id: req.user._id.toString(),
    userId: req.user._id.toString(),
    email: req.user.email,
    role: req.user.role || 'user',
  });

  // User info payload
  const userInfo = {
    id: req.user._id.toString(),
    name: req.user.name,
    email: req.user.email,
    role: req.user.role || 'user',
    plan: req.user.plan || 'Basic',
    isVerified: req.user.isVerified !== false,
  };

  const isIOS = (req.query.state || '').startsWith('ios:');

  // PKCE-style secure one-time auth code exchange:
  // Instead of passing the raw JWT token in redirect URLs (which exposes it in browser history,
  // server logs, and HTTP Referer headers), we pass a temporary 60-second single-use code.
  const authCode = createAuthCode({
    token,
    user: userInfo,
    platform: isIOS ? 'ios' : 'web',
  });

  if (isIOS) {
    const iosRedirect = `fintrackai://auth/callback?code=${authCode}`;
    return res.redirect(iosRedirect);
  }

  // Redirect to frontend with only the temporary auth code
  const redirectUrl = `${frontendUrl}/auth/success?code=${authCode}`;
  res.redirect(redirectUrl);
});

// 3. Secure Code Exchange Endpoint (PKCE-style exchange)
router.post('/exchange-code', (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Authorization code is required' });
  }

  const result = exchangeAuthCode(code);

  if (!result) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired authorization code. Please sign in again.',
    });
  }

  res.json({
    success: true,
    token: result.token,
    user: result.user,
  });
});

module.exports = router;
