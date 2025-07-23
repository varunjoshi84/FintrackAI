// Script to check transactions in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkTransactions() {
  try {
    // Count all transactions
    const count = await Transaction.countDocuments();
    console.log(`Total transactions in database: ${count}`);

    // Get a sample of transactions
    const transactions = await Transaction.find().limit(5);
    console.log('Sample transactions:');
    console.log(JSON.stringify(transactions, null, 2));

    // Check for transactions without user ID
    const noUserCount = await Transaction.countDocuments({ user: null });
    console.log(`Transactions without user ID: ${noUserCount}`);

    // Check for transactions by upload ID
    const uploadIds = await Transaction.distinct('uploadId');
    console.log(`Unique upload IDs: ${uploadIds.length}`);
    console.log('Upload IDs:', uploadIds);

  } catch (error) {
    console.error('Error checking transactions:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkTransactions();