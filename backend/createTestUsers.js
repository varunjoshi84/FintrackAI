const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./authentication/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestUsers = async () => {
  try {
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        phone: '+1234567891',
        location: 'New York, USA',
        isVerified: true,
        status: 'Active'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        phone: '+1234567892',
        location: 'Los Angeles, USA',
        isVerified: true,
        status: 'Active'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        phone: '+1234567893',
        location: 'Chicago, USA',
        isVerified: false,
        status: 'Inactive'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        phone: '+1234567894',
        location: 'Miami, USA',
        isVerified: true,
        status: 'Active'
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        phone: '+1234567895',
        location: 'Seattle, USA',
        isVerified: true,
        status: 'Active'
      }
    ];

    // Delete existing test users (except admin)
    await User.deleteMany({ role: 'user' });

    // Insert test users
    await User.insertMany(testUsers);
    
    console.log('✅ Test users created successfully!');
    console.log(`Created ${testUsers.length} test users:`);
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

createTestUsers();
