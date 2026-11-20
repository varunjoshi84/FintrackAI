const User = require('../authentication/User');
const { verifyToken } = require('../utils/jwt');

// Strict authentication middleware
const strictAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: No token provided'
      });
    }

    // Verify token using unified jwt utility
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Invalid or expired token'
      });
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Malformed token payload'
      });
    }

    // Check if user exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: User not found'
      });
    }

    // Check if user is active
    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Account is inactive'
      });
    }

    // Set user info for next middleware and controllers
    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      plan: user.plan || 'Basic',
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Strict auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'AUTHENTICATION REQUIRED: Server authorization error'
    });
  }
};

module.exports = strictAuthMiddleware;
