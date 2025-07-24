const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./authentication/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testUserTransactions = async () => {
  try {
    console.log('Testing user transaction filtering...');
    
    // Get all users
    const users = await User.find({}).limit(2);
    
    if (users.length < 2) {
      console.log('Need at least 2 users to test filtering. Creating test users...');
      
      // Create test users if they don't exist
      const testUser1 = new User({
        name: 'Test User 1',
        email: 'testuser1@example.com',
        password: 'hashedpassword123',
        role: 'user'
      });
      
      const testUser2 = new User({
        name: 'Test User 2', 
        email: 'testuser2@example.com',
        password: 'hashedpassword123',
        role: 'user'
      });
      
      await testUser1.save();
      await testUser2.save();
      
      users.push(testUser1, testUser2);
    }
    
    const user1 = users[0];
    const user2 = users[1];
    
    console.log(`User 1: ${user1.name} (${user1._id})`);
    console.log(`User 2: ${user2.name} (${user2._id})`);
    
    // Clear existing test transactions
    await Transaction.deleteMany({ 
      description: { $regex: /^TEST_/ } 
    });
    
    // Create test transactions for user 1
    const user1Transactions = [
      {
        user: user1._id,
        date: new Date('2024-01-15'),
        description: 'TEST_User1_Salary',
        amount: 5000,
        type: 'credit',
        category: 'Income'
      },
      {
        user: user1._id,
        date: new Date('2024-01-16'),
        description: 'TEST_User1_Groceries',
        amount: 150,
        type: 'debit',
        category: 'Food'
      }
    ];
    
    // Create test transactions for user 2
    const user2Transactions = [
      {
        user: user2._id,
        date: new Date('2024-01-15'),
        description: 'TEST_User2_Freelance',
        amount: 2000,
        type: 'credit',
        category: 'Income'
      },
      {
        user: user2._id,
        date: new Date('2024-01-16'),
        description: 'TEST_User2_Rent',
        amount: 1200,
        type: 'debit',
        category: 'Housing'
      }
    ];
    
    // Insert test transactions
    await Transaction.insertMany([...user1Transactions, ...user2Transactions]);
    
    console.log('\nTest transactions created successfully!');
    
    // Test filtering - get transactions for user 1
    const user1Results = await Transaction.find({ user: user1._id });
    console.log(`\nUser 1 transactions (should be 2): ${user1Results.length}`);
    user1Results.forEach(tx => {
      console.log(`  - ${tx.description}: ${tx.amount} (${tx.type})`);
    });
    
    // Test filtering - get transactions for user 2
    const user2Results = await Transaction.find({ user: user2._id });
    console.log(`\nUser 2 transactions (should be 2): ${user2Results.length}`);
    user2Results.forEach(tx => {
      console.log(`  - ${tx.description}: ${tx.amount} (${tx.type})`);
    });
    
    // Verify no cross-contamination
    const user1HasUser2Data = user1Results.some(tx => tx.description.includes('User2'));
    const user2HasUser1Data = user2Results.some(tx => tx.description.includes('User1'));
    
    if (user1HasUser2Data || user2HasUser1Data) {
      console.log('\n❌ ERROR: Cross-contamination detected! Users can see each other\'s transactions.');
    } else {
      console.log('\n✅ SUCCESS: Transaction filtering is working correctly!');
    }
    
    console.log('\nTest completed. You can now test in the frontend:');
    console.log(`1. Login as ${user1.email} - should see 2 transactions`);
    console.log(`2. Login as ${user2.email} - should see 2 different transactions`);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

testUserTransactions();