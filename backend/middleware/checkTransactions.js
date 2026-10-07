const transactionRepository = require('../repositories/transactionRepository');

// Middleware to check if user has transactions
const checkTransactions = async (req, res, next) => {
  try {
    // Skip check for certain routes
    const skipRoutes = ['/api/upload', '/api/auth', '/api/user/profile'];
    const isSkipRoute = skipRoutes.some(route => req.path.startsWith(route));
    
    if (isSkipRoute) {
      return next();
    }
    
    // Get userId from authentication middleware
    const userId = req.user ? (req.user._id || req.user.id || req.user.userId) : null;
    if (!userId) {
      return next();
    }
    
    // Check if user has any transactions in PostgreSQL
    const userHasTransactions = await transactionRepository.hasTransactions(userId);
    
    if (!userHasTransactions) {
      return res.status(200).json({
        success: false,
        message: 'Please upload your bank statement or transactions in the upload section',
        redirect: '/upload',
        noTransactions: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking transactions:', error);
    next();
  }
};

module.exports = checkTransactions;