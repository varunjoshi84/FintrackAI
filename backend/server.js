
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

// Import upload functions
const { upload, uploadTransactions } = require('./uploadController');

// Import user functions
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  verifyUserAccount,
  verifyToken: verifyUserToken 
} = require('./userController');

// Import admin functions
const {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getAnalytics,
  getUserGrowthData,
  sendNotification,
  toggleMaintenanceMode
} = require('./adminController');

// Import newsletter functions
const { 
  subscribeNewsletter, 
  unsubscribeNewsletter, 
  getAllSubscribers 
} = require('./newsletterController');

// Import contact functions
const { 
  sendContactMessage, 
  getContactMessages, 
  getContactStats, 
  updateContactMessage, 
  sendEmailResponse, 
  deleteContactMessage 
} = require('./contactController');

// Import email service for testing
const { sendWelcomeEmail } = require('./emailService');

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

// Upload Transactions Endpoint
app.post('/api/upload/transactions', upload.single('file'), uploadTransactions);

// Authentication Routes
app.post('/api/auth/register', signup);     // User signup
app.post('/api/auth/login', login);         // User login  
app.post('/api/auth/admin/login', adminLogin); // Admin login

// Dashboard Routes (Protected - require authentication)
app.get('/api/dashboard', verifyToken, getDashboardData);    // Get user dashboard data
app.put('/api/dashboard/profile', verifyToken, updateProfile); // Update user profile

// Admin Routes (Protected - require admin authentication)
app.get('/api/admin/stats', verifyUserToken, getAdminStats);           // Get admin dashboard stats
app.get('/api/admin/users', verifyUserToken, getAllUsers);             // Get all users with pagination
app.get('/api/admin/users/:userId', verifyUserToken, getUserById);     // Get single user
app.patch('/api/admin/users/:userId/status', verifyUserToken, updateUserStatus); // Update user status
app.delete('/api/admin/users/:userId', verifyUserToken, deleteUser);   // Delete user
app.post('/api/admin/users', verifyUserToken, createUser);             // Create new user
app.put('/api/admin/users/:userId', verifyUserToken, updateUser);      // Update user
app.get('/api/admin/analytics', verifyUserToken, getAnalytics);        // Get analytics data
app.get('/api/admin/analytics/user-growth', verifyUserToken, getUserGrowthData); // Get user growth data
app.post('/api/admin/notification', verifyUserToken, sendNotification); // Send notification to users
app.post('/api/admin/maintenance', verifyUserToken, toggleMaintenanceMode); // Toggle maintenance mode

// User Routes (Protected - require authentication)
app.get('/api/user/profile', verifyUserToken, getUserProfile);        // Get user profile
app.put('/api/user/profile', verifyUserToken, updateUserProfile);     // Update user profile
app.delete('/api/user/account', verifyUserToken, deleteUserAccount);  // Delete user account
app.post('/api/user/verify', verifyUserToken, verifyUserAccount);     // Verify user account

// Newsletter Routes (Public - no authentication required)
app.post('/api/newsletter/subscribe', subscribeNewsletter);            // Subscribe to newsletter
app.post('/api/newsletter/unsubscribe', unsubscribeNewsletter);        // Unsubscribe from newsletter
app.get('/api/newsletter/subscribers', verifyUserToken, getAllSubscribers); // Get all subscribers (admin only)

// Contact Routes (Public - no authentication required)
app.post('/api/contact/send', sendContactMessage);                     // Send contact form message

// Admin Contact Management Routes (Requires authentication)
app.get('/api/admin/contacts', verifyUserToken, getContactMessages);           // Get all contact messages
app.get('/api/admin/contacts/stats', verifyUserToken, getContactStats);        // Get contact statistics
app.put('/api/admin/contacts/:id', verifyUserToken, updateContactMessage);     // Update contact status/response
app.post('/api/admin/contacts/:id/respond', verifyUserToken, sendEmailResponse); // Send email response
app.delete('/api/admin/contacts/:id', verifyUserToken, deleteContactMessage);  // Delete contact message

// Test email endpoint 
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    
    const result = await sendWelcomeEmail(email);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send email',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


