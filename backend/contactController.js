const { sendContactNotification, sendContactConfirmation } = require('./emailService');

// Contact form handler
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Log the contact form submission
    console.log(`📧 Contact form received from ${name} (${email}): ${subject}`);

    // Send notification email to admin
    try {
      await sendContactNotification({ name, email, subject, message });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send confirmation email to user
    try {
      await sendContactConfirmation(email, name);
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ve received it and will get back to you within 24 hours. Check your email for confirmation! 📧',
      data: { name, email, subject }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

module.exports = {
  sendContactMessage
};

module.exports = {
  sendContactMessage
};
