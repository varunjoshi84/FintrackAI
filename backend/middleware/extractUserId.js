const { verifyToken } = require('../utils/jwt');

// Middleware to extract userId from token
const extractUserId = (req, res, next) => {
  try {
    if (req.user && (req.user.id || req.user._id || req.user.userId)) {
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          const userId = decoded.id || decoded.userId || decoded._id;
          if (userId) {
            if (!req.user) req.user = {};
            req.user.id = userId.toString();
            req.user._id = userId.toString();
            req.user.userId = userId.toString();
          }
        } catch (tokenError) {
          // Token error non-fatal here as subsequent auth guards check credentials
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = extractUserId;
