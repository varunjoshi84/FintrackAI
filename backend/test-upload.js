// Test script for transaction upload
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Get token from command line or use default
const token = process.argv[2] || 'YOUR_AUTH_TOKEN_HERE';

// Test data
const testData = `Date,Description,Amount,Type,Category
2023-07-01,Salary Deposit,5000.00,credit,Income
2023-07-05,Grocery Shopping,120.50,debit,Food
2023-07-10,Rent Payment,1200.00,debit,Housing
2023-07-15,Restaurant Bill,45.75,debit,Food
2023-07-20,Utility Bill,85.30,debit,Utilities
`;

// Create test CSV file
const createTestFile = () => {
  const filePath = path.join(__dirname, 'test-transactions.csv');
  fs.writeFileSync(filePath, testData);
  console.log('Test CSV file created:', filePath);
  return filePath;
};

// Upload test file
const uploadTestFile = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    console.log('Uploading test file...');
    console.log('Using token:', token.substring(0, 10) + '...');
    
    const response = await axios.post(
      'http://localhost:8000/api/upload/transactions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Verify transactions
const verifyTransactions = async () => {
  try {
    console.log('Verifying transactions...');
    
    const response = await axios.get(
      'http://localhost:8000/api/reports/generate',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Transactions found:', response.data.report.length);
    console.log('First transaction:', response.data.report[0]);
    return response.data;
  } catch (error) {
    console.error('Verification error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    const filePath = createTestFile();
    await uploadTestFile(filePath);
    await verifyTransactions();
    
    // Clean up
    fs.unlinkSync(filePath);
    console.log('Test file removed');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
};

// Run the test
main();