// Test script for creating a Google user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./authentication/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Create a test Google user
const createTestUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test.google@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return existingUser;
    }
    
    // Create new user
    const user = new User({
      name: 'Test Google User',
      email: 'test.google@example.com',
      googleId: 'google123456789',
      isVerified: true,
      status: 'Active'
    });
    
    await user.save();
    console.log('Test user created successfully:', user);
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    return null;
  }
};

// Main function
const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to MongoDB');
    process.exit(1);
  }
  
  const user = await createTestUser();
  if (!user) {
    console.error('Failed to create test user');
    process.exit(1);
  }
  
  console.log('Test completed successfully');
  mongoose.disconnect();
};

// Run the script
main();