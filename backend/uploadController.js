const transactionRepository = require('./repositories/transactionRepository');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { extractTransactionsFromPDF } = require('./pdfUtils');
const { v4: uuidv4 } = require('uuid');
const User = require('./authentication/User');

// Storage configuration ensuring destination exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload_${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
  },
});

// Allowed MIME types and extensions
const allowedMimes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'text/plain'];
const allowedExts = ['.pdf', '.csv'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExts.includes(ext);
  const isAllowedMime = allowedMimes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and CSV bank statements are supported.'), false);
  }
};

// Hardened Multer configuration with 10MB limit and strict fileFilter
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
    files: 1,
  },
  fileFilter,
});

// Helper to remove temp file safely
const cleanTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Could not remove temp upload file:', err.message);
  }
};

// Handle file upload and extract transactions
const uploadTransactions = async (req, res) => {
  let filePath = null;
  try {
    const userId = req.user ? (req.user._id || req.user.id || req.user.userId) : null;
    if (!userId) {
      if (req.file) cleanTempFile(req.file.path);
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No statement file uploaded' });
    }

    filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let transactions = [];
    const uploadId = uuidv4();

    if (ext === '.pdf') {
      try {
        transactions = await extractTransactionsFromPDF(filePath, userId, uploadId);
      } catch (pdfErr) {
        cleanTempFile(filePath);
        return res.status(422).json({
          success: false,
          message: 'Failed to parse transactions from PDF statement. Please ensure it is a valid bank statement.',
          error: pdfErr.message,
        });
      }
    } else if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const dateVal = row.date || row.Date || row['Transaction Date'] || row['Value Date'];
            const descVal = row.description || row.Description || row.Narration || row['Transaction Details'];
            const amtVal = row.amount || row.Amount || row['Transaction Amount'] || row['Withdrawal Amount'] || row['Deposit Amount'];
            const typeVal = row.type || row.Type || (row['Withdrawal Amount'] ? 'debit' : 'credit');

            if (dateVal && descVal && amtVal) {
              const numAmt = parseFloat(String(amtVal).replace(/[^0-9.-]/g, ''));
              if (!isNaN(numAmt) && numAmt > 0) {
                transactions.push({
                  date: new Date(dateVal),
                  description: String(descVal).trim(),
                  amount: numAmt,
                  type: String(typeVal).toLowerCase().includes('cr') ? 'credit' : 'debit',
                  category: row.category || row.Category || 'Others',
                  balance: row.balance ? parseFloat(row.balance) : null,
                  userId: String(userId),
                  uploadId,
                });
              }
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    cleanTempFile(filePath);

    if (!transactions.length) {
      return res.status(400).json({
        success: false,
        message: 'No readable transactions found in the uploaded file.',
      });
    }

    // Save with deduplication against existing database transactions
    const saved = await transactionRepository.bulkCreate(transactions);

    res.json({
      success: true,
      message: `Successfully processed ${saved.length} new transactions (${transactions.length - saved.length} duplicates skipped)`,
      data: saved,
      uploadId,
      totalExtracted: transactions.length,
      savedCount: saved.length,
      skippedCount: transactions.length - saved.length,
    });
  } catch (error) {
    cleanTempFile(filePath);
    console.error('Upload processing error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process statement upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Generate summary report
const generateReport = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id || req.user.userId) : null;
    const fileId = req.query.fileId || req.body.fileId || null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const transactions = await transactionRepository.findByUserAndUploadId(userId, fileId);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'credit') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const cat = t.category || 'Others';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      report: {
        totalTransactions: transactions.length,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate: parseFloat(savingsRate),
        categoryBreakdown: categoryTotals,
        transactions,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate financial report' });
  }
};

module.exports = {
  upload,
  uploadTransactions,
  generateReport,
};
