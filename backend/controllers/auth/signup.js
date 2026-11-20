const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { signToken } = require('../../utils/jwt');

// Register new user
const signup = async (req, res) => {
  try {
    let name = req.body.name;
    let email = typeof req.body.email === 'string' ? req.body.email : (req.body.email?.email || '');
    let password = typeof req.body.password === 'string' ? req.body.password : (req.body.email?.password || '');

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email and password must be valid strings' });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered! Please login with your credentials instead.', 
        suggestion: 'Use the login page to access your account.'
      });
    }

    // Hash password for security
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      plan: 'Basic'
    });

    await user.save();

    // Create login token with both id and userId for absolute consistency
    const token = signToken({ 
      id: user._id.toString(), 
      userId: user._id.toString(), 
      email: user.email,
      role: user.role 
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ 
      message: 'Error creating account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = signup;
