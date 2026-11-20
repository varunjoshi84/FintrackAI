const bcrypt = require('bcryptjs');
const User = require('./User');
const { signToken } = require('../utils/jwt');

// User login
const login = async (req, res) => {
  try {
    let email = typeof req.body.email === 'string' ? req.body.email : '';
    let password = typeof req.body.password === 'string' ? req.body.password : '';

    // Handle nested format { email: { email, password } } safely if present
    if (!email && req.body.email && typeof req.body.email === 'object') {
      if (typeof req.body.email.email === 'string') email = req.body.email.email;
      if (typeof req.body.email.password === 'string') password = req.body.email.password;
    }

    if (!password && typeof req.body.password === 'string') {
      password = req.body.password;
    }

    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide a valid email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is a Google-only account without a local password
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account was created with Google Sign-In. Please sign in using the "Continue with Google" button.' 
      });
    }

    // Check if account is active
    if (user.status === 'Inactive') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated. Please contact admin@fintrackai.com or support team to reactivate your account.' 
      });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create login token with unified payload
    const token = signToken({ 
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        plan: user.plan || 'Basic'
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      message: 'An error occurred while logging in. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = login;
