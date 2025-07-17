// Transactions Controller - Handle transaction operations
const User = require('./authentication/User');
const jwt = require('jsonwebtoken');

// Simple Transaction Schema (in-memory for now, you can move to MongoDB later)
let transactions = [
  {
    id: 1,
    userId: null,
    type: 'income',
    amount: 2500,
    description: 'Salary',
    category: 'Income',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: null,
    type: 'expense',
    amount: 150,
    description: 'Groceries',
    category: 'Food',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const type = req.query.type;

    // Filter transactions for this user
    let userTransactions = transactions.filter(t => t.userId === userId || t.userId === null);

    // Apply filters
    if (category && category !== 'All Categories') {
      userTransactions = userTransactions.filter(t => t.category === category);
    }
    if (type && type !== 'all') {
      userTransactions = userTransactions.filter(t => t.type === type);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = userTransactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: userTransactions.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userTransactions.length / limit),
        totalItems: userTransactions.length,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new transaction
const addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, description, category, date } = req.body;

    // Validate required fields
    if (!type || !amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new transaction
    const newTransaction = {
      id: transactions.length + 1,
      userId: userId,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);

    res.json({
      success: true,
      transaction: newTransaction,
      message: 'Transaction added successfully'
    });

  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);
    const { type, amount, description, category, date } = req.body;

    const transactionIndex = transactions.findIndex(t => t.id === transactionId && t.userId === userId);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      type: type || transactions[transactionIndex].type,
      amount: amount ? parseFloat(amount) : transactions[transactionIndex].amount,
      description: description || transactions[transactionIndex].description,
      category: category || transactions[transactionIndex].category,
      date: date || transactions[transactionIndex].date,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      transaction: transactions[transactionIndex],
      message: 'Transaction updated successfully'
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);

    const transactionIndex = transactions.findIndex(t => t.id === transactionId && t.userId === userId);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transactions.splice(transactionIndex, 1);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
};
