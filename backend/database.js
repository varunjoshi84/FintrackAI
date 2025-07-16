// Database Connection - Simple and Clean
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = () => {
  mongoose.connect('mongodb+srv://fintrackai:abcd1234@cluster0.gopqxpf.mongodb.net/fintackai')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));
};

module.exports = connectDB;
