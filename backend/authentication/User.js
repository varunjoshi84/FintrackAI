// User Model - Simple and Clean
const mongoose = require('mongoose');

// User Schema - Keep it simple!
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  phone: { type: String, default: '' },
  dob: { type: Date, default: null },
  location: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  plan: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
  profileImage: { type: String, default: null }
}, {
  timestamps: true 
});

// Export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
