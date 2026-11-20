const bcrypt = require('bcryptjs');
const User = require('./User');
const { signToken } = require('../utils/jwt');

// Admin login (only for admin users)
const adminLogin = async (req, res) => {
  try {
    let email = typeof req.body.email === 'string' ? req.body.email : '';
    let password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email && req.body.email && typeof req.body.email === 'object') {
      if (typeof req.body.email.email === 'string') email = req.body.email.email;
      if (typeof req.body.email.password === 'string') password = req.body.email.password;
    }

    if (!password && typeof req.body.password === 'string') {
      password = req.body.password;
    }

    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide valid admin credentials' });
    }

    // Find admin user (must have role = 'admin')
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Create login token with unified payload
    const token = signToken({ 
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: 'admin' 
    });

    res.json({
      message: 'Admin login successful!',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ 
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = adminLogin;
