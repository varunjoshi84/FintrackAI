const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/sanitizeHtml');

// Create transporter with Gmail configuration from environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email to new newsletter subscribers
const sendWelcomeEmail = async (email, unsubscribeToken) => {
  try {
    const transporter = createTransporter();
    const safeEmail = escapeHtml(email);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const unsubUrl = `${frontendUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken || '')}`;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'FinTrackAI Team',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎉 Welcome to FinTrackAI Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; margin: 0; font-size: 26px;">Welcome to FinTrackAI</h1>
            </div>
            <div style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              <p>Hello,</p>
              <p>Thank you for subscribing to the FinTrackAI newsletter for <strong>${safeEmail}</strong>. You'll receive practical financial management and savings tips.</p>
              <p>If you did not request this subscription, you can safely unsubscribe anytime:</p>
              <p style="margin-top: 20px;">
                <a href="${unsubUrl}" style="color: #3b82f6; text-decoration: underline;">Click here to unsubscribe securely</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Welcome email error:', error.message);
    throw error;
  }
};

// Send contact message notification to admin
const sendContactNotification = async ({ name, email, subject, message, contactId }) => {
  try {
    const transporter = createTransporter();
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const mailOptions = {
      from: {
        name: 'FinTrackAI System',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Contact Form] ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 25px; border-radius: 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${safeName} (&lt;${safeEmail}&gt;)</p>
            <p><strong>Department:</strong> ${safeSubject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #3b82f6; margin: 15px 0;">
              ${safeMessage}
            </blockquote>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Contact notification email error:', error.message);
    throw error;
  }
};

// Send confirmation email to user
const sendContactConfirmation = async (email, name) => {
  try {
    const transporter = createTransporter();
    const safeName = escapeHtml(name);

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'FinTrackAI Team',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'We received your message - FinTrackAI Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 25px; border-radius: 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Thank you for contacting us</h2>
            <p>Hi ${safeName},</p>
            <p>We have safely received your inquiry. Our support team will review it and get back to you within 24 business hours.</p>
            <p>Best regards,<br/>The FinTrackAI Team</p>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Contact confirmation email error:', error.message);
    throw error;
  }
};

// Send response email from admin to user
const sendContactResponse = async (email, name, adminResponse, originalSubject) => {
  try {
    const transporter = createTransporter();
    const safeName = escapeHtml(name);
    const safeResponse = escapeHtml(adminResponse);
    const safeSubject = escapeHtml(originalSubject);

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'FinTrackAI Support',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: `Response: ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 25px; border-radius: 8px;">
            <p>Hi ${safeName},</p>
            <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              ${safeResponse}
            </div>
            <p>Best regards,<br/>FinTrackAI Support</p>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send contact response error:', error.message);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendContactNotification,
  sendContactConfirmation,
  sendContactResponse,
};
