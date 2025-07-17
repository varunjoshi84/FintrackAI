// Database Connection - Simple and Clean
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));
};

module.exports = connectDB;
