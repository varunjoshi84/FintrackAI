const User = require('../models/User');
const transactionRepository = require('../repositories/transactionRepository');
const { verifyToken: jwtVerify } = require('../utils/jwt');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwtVerify(token);
    const userId = (decoded.id || decoded.userId || decoded._id || '').toString();
    req.user = { ...decoded, id: userId, _id: userId, userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user dashboard data with real PostgreSQL aggregates
const getDashboardData = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id || req.user.userId || '').toString();
    
    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch real stats from relational database
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [recentTxns, allUserTxns] = await Promise.all([
      transactionRepository.findByUser({ userId, page: 1, limit: 5 }),
      transactionRepository.findByUserAndUploadId(userId, null),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlySpending = 0;

    for (const t of allUserTxns) {
      const amt = Number(t.amount) || 0;
      const isCredit = t.type === 'credit';
      if (isCredit) {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        if (new Date(t.date) >= startOfMonth) {
          monthlySpending += amt;
        }
      }
    }

    const totalBalance = totalIncome - totalExpense;

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan || 'Basic'
      },
      stats: {
        totalTransactions: allUserTxns.length,
        totalBalance: Math.round(totalBalance * 100) / 100,
        monthlySpending: Math.round(monthlySpending * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        savingsGoal: 0,
      },
      recentActivity: recentTxns.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      })),
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id || req.user.userId || '').toString();
    const { name, email } = req.body;

    const updateFields = {};
    if (typeof name === 'string' && name.trim()) updateFields.name = name.trim();
    if (typeof email === 'string' && email.trim()) updateFields.email = email.trim().toLowerCase();

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  verifyToken,
  getDashboardData,
  updateProfile
};
