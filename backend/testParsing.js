// Test script to parse the statement format
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

// Sample statement lines - each line as a separate string
const statementLines = [
  "Account Holder: Varun Joshi",
  "Account Number: XXXXXXXX1234",
  "Branch: SBI, Andheri West",
  "IFSC: SBIN0001234",
  "Statement Period: 01-07-2025 to 21-07-2025",
  "Date Narration Withdrawal Deposit Balance",
  "01-07-2025 ATM Withdrawal - Andheri 2546.00 47454.00",
  "02-07-2025 UPI - AMAZON 1774.00 45680.00",
  "03-07-2025 Salary - XYZ Pvt Ltd 13367.00 59047.00",
  "04-07-2025 NEFT - Rent Payment 6747.00 52300.00",
  "05-07-2025 POS - Big Bazaar 1449.00 50851.00",
  "06-07-2025 UPI - ZOMATO 6833.00 44018.00",
  "07-07-2025 Recharge - Jio 7815.00 36203.00",
  "08-07-2025 Bill Payment - Tata Power 3819.00 32384.00",
  "09-07-2025 UPI - Swiggy 1268.00 31116.00",
  "10-07-2025 Cheque Deposit 12486.00 43602.00",
  "11-07-2025 Transfer from ABC 10873.00 54475.00",
  "12-07-2025 Credit Card Payment 7615.00 46860.00",
  "13-07-2025 UPI - Google Pay 1808.00 45052.00",
  "14-07-2025 NEFT - Freelance Work 4509.00 49561.00",
  "15-07-2025 Cash Deposit - Branch 14103.00 63664.00"
];

async function parseAndSaveTransactions() {
  try {
    const transactions = [];
    const uploadId = uuidv4();
    
    // Skip header lines
    let headerPassed = false;
    
    for (const line of statementLines) {
      console.log('Processing line:', line);
      
      // Check if this is the header line
      if (line.includes('Date') && line.includes('Narration') && line.includes('Balance')) {
        headerPassed = true;
        continue;
      }
      
      // Skip lines until we find the header
      if (!headerPassed) continue;
      
      // Try to parse transaction line
      const datePattern = /^(\d{2}-\d{2}-\d{4})/;
      const dateMatch = line.match(datePattern);
      
      if (dateMatch) {
        const dateStr = dateMatch[1];
        const [day, month, year] = dateStr.split('-');
        const date = new Date(`${year}-${month}-${day}`);
        
        // Split the line by spaces, but keep the date as one token
        const lineWithoutDate = line.substring(dateStr.length).trim();
        
        // Extract description - it's everything until we hit a number
        const descriptionEndIndex = lineWithoutDate.search(/\d+\.\d{2}/);
        if (descriptionEndIndex === -1) continue; // Skip if no amount found
        
        const description = lineWithoutDate.substring(0, descriptionEndIndex).trim();
        
        // Extract the remaining numbers
        const numbersText = lineWithoutDate.substring(descriptionEndIndex);
        const numbers = numbersText.match(/\d+\.\d{2}/g) || [];
        
        console.log('Extracted numbers:', numbers);
        
        if (numbers.length < 2) continue; // Need at least amount and balance
        
        let type = null;
        let amount = null;
        let balance = null;
        
        if (numbers.length === 2) {
          // Format: date | description | amount | balance
          amount = parseFloat(numbers[0]);
          balance = parseFloat(numbers[1]);
          
          // Determine if credit or debit based on description
          const isDebit = description.toLowerCase().includes('withdrawal') || 
                         description.toLowerCase().includes('payment') ||
                         description.toLowerCase().includes('purchase') ||
                         description.toLowerCase().includes('atm') ||
                         description.toLowerCase().includes('pos') ||
                         description.toLowerCase().includes('bill') ||
                         description.toLowerCase().includes('recharge') ||
                         description.toLowerCase().includes('upi');
          
          const isCredit = description.toLowerCase().includes('deposit') ||
                          description.toLowerCase().includes('salary') ||
                          description.toLowerCase().includes('transfer from') ||
                          description.toLowerCase().includes('refund') ||
                          description.toLowerCase().includes('credit') ||
                          description.toLowerCase().includes('cheque');
          
          type = isDebit ? 'debit' : (isCredit ? 'credit' : 'debit'); // Default to debit
        } else if (numbers.length >= 3) {
          // Format: date | description | withdrawal | deposit | balance
          const withdrawal = parseFloat(numbers[0]);
          const deposit = parseFloat(numbers[1]);
          balance = parseFloat(numbers[2]);
          
          if (withdrawal > 0) {
            type = 'debit';
            amount = withdrawal;
          } else if (deposit > 0) {
            type = 'credit';
            amount = deposit;
          }
        }
        
        // Create transaction object
        if (amount > 0) {
          const transaction = {
            date,
            description,
            amount,
            type,
            balance,
            uploadId
          };
          
          transactions.push(transaction);
          console.log('Created transaction:', transaction);
        }
      }
    }
    
    console.log(`Parsed ${transactions.length} transactions`);
    
    // Save to database
    if (transactions.length > 0) {
      const savedTransactions = await Transaction.insertMany(transactions);
      console.log(`Saved ${savedTransactions.length} transactions to database`);
    }
    
  } catch (error) {
    console.error('Error parsing transactions:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
parseAndSaveTransactions();