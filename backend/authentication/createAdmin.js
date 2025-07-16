// Create Admin - Simple and Clean
const bcrypt = require('bcryptjs');
const User = require('./User');

// Create admin user (run once to create admin)
const createAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fintackai.com' });
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists' });
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash('admin123456', 10);

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@fintackai.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    // Send success response with credentials
    res.json({ 
      message: 'Admin created successfully!',
      credentials: {
        email: 'admin@fintackai.com',
        password: 'admin123456'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating admin', 
      error: error.message 
    });
  }
};

module.exports = createAdmin;
