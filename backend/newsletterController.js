const Newsletter = require('./Newsletter');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('./emailService');

// Generate HMAC unsubscribe token for an email address
const getUnsubscribeToken = (email) => {
  const secret = process.env.JWT_SECRET || 'newsletter_secret_salt';
  return crypto.createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex');
};

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required'
      });
    }

    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const unsubToken = getUnsubscribeToken(email);

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to our newsletter'
        });
      } else {
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        
        try {
          await sendWelcomeEmail(email, unsubToken);
        } catch (emailError) {
          console.warn('Welcome back email warning:', emailError.message);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
          data: { email }
        });
      }
    }

    // Create new subscription
    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    try {
      await sendWelcomeEmail(email, unsubToken);
    } catch (emailError) {
      console.warn('Welcome email warning:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: { email }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing subscription'
    });
  }
};

// Unsubscribe from newsletter with signed token verification
const unsubscribeNewsletter = async (req, res) => {
  try {
    let { email, token } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required to unsubscribe'
      });
    }

    email = email.trim().toLowerCase();

    // Verify cryptographic unsubscribe token to prevent arbitrary unsubscription of victims
    const expectedToken = getUnsubscribeToken(email);
    if (!token || token !== expectedToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing unsubscribe security token',
      });
    }

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Email is already unsubscribed'
      });
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: { email }
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while unsubscribing'
    });
  }
};

// Get all newsletter subscribers (admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10, active = true } = req.query;
    const filter = { isActive: active === 'true' };
    
    const subscribers = await Newsletter.find(filter)
      .select('email subscribedAt isActive')
      .sort({ subscribedAt: -1 })
      .limit(Number(limit) || 10)
      .skip(((Number(page) || 1) - 1) * (Number(limit) || 10));

    const total = await Newsletter.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Newsletter subscribers retrieved successfully',
      data: {
        subscribers,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / (Number(limit) || 10))
        }
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve newsletter subscribers'
    });
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers
};
