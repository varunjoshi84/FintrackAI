const crypto = require('crypto');

// In-memory store for short-lived (60 seconds) one-time authorization exchange codes
const authCodeStore = new Map();

// Periodic cleanup of expired codes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of authCodeStore.entries()) {
    if (now > entry.expiresAt) {
      authCodeStore.delete(code);
    }
  }
}, 30 * 1000);

/**
 * Creates a secure, random one-time authorization code associated with token & user
 */
const createAuthCode = ({ token, user, platform = 'web' }) => {
  const code = crypto.randomBytes(32).toString('hex');
  authCodeStore.set(code, {
    token,
    user,
    platform,
    expiresAt: Date.now() + 60 * 1000, // 60 seconds TTL
  });
  return code;
};

/**
 * Redeems an authorization code (one-time use)
 */
const exchangeAuthCode = (code) => {
  if (!code || !authCodeStore.has(code)) {
    return null;
  }
  const entry = authCodeStore.get(code);
  authCodeStore.delete(code); // Invalidate immediately to prevent replay

  if (Date.now() > entry.expiresAt) {
    return null;
  }
  return entry;
};

module.exports = {
  createAuthCode,
  exchangeAuthCode,
};
