const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cleanupOrphanTransactions = async () => {
  try {
    console.log('Checking for transactions without user associations...');
    
    // Find transactions without user field or with null user
    const orphanTransactions = await Transaction.find({
      $or: [
        { user: null },
        { user: { $exists: false } }
      ]
    });
    
    console.log(`Found ${orphanTransactions.length} orphan transactions`);
    
    if (orphanTransactions.length > 0) {
      console.log('\nOrphan transactions:');
      orphanTransactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.description} - ${tx.amount} (${tx.type}) - Date: ${tx.date}`);
      });
      
      console.log('\nThese transactions will be deleted as they cannot be associated with any user.');
      console.log('This is necessary because the Transaction model now requires a user field.');
      
      // Delete orphan transactions
      const deleteResult = await Transaction.deleteMany({
        $or: [
          { user: null },
          { user: { $exists: false } }
        ]
      });
      
      console.log(`\n✅ Deleted ${deleteResult.deletedCount} orphan transactions`);
    } else {
      console.log('✅ No orphan transactions found. All transactions are properly associated with users.');
    }
    
    // Show summary of remaining transactions
    const totalTransactions = await Transaction.countDocuments();
    console.log(`\nTotal transactions remaining: ${totalTransactions}`);
    
    // Show transactions by user
    const transactionsByUser = await Transaction.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);
    
    console.log('\nTransactions by user:');
    transactionsByUser.forEach(group => {
      const userName = group.userInfo[0]?.name || 'Unknown User';
      const userEmail = group.userInfo[0]?.email || 'Unknown Email';
      console.log(`- ${userName} (${userEmail}): ${group.count} transactions`);
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

cleanupOrphanTransactions();