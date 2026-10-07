// Transactions Controller - Handle transaction operations
const transactionRepository = require('./repositories/transactionRepository');
const jwt = require('jsonwebtoken');

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
    const userId = req.user._id || req.user.id || req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const type = req.query.type;
    const search = req.query.search;

    const result = await transactionRepository.findByUser({
      userId,
      page,
      limit,
      category,
      type,
      search,
    });

    res.json({
      success: true,
      transactions: result.transactions,
      total: result.total,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new transaction
const addTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { type, amount, description, category, date } = req.body;

    // Validate required fields
    if (!type || !amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const savedTransaction = await transactionRepository.create({
      userId,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: date ? new Date(date) : new Date(),
    });

    res.json({
      success: true,
      transaction: savedTransaction,
      message: 'Transaction added successfully',
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const transactionId = req.params.id;
    const { type, amount, description, category, date } = req.body;

    const updatedTransaction = await transactionRepository.update(
      transactionId,
      userId,
      {
        type,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        category,
        date: date ? new Date(date) : undefined,
      }
    );
    
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const transactionId = req.params.id;

    const deletedTransaction = await transactionRepository.delete(
      transactionId,
      userId
    );
    
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
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
  deleteTransaction,
};