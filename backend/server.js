
// This file connects everything together!

const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

// Import database connection
const connectDB = require('./database');

// Import authentication functions from the authentication folder
const signup = require('./authentication/signup');
const login = require('./authentication/login');
const adminLogin = require('./authentication/adminLogin');

// Import dashboard functions
const { verifyToken, getDashboardData, updateProfile } = require('./dashboard');

// Import user functions
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  verifyUserAccount,
  verifyToken: verifyUserToken 
} = require('./userController');

// Create Express app
const app = express();

// Basic middleware (what our app needs to work)
app.use(express.json()); // To read JSON data
app.use(cors());         // To allow frontend to connect

// Connect to database
connectDB();


// Health check - test if server is working
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Authentication Routes
app.post('/api/auth/register', signup);     // User signup
app.post('/api/auth/login', login);         // User login  
app.post('/api/auth/admin/login', adminLogin); // Admin login

// Dashboard Routes (Protected - require authentication)
app.get('/api/dashboard', verifyToken, getDashboardData);    // Get user dashboard data
app.put('/api/dashboard/profile', verifyToken, updateProfile); // Update user profile

// User Routes (Protected - require authentication)
app.get('/api/user/profile', verifyUserToken, getUserProfile);        // Get user profile
app.put('/api/user/profile', verifyUserToken, updateUserProfile);     // Update user profile
app.delete('/api/user/account', verifyUserToken, deleteUserAccount);  // Delete user account
app.post('/api/user/verify', verifyUserToken, verifyUserAccount);     // Verify user account

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


