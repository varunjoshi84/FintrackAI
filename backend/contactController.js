const Contact = require('./models/Contact');
const { escapeHtml } = require('./utils/sanitizeHtml');
const { sendContactNotification, sendContactConfirmation, sendContactResponse } = require('./emailService');

// Contact form handler with strict input escaping and validation
const sendContactMessage = async (req, res) => {
  try {
    let { firstName, lastName, email, department, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    if (
      typeof firstName !== 'string' ||
      typeof lastName !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input format'
      });
    }

    firstName = firstName.trim().slice(0, 80);
    lastName = lastName.trim().slice(0, 80);
    email = email.trim().toLowerCase().slice(0, 120);
    department = (typeof department === 'string' ? department.trim() : '').slice(0, 50);
    message = message.trim().slice(0, 3000);

    // Strict Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Save contact message to database
    const contactMessage = new Contact({
      firstName,
      lastName,
      email,
      department: department || '',
      message,
      status: 'new',
      priority: 'medium'
    });

    const savedContact = await contactMessage.save();

    // Send escaped notification email to admin
    try {
      await sendContactNotification({ 
        name: `${firstName} ${lastName}`, 
        email, 
        subject: department || 'General Inquiry', 
        message,
        contactId: savedContact._id 
      });
    } catch (emailError) {
      console.warn('Failed to send admin notification:', emailError.message);
    }

    // Send escaped confirmation email to user
    try {
      await sendContactConfirmation(email, firstName);
    } catch (emailError) {
      console.warn('Failed to send user confirmation:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ve received it and will get back to you within 24 hours. Check your email for confirmation! 📧',
      data: { 
        id: savedContact._id,
        name: `${firstName} ${lastName}`, 
        email, 
        department: department || 'General Inquiry'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// Get all contact messages for admin (with pagination and filters)
const getContactMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department, 
      priority,
      search 
    } = req.query;

    const filter = {};
    if (status && typeof status === 'string') filter.status = status;
    if (department && typeof department === 'string') filter.department = department;
    if (priority && typeof priority === 'string') filter.priority = priority;
    
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { firstName: { $regex: sanitizedSearch, $options: 'i' } },
        { lastName: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
        { message: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 10)
      .skip(((Number(page) || 1) - 1) * (Number(limit) || 10))
      .exec();

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: parseInt(page, 10),
        total: Math.ceil(total / (Number(limit) || 10)),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
};

// Get contact message statistics for admin dashboard
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Contact.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        departmentStats: departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};

// Update contact message status
const updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (status && typeof status === 'string') updateFields.status = status;
    if (adminResponse && typeof adminResponse === 'string') {
      updateFields.adminResponse = adminResponse;
      updateFields.respondedBy = req.user?.email || 'admin';
      updateFields.respondedAt = new Date();
    }

    const updated = await Contact.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update contact message error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update contact message' });
  }
};

// Send email response from admin to user
const sendEmailResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || typeof response !== 'string') {
      return res.status(400).json({ success: false, message: 'Response message is required' });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    await sendContactResponse(contact.email, contact.firstName, response, contact.department || 'Inquiry');

    contact.adminResponse = response;
    contact.respondedBy = req.user?.email || 'admin';
    contact.respondedAt = new Date();
    contact.status = 'resolved';
    contact.updatedAt = new Date();
    await contact.save();

    res.json({ success: true, message: 'Response sent successfully' });
  } catch (error) {
    console.error('Send contact response error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send response email' });
  }
};

// Delete contact message
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

module.exports = {
  sendContactMessage,
  getContactMessages,
  getContactStats,
  updateContactMessage,
  sendEmailResponse,
  deleteContactMessage,
};
