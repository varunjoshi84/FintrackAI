// Script to create a test transaction in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestTransaction() {
  try {
    // Generate a unique uploadId
    const uploadId = uuidv4();
    
    // Create a test transaction
    const transaction = new Transaction({
      date: new Date(),
      description: 'Test Transaction',
      amount: 1000,
      type: 'credit',
      category: 'Test',
      uploadId,
      balance: 5000
    });
    
    // Save the transaction
    const savedTransaction = await transaction.save();
    console.log('Created test transaction:', savedTransaction);
    
    // Create a few more transactions with the same uploadId
    const transactions = [
      {
        date: new Date(),
        description: 'Salary',
        amount: 5000,
        type: 'credit',
        category: 'Income',
        uploadId,
        balance: 10000
      },
      {
        date: new Date(),
        description: 'Rent',
        amount: 2000,
        type: 'debit',
        category: 'Housing',
        uploadId,
        balance: 8000
      },
      {
        date: new Date(),
        description: 'Groceries',
        amount: 500,
        type: 'debit',
        category: 'Food',
        uploadId,
        balance: 7500
      }
    ];
    
    // Save the transactions
    const savedTransactions = await Transaction.insertMany(transactions);
    console.log(`Created ${savedTransactions.length} more test transactions`);
    
    // Count all transactions
    const count = await Transaction.countDocuments();
    console.log(`Total transactions in database: ${count}`);
    
  } catch (error) {
    console.error('Error creating test transaction:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
createTestTransaction();