// Script to check transaction types
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

async function checkTransactionTypes() {
  try {
    // Get all transactions
    const transactions = await Transaction.find().sort({ date: 1 });
    console.log(`Found ${transactions.length} transactions`);
    
    // Group by type
    const debitTransactions = transactions.filter(t => t.type === 'debit');
    const creditTransactions = transactions.filter(t => t.type === 'credit');
    
    console.log(`Debit transactions: ${debitTransactions.length}`);
    console.log(`Credit transactions: ${creditTransactions.length}`);
    
    // Print all transactions with their types
    console.log('\nAll transactions:');
    transactions.forEach(t => {
      console.log(`${new Date(t.date).toISOString().split('T')[0]} | ${t.description.padEnd(30)} | ${t.type.padEnd(6)} | ₹${t.amount.toFixed(2).padStart(10)}`);
    });
    
    // Check for deposit transactions that might be incorrectly categorized
    const depositKeywords = ['deposit', 'cheque', 'cash'];
    const depositTransactions = transactions.filter(t => 
      depositKeywords.some(keyword => t.description.toLowerCase().includes(keyword))
    );
    
    console.log('\nDeposit-related transactions:');
    depositTransactions.forEach(t => {
      console.log(`${new Date(t.date).toISOString().split('T')[0]} | ${t.description.padEnd(30)} | ${t.type.padEnd(6)} | ₹${t.amount.toFixed(2).padStart(10)}`);
    });
    
  } catch (error) {
    console.error('Error checking transactions:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Execute the function
checkTransactionTypes();