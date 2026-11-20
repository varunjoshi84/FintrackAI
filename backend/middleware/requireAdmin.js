const jwt = require('jsonwebtoken');
const User = require('../authentication/User');

/**
 * Strict Admin Authorization Middleware.
 * Validates JWT token, verifies user existence & active status in DB,
 * and ensures req.user.role === 'admin'.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Admin token missing',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: Invalid or expired token',
      });
    }

    const userId = decoded.id || decoded._id || decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: User not found',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'ACCESS DENIED: Account is inactive',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ACCESS DENIED: Administrator privileges required',
      });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization',
    });
  }
};

module.exports = requireAdmin;
