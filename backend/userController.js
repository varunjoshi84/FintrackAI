const User = require('./authentication/User');
const bcrypt = require('bcryptjs');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        dob: user.dob || null,
        location: user.location || '',
        verified: user.isVerified || false,
        image: user.profileImage || null,
        plan: user.plan || 'Basic'
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, dob, location } = req.body;

    const updateData = {};
    if (typeof name === 'string') updateData.name = name.trim();
    if (typeof phone === 'string') updateData.phone = phone.trim();
    if (dob) updateData.dob = dob;
    if (typeof location === 'string') updateData.location = location.trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user account with password/confirmation safeguard and clean PostgreSQL ordering
const deleteUserAccount = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const { password, confirmation } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safeguard: For password users, require valid password. For Google users, require confirmation string
    if (user.password) {
      if (!password || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Password is required to confirm account deletion'
        });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Account deletion aborted.'
        });
      }
    } else {
      if (confirmation !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({
          success: false,
          message: 'Please type "DELETE MY ACCOUNT" to confirm permanent account deletion'
        });
      }
    }

    // 1. Clean PostgreSQL relational records first to prevent orphaned records if Postgres fails
    const transactionRepository = require('./repositories/transactionRepository');
    const paymentRepository = require('./repositories/paymentRepository');
    await Promise.all([
      transactionRepository.deleteByUserId(userId),
      paymentRepository.deleteByUserId(userId),
    ]);

    // 2. Delete user identity from MongoDB only after relational cleanup succeeds
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account and associated financial data deleted permanently.'
    });

  } catch (error) {
    console.error('Delete user account error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete account. Please try again or contact support.' });
  }
};

// Verify user account
const verifyUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Verify user account error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  verifyUserAccount,
};
