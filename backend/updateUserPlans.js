const mongoose = require('mongoose');
const User = require('./authentication/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const updateUserPlans = async () => {
  try {
    // Update all users to have a plan field if they don't have one
    const result = await User.updateMany(
      { plan: { $exists: false } }, // Users without a plan field
      { $set: { plan: 'Basic' } }    // Set default plan to Basic
    );
    
    console.log(`Updated ${result.modifiedCount} users with Basic plan!`);
    
    // Show all users with their plans
    const users = await User.find({}).select('name email plan status createdAt');
    console.log('\nAll users with their plans:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.plan} plan | ${user.status} | Joined: ${new Date(user.createdAt).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error(' Error updating user plans:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

updateUserPlans();
