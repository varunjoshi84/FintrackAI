const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    // In local development, warn and provide a fixed dev key
    console.warn('⚠️ WARNING: JWT_SECRET is not set. Using dev secret. Please set JWT_SECRET in .env.');
    return 'fintrackai_development_secret_key_32bytes_min';
  }
  return secret;
};

const signToken = (payload, options = {}) => {
  const secret = getJwtSecret();
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRE || '7d';
  return jwt.sign(payload, secret, { ...options, expiresIn });
};

const verifyToken = (token) => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

module.exports = {
  getJwtSecret,
  signToken,
  verifyToken,
};
