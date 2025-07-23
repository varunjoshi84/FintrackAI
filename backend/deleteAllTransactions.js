// Script to delete all transactions from the database
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

async function deleteAllTransactions() {
  try {
    // Count transactions before deletion
    const countBefore = await Transaction.countDocuments();
    console.log(`Total transactions before deletion: ${countBefore}`);
    
    // Delete all transactions
    const result = await Transaction.deleteMany({});
    console.log(`Deleted ${result.deletedCount} transactions`);
    
    // Verify deletion
    const countAfter = await Transaction.countDocuments();
    console.log(`Total transactions after deletion: ${countAfter}`);
    
  } catch (error) {
    console.error('Error deleting transactions:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
deleteAllTransactions();