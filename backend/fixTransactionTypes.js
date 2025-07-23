// Script to fix transaction types
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

async function fixTransactionTypes() {
  try {
    // Get all transactions
    const transactions = await Transaction.find();
    console.log(`Found ${transactions.length} transactions`);
    
    // Transactions that should be credit
    const creditDescriptions = [
      'Salary - XYZ Pvt Ltd',
      'Cheque Deposit',
      'Transfer from ABC',
      'NEFT - Freelance Work',
      'Cash Deposit - Branch'
    ];
    
    // Update each transaction
    let updatedCount = 0;
    
    for (const transaction of transactions) {
      const shouldBeCredit = creditDescriptions.some(desc => 
        transaction.description.includes(desc)
      );
      
      if (shouldBeCredit && transaction.type !== 'credit') {
        console.log(`Fixing transaction: ${transaction.description} - changing type from ${transaction.type} to credit`);
        transaction.type = 'credit';
        await transaction.save();
        updatedCount++;
      }
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
fixTransactionTypes();