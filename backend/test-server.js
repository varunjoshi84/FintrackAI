// Simple test server for Google authentication
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./googleAuth');
const jwt = require('jsonwebtoken');

// Import database connection
const connectDB = require('./database');

// Create Express app
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to database
connectDB();

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

// Google Auth Routes
app.get('/api/auth/google', (req, res, next) => {
  console.log('Google auth route accessed');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/api/auth/google/callback', 
  (req, res, next) => {
    console.log('Google auth callback route accessed');
    passport.authenticate('google', { failureRedirect: '/login', session: false })(req, res, next);
  },
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to test page with token
    res.redirect(`http://localhost:8000/test-login.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
      name: req.user.name,
      email: req.user.email
    }))}`);
  }
);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`Google login URL: http://localhost:${PORT}/api/auth/google`);
});