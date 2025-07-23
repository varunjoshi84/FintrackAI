// Script to fix deposit transaction types
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

async function fixDepositTypes() {
  try {
    // Find all transactions with deposit-related descriptions that should be credit
    const depositKeywords = ['deposit', 'cheque'];
    
    const transactions = await Transaction.find({
      description: { 
        $regex: new RegExp(depositKeywords.join('|'), 'i') 
      },
      type: 'debit' // Only find transactions incorrectly marked as debit
    });
    
    console.log(`Found ${transactions.length} deposit transactions marked as debit`);
    
    // Update each transaction
    let updatedCount = 0;
    
    for (const transaction of transactions) {
      console.log(`Fixing transaction: ${transaction.description} - changing type from debit to credit`);
      transaction.type = 'credit';
      await transaction.save();
      updatedCount++;
    }
    
    console.log(`Updated ${updatedCount} transactions`);
    
  } catch (error) {
    console.error('Error fixing transactions:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
fixDepositTypes();