const User = require('../authentication/User');
const transactionRepository = require('../repositories/transactionRepository');

// Plan limits configuration
const PLAN_LIMITS = {
  Basic: {
    maxUploadsPerMonth: 5,
    dataRetentionDays: 7,
    hasAdvancedInsights: false,
    hasBudgetPlanning: false,
    hasExports: false,
    hasPrioritySupport: false
  },
  Pro: {
    maxUploadsPerMonth: -1, // Unlimited
    dataRetentionDays: -1, // Unlimited
    hasAdvancedInsights: true,
    hasBudgetPlanning: true,
    hasExports: true,
    hasPrioritySupport: true
  },
  Enterprise: {
    maxUploadsPerMonth: -1, // Unlimited
    dataRetentionDays: -1, // Unlimited
    hasAdvancedInsights: true,
    hasBudgetPlanning: true,
    hasExports: true,
    hasPrioritySupport: true,
    hasTeamFeatures: true
  }
};

// Check upload limits
const checkUploadLimit = async (req, res, next) => {
  try {
    const userId = (req.user?.id || req.user?._id || req.user?.userId || '').toString();
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if plan is expired and auto-downgrade to Basic
    const now = new Date();
    const isExpired = user.planEndDate && new Date(user.planEndDate) < now;
    if (isExpired && user.plan !== 'Basic') {
      user.plan = 'Basic';
      user.subscriptionStatus = 'inactive';
      await user.save();
    }
    
    const userPlan = user.plan || 'Basic';
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.Basic;

    if (limits.maxUploadsPerMonth === -1) {
      return next(); // Unlimited uploads
    }

    // Unified accurate upload count from PostgreSQL transactions table
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const uploadCount = await transactionRepository.countDistinctUploadsThisMonth(userId, startOfMonth);

    if (uploadCount >= limits.maxUploadsPerMonth) {
      return res.status(403).json({
        success: false,
        message: `Upload limit reached. ${userPlan} plan allows ${limits.maxUploadsPerMonth} uploads per month. Upgrade to Pro for unlimited uploads.`,
        planLimit: true,
        currentPlan: userPlan,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Check upload limit error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to verify plan upload limits' });
  }
};

// Check feature access
const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = (req.user?.id || req.user?._id || req.user?.userId || '').toString();
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const now = new Date();
      const isExpired = user.planEndDate && new Date(user.planEndDate) < now;
      if (isExpired && user.plan !== 'Basic') {
        user.plan = 'Basic';
        user.subscriptionStatus = 'inactive';
        await user.save();
      }
      
      const userPlan = user.plan || 'Basic';
      const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.Basic;

      if (!limits[featureName]) {
        return res.status(403).json({
          success: false,
          message: `This feature is not available on the ${userPlan} plan. Please upgrade to access it.`,
          upgradeRequired: true,
          feature: featureName
        });
      }

      next();
    } catch (error) {
      console.error('Check feature access error:', error.message);
      res.status(500).json({ success: false, message: 'Failed to verify feature access' });
    }
  };
};

// Get user plan limits and real usage
const getUserPlanLimits = async (req, res) => {
  try {
    const userId = (req.user?.id || req.user?._id || req.user?.userId || '').toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userPlan = user.plan || 'Basic';
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.Basic;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentUploads = await transactionRepository.countDistinctUploadsThisMonth(userId, startOfMonth);

    res.json({
      success: true,
      data: {
        currentPlan: userPlan,
        limits: limits,
        usage: {
          uploadsThisMonth: currentUploads,
          uploadsRemaining: limits.maxUploadsPerMonth === -1 ? -1 : Math.max(0, limits.maxUploadsPerMonth - currentUploads)
        }
      }
    });
  } catch (error) {
    console.error('Get plan limits error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get plan limits' });
  }
};

module.exports = {
  checkUploadLimit,
  checkFeatureAccess,
  getUserPlanLimits,
  PLAN_LIMITS
};
