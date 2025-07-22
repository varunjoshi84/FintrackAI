const Transaction = require('./models/Transaction');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle file upload and extract transactions
const uploadTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const transactions = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Expecting columns: date, description, amount, type, category
        if (row.date && row.description && row.amount && row.type) {
          transactions.push({
            date: new Date(row.date),
            description: row.description,
            amount: parseFloat(row.amount),
            type: row.type.toLowerCase(),
            category: row.category || '',
          });
        }
      })
      .on('end', async () => {
        // Save transactions to DB
        try {
          const saved = await Transaction.insertMany(transactions);
          fs.unlinkSync(filePath); // Clean up uploaded file
          res.json({ success: true, message: 'Transactions uploaded', data: saved });
        } catch (dbError) {
          res.status(500).json({ success: false, message: 'DB error', error: dbError });
        }
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload error', error });
  }
};

module.exports = { upload, uploadTransactions };
