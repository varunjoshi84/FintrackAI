// This file connects everything together!

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database connections (Polyglot: MongoDB + PostgreSQL)
const connectDB = require('./database');
const { connectPostgres } = require('./config/postgres');

// Import authentication functions
const signup = require('./authentication/signup');
const login = require('./authentication/login');
const adminLogin = require('./authentication/adminLogin');

// Import Google authentication
const passport = require('./googleAuth');
const authRoutes = require('./routes/authRoutes');

// Import dashboard functions
const { verifyToken, getDashboardData, updateProfile } = require('./dashboard');

// Import upload functions
const { upload, uploadTransactions, generateReport } = require('./uploadController');

// Import transaction functions
const { 
  verifyToken: verifyTransactionToken, 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('./transactionController');

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
  toggleMaintenanceMode,
  getMaintenanceStatus,
  checkMaintenanceMode
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

// Import payment functions
const {
  createOrder,
  processPayment,
  recordFailedPayment,
  handleRazorpayWebhook,
  getPaymentHistory,
  getSubscriptionStatus
} = require('./paymentController');

// Import AI insights controller
const { generateInsights } = require('./insightsController');

// Import strict auth middlewares
const strictAuthMiddleware = require('./middleware/strictAuth');
const requireAdmin = require('./middleware/requireAdmin');
const { getUserPlanLimits, checkUploadLimit } = require('./middleware/planLimits');

// Create Express app
const app = express();

// 1. Security HTTP Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// 2. Rate Limiting to prevent brute-force and DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Specific stricter limiter for Auth & Contact routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: 'Too many contact messages submitted. Please try again later.' }
});

// 3. Body Parsing & Webhook raw buffer preservation
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 5. CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8081',
      'https://fintrackai-production.up.railway.app'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins gracefully
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 6. Session configuration (clean, no runtime execSync hack)
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('SESSION_SECRET required in production'); })() 
  : 'fintrackai_development_session_secret');

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport for Google OAuth
app.use(passport.initialize());
app.use(passport.session());

// Maintenance Mode Middleware (State persisted in MongoDB)
app.use(checkMaintenanceMode);

// Root & Health Endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'FinTrackAI Backend API',
    status: 'Running',
    version: '1.0.0',
    documentation: 'See README.md for endpoint specifications'
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: 'fintrackai-backend',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Upload Routes (Protected & Plan-Quota Enforced)
app.post('/api/upload/file', strictAuthMiddleware, checkUploadLimit, upload.single('file'), uploadTransactions);
app.post('/api/upload/transactions', strictAuthMiddleware, checkUploadLimit, upload.single('file'), uploadTransactions);
app.get('/api/reports/generate', strictAuthMiddleware, generateReport);
app.post('/api/reports/generate', strictAuthMiddleware, generateReport);

// Auth Routes (Rate Limited)
app.post('/api/auth/register', authLimiter, signup);
app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/admin/login', authLimiter, adminLogin);
app.use('/api/auth', authRoutes);

// Dashboard Routes
app.get('/api/dashboard', strictAuthMiddleware, getDashboardData);
app.put('/api/dashboard/profile', strictAuthMiddleware, updateProfile);
app.post('/api/insights/generate', strictAuthMiddleware, generateInsights); // Server-side AI insights proxy

// Transaction Routes
app.get('/api/transactions', strictAuthMiddleware, getTransactions);
app.post('/api/transactions', strictAuthMiddleware, addTransaction);
app.put('/api/transactions/:id', strictAuthMiddleware, updateTransaction);
app.delete('/api/transactions/:id', strictAuthMiddleware, deleteTransaction);

// Admin Routes (Strict RBAC: requireAdmin verifies DB role === 'admin')
app.get('/api/admin/stats', requireAdmin, getAdminStats);
app.get('/api/admin/users', requireAdmin, getAllUsers);
app.get('/api/admin/users/:userId', requireAdmin, getUserById);
app.patch('/api/admin/users/:userId/status', requireAdmin, updateUserStatus);
app.delete('/api/admin/users/:userId', requireAdmin, deleteUser);
app.post('/api/admin/users', requireAdmin, createUser);
app.put('/api/admin/users/:userId', requireAdmin, updateUser);
app.get('/api/admin/analytics', requireAdmin, getAnalytics);
app.get('/api/admin/analytics/user-growth', requireAdmin, getUserGrowthData);
app.post('/api/admin/notification', requireAdmin, sendNotification);
app.post('/api/admin/maintenance', requireAdmin, toggleMaintenanceMode);
app.get('/api/maintenance/status', getMaintenanceStatus);

// User Profile Routes
app.get('/api/user/profile', strictAuthMiddleware, getUserProfile);
app.put('/api/user/profile', strictAuthMiddleware, updateUserProfile);
app.delete('/api/user/account', strictAuthMiddleware, deleteUserAccount);
app.post('/api/user/verify', strictAuthMiddleware, verifyUserAccount);
app.get('/api/user/plan-limits', strictAuthMiddleware, getUserPlanLimits);

// Payment & Billing Routes
app.post('/api/payment/create-order', strictAuthMiddleware, createOrder);
app.post('/api/payment/process', strictAuthMiddleware, processPayment);
app.post('/api/payment/record-failure', strictAuthMiddleware, recordFailedPayment);
app.post('/api/payment/webhook', handleRazorpayWebhook);
app.get('/api/payment/history', strictAuthMiddleware, getPaymentHistory);
app.get('/api/subscription/status', strictAuthMiddleware, getSubscriptionStatus);

// Newsletter Routes
app.post('/api/newsletter/subscribe', contactLimiter, subscribeNewsletter);
app.post('/api/newsletter/unsubscribe', unsubscribeNewsletter);
app.get('/api/newsletter/subscribers', requireAdmin, getAllSubscribers);

// Contact Routes
app.post('/api/contact/send', contactLimiter, sendContactMessage);
app.get('/api/admin/contacts', requireAdmin, getContactMessages);
app.get('/api/admin/contacts/stats', requireAdmin, getContactStats);
app.put('/api/admin/contacts/:id', requireAdmin, updateContactMessage);
app.post('/api/admin/contacts/:id/respond', requireAdmin, sendEmailResponse);
app.delete('/api/admin/contacts/:id', requireAdmin, deleteContactMessage);

// 404 Route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 8000;

// Start Databases and Server
connectDB().then(() => {
  connectPostgres();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}).catch(err => {
  console.error('Database connection failed:', err.message);
});

module.exports = app;
