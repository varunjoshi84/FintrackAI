const mongoose = require('mongoose');
const User = require('./authentication/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const migrateUserStatus = async () => {
  try {
    // Update all users to have proper status field
    const users = await User.find({});
    
    for (const user of users) {
      // Convert old 'verified' field to new 'status' field
      if (user.verified === undefined && user.isVerified === undefined) {
        user.isVerified = true;
        user.status = 'Active';
      } else if (user.verified !== undefined) {
        user.isVerified = user.verified;
        user.status = user.verified ? 'Active' : 'Inactive';
      } else if (user.status === undefined) {
        user.status = user.isVerified ? 'Active' : 'Inactive';
      }
      
      await user.save();
    }
    
    console.log(`✅ Migrated ${users.length} users successfully!`);
    console.log('Users now have proper status fields:');
    
    const updatedUsers = await User.find({}).select('name email status isVerified');
    updatedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.status} | Verified: ${user.isVerified}`);
    });
    
  } catch (error) {
    console.error('❌ Error migrating users:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

migrateUserStatus();
