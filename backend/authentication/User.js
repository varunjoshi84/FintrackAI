// User Model - Simple and Clean
const mongoose = require('mongoose');

// User Schema - Keep it simple!
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});

// Export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
