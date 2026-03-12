const fs = require('fs');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');

/**
 * COMPREHENSIVE INDIAN BANK STATEMENT PARSER
 * Handles PDFs where amount and balance are merged (no space between them)
 * e.g: "02-01-2026Grocery Store113748863" → amount=1137, balance=48863
 */

// ─── CREDIT KEYWORDS ────────────────────────────────────────────────────────
const CREDIT_KEYWORDS = [
  'salary', 'sal cr', 'sal credit', 'payroll', 'wages', 'stipend',
  'neft cr', 'neft credit', 'imps cr', 'imps credit', 'rtgs cr', 'rtgs credit',
  'transfer cr', 'transfer credit', 'trf cr', 'inward', 'received from',
  'transfer from', 'tfr from', 'fund transfer cr',
  'upi cr', 'upi credit', 'upi-cr', 'upi/cr', 'upi received',
  'deposit', 'cash deposit', 'cash cr', 'cdm', 'cash deposited',
  'cheque deposit', 'chq dep', 'chq cr', 'cheque cr', 'dd deposit',
  'refund', 'cashback', 'cash back', 'reversal cr', 'chargeback',
  'interest credit', 'int cr', 'interest cr', 'savings interest',
  'fd interest', 'rd interest', 'dividend', 'div cr',
  'freelance', 'consulting', 'bonus', 'incentive', 'commission',
  'rental income', 'rent received', 'credit adjustment', 'adj cr',
  'loan disbursement', 'loan cr', 'od credit', 'credit',
];

// ─── DEBIT KEYWORDS ─────────────────────────────────────────────────────────
const DEBIT_KEYWORDS = [
  'atm', 'atm withdrawal', 'atm wd', 'atm dr', 'cash withdrawal', 'cash wd',
  'neft dr', 'neft debit', 'imps dr', 'imps debit', 'rtgs dr', 'rtgs debit',
  'transfer dr', 'trf dr', 'outward', 'transfer to', 'sent to',
  'upi dr', 'upi debit', 'upi payment', 'upi paid',
  'electricity bill', 'power bill', 'water bill', 'gas bill', 'lpg',
  'internet bill', 'wifi bill', 'dth', 'mobile bill', 'mobile recharge',
  'recharge', 'prepaid recharge', 'postpaid bill',
  'jio', 'airtel', 'vodafone', 'bsnl', 'bescom', 'msedcl',
  'zomato', 'swiggy', 'food delivery', 'restaurant', 'hotel bill',
  'dominos', 'pizza', 'mcdonald', 'kfc', 'subway', 'cafe', 'coffee',
  'starbucks', 'chaayos',
  'grocery', 'groceries', 'supermarket', 'bigbasket', 'grofers', 'blinkit',
  'dmart', 'reliance fresh', 'amazon', 'flipkart', 'myntra', 'ajio',
  'nykaa', 'meesho', 'online shopping', 'shopping',
  'fuel', 'petrol', 'diesel', 'cab', 'ola', 'uber', 'rapido',
  'metro', 'irctc', 'train ticket', 'flight', 'indigo', 'air india',
  'rent', 'house rent', 'rental payment', 'maintenance charges',
  'netflix', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sonyliv',
  'spotify', 'youtube premium', 'movie', 'pvr', 'inox', 'bookmyshow',
  'pharmacy', 'medical', 'medicine', 'hospital', 'doctor', 'clinic',
  'apollo', 'medplus', '1mg', 'netmeds', 'gym', 'fitness',
  'school fee', 'college fee', 'tuition', 'education', 'coaching',
  'byju', 'unacademy', 'vedantu', 'course fee',
  'insurance', 'lic', 'premium', 'emi', 'loan emi', 'car loan',
  'personal loan', 'credit card', 'card payment', 'cc payment',
  'mutual fund', 'sip', 'rd installment',
  'payment', 'purchase', 'pos', 'bill payment', 'tax payment',
  'income tax', 'gst payment', 'challan', 'fine', 'penalty',
  'subscription', 'membership', 'book', 'transfer to friend',
  'fuel station', 'book store', 'gym membership', 'movie tickets',
  'cab ride', 'insurance payment', 'grocery store', 'online shopping',
  'withdrawal',
];

// ─── SKIP KEYWORDS ──────────────────────────────────────────────────────────
const SKIP_KEYWORDS = [
  'opening balance', 'closing balance', 'brought forward', 'carried forward',
  'b/f', 'c/f', 'total', 'subtotal', 'grand total', 'summary', 'page total',
];

// ─── DATE PATTERNS ──────────────────────────────────────────────────────────
const DATE_PATTERNS = [
  /^(\d{2}[-\/]\d{2}[-\/]\d{4})/,
  /^(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4})/,
  /^(\d{4}[-\/]\d{2}[-\/]\d{2})/,
  /^(\d{1,2}\s[A-Za-z]{3}\s\d{4})/,
];

const extractDateFromLine = (line) => {
  for (const p of DATE_PATTERNS) {
    const m = line.match(p);
    if (m) return m[1];
  }
  return null;
};

const startsWithDate = (line) => !!extractDateFromLine(line);

// ─── PARSE DATE ──────────────────────────────────────────────────────────────
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  let m = dateStr.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  m = dateStr.match(/^(\d{2})[-\/]([A-Za-z]{3})[-\/](\d{4})$/);
  if (m) return new Date(`${m[1]} ${m[2]} ${m[3]}`);
  m = dateStr.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}`);
  m = dateStr.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/);
  if (m) return new Date(`${m[1]} ${m[2]} ${m[3]}`);
  return null;
};

// ─── HEADER DETECTION ────────────────────────────────────────────────────────
const isHeaderLine = (line) => {
  const l = line.toLowerCase();
  return (
    (l.includes('date') && l.includes('balance')) ||
    (l.includes('date') && (l.includes('narration') || l.includes('description') || l.includes('particulars'))) ||
    (l.includes('withdrawal') && l.includes('deposit')) ||
    (l.includes('debit') && l.includes('credit') && l.includes('balance'))
  );
};

// ─── DETERMINE TYPE ──────────────────────────────────────────────────────────
const determineType = (description) => {
  const desc = description.toLowerCase();
  if (SKIP_KEYWORDS.some(k => desc.includes(k))) return 'skip';
  if (CREDIT_KEYWORDS.some(k => desc.includes(k))) return 'credit';
  if (DEBIT_KEYWORDS.some(k => desc.includes(k))) return 'debit';
  return 'debit';
};

// ─── CATEGORIZE ──────────────────────────────────────────────────────────────
const categorize = (description) => {
  const d = description.toLowerCase();
  if (/zomato|swiggy|food|restaurant|dining|cafe|coffee|pizza|burger|kfc|mcdonald|dominos|starbucks|chaayos/.test(d)) return 'Food & Dining';
  if (/grocery|groceries|bigbasket|blinkit|grofers|dmart|supermarket|reliance fresh|vegetables|fruits/.test(d)) return 'Groceries';
  if (/amazon|flipkart|myntra|ajio|nykaa|meesho|shopping|purchase|online shop|mall|book store|book/.test(d)) return 'Shopping';
  if (/uber|ola|rapido|cab|auto|metro|bus|train|irctc|fuel|petrol|diesel|flight|indigo|air india/.test(d)) return 'Transport';
  if (/electricity|power|bescom|msedcl|water bill|gas bill|lpg|piped gas/.test(d)) return 'Utilities';
  if (/jio|airtel|vodafone|bsnl|recharge|mobile bill|internet bill|broadband|wifi|dth|tatasky/.test(d)) return 'Telecom';
  if (/netflix|amazon prime|hotstar|disney|zee5|sonyliv|spotify|youtube|movie|pvr|inox|bookmyshow/.test(d)) return 'Entertainment';
  if (/pharmacy|medical|medicine|hospital|doctor|clinic|apollo|medplus|1mg|netmeds|gym|fitness/.test(d)) return 'Health & Medical';
  if (/school|college|tuition|education|coaching|byju|unacademy|vedantu|course|fees/.test(d)) return 'Education';
  if (/insurance|lic|premium|policy/.test(d)) return 'Insurance';
  if (/emi|loan|home loan|car loan|personal loan|mortgage|rd installment/.test(d)) return 'EMI & Loans';
  if (/credit card|cc payment|cc bill|card payment/.test(d)) return 'Credit Card Payment';
  if (/mutual fund|sip|investment|stocks|shares|zerodha|groww|upstox/.test(d)) return 'Investments';
  if (/atm|cash withdrawal|cash wd/.test(d)) return 'Cash Withdrawal';
  if (/salary|payroll|wages|sal cr/.test(d)) return 'Salary';
  if (/neft|imps|rtgs|upi|transfer|trf/.test(d)) return 'Transfers';
  if (/rent|house rent|rental/.test(d)) return 'Housing & Rent';
  if (/tax|income tax|gst|challan/.test(d)) return 'Tax & Government';
  if (/fuel station|petrol pump/.test(d)) return 'Transport';
  return 'Others';
};

// ─── KEY FIX: SMART NUMBER SPLITTER ─────────────────────────────────────────
/**
 * When PDF merges numbers without spaces e.g. "113748863",
 * we need to split it into amount=1137 and balance=48863.
 *
 * Strategy: The merged string is amount+balance concatenated.
 * We try all split points and find the one where:
 * - balance is a "round-ish" or reasonable number
 * - both parts are positive
 * We use the previous balance to validate: new_balance = prev_balance ± amount
 */
const splitMergedNumbers = (mergedStr, prevBalance, description) => {
  const digits = mergedStr.replace(/,/g, '');

  // Try splitting at every position
  for (let splitAt = 1; splitAt < digits.length; splitAt++) {
    const amountStr = digits.substring(0, splitAt);
    const balanceStr = digits.substring(splitAt);

    const amount = parseFloat(amountStr);
    const balance = parseFloat(balanceStr);

    if (amount <= 0 || balance <= 0) continue;
    if (amount > balance * 10) continue; // amount shouldn't be way bigger than balance

    // If we know previous balance, validate
    if (prevBalance > 0) {
      const diff = Math.abs(prevBalance - balance);
      // The amount should equal the difference in balance (allowing small rounding)
      if (Math.abs(diff - amount) <= 2) {
        console.log(`  Split "${mergedStr}" → amount=${amount}, balance=${balance} (validated with prevBal=${prevBalance})`);
        return { amount, balance };
      }
    }
  }

  // Fallback: no prevBalance — try to split at a reasonable point
  // Assume balance is longer (more digits) than amount for most transactions
  const digits2 = digits;
  const mid = Math.ceil(digits2.length / 2);

  for (let splitAt = mid; splitAt >= 1; splitAt--) {
    const amount = parseFloat(digits2.substring(0, splitAt));
    const balance = parseFloat(digits2.substring(splitAt));
    if (amount > 0 && balance > 0 && balance > amount) {
      console.log(`  Split fallback "${mergedStr}" → amount=${amount}, balance=${balance}`);
      return { amount, balance };
    }
  }

  return null;
};

// ─── MAIN EXPORTED FUNCTION ──────────────────────────────────────────────────
const extractTransactionsFromPDF = async (filePath, userId, uploadId) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;

    console.log('Raw PDF text (first 2000 chars):', rawText.substring(0, 2000));

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    console.log('Total lines extracted from PDF:', lines.length);

    // Convert userId
    let userObjectId = userId;
    if (userId && typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    let transactions = [];
    let headerPassed = false;
    let prevBalance = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect header
      if (!headerPassed) {
        if (isHeaderLine(line)) {
          headerPassed = true;
          console.log('Header found:', line);
        }
        continue;
      }

      if (!startsWithDate(line)) continue;

      const dateStr = extractDateFromLine(line);
      if (!dateStr) continue;

      const date = parseDate(dateStr);
      if (!date || isNaN(date.getTime())) continue;

      const rest = line.substring(dateStr.length).trim();
      const restLower = rest.toLowerCase();

      // Skip non-transaction lines
      if (SKIP_KEYWORDS.some(k => restLower.startsWith(k) || restLower.includes(k))) {
        console.log('Skipping:', line);
        // Extract balance from opening balance line for future splits
        const numMatch = rest.match(/(\d[\d,]*(?:\.\d{1,2})?)$/);
        if (numMatch) prevBalance = parseFloat(numMatch[1].replace(/,/g, ''));
        continue;
      }

      // Extract description (everything before first digit)
      const descMatch = rest.match(/^([A-Za-z][^\d]*)/);
      if (!descMatch) continue;
      const description = descMatch[1].replace(/\s+/g, ' ').trim();
      if (!description || description.length < 2) continue;

      const type = determineType(description);
      if (type === 'skip') continue;

      // Extract the number portion (everything after description)
      const afterDesc = rest.substring(descMatch[0].length).trim();
      if (!afterDesc) continue;

      // Clean number string
      const numberStr = afterDesc.replace(/\s+/g, '').replace(/[^\d.,]/g, '');
      if (!numberStr) continue;

      let amount = 0;
      let balance = 0;

      // Check if numbers are space-separated (normal format)
      const spacedNums = afterDesc.match(/[\d,]+(?:\.\d{1,2})?/g);

      if (spacedNums && spacedNums.length >= 2) {
        // Normal format: two or more separate numbers
        amount = parseFloat(spacedNums[0].replace(/,/g, ''));
        balance = parseFloat(spacedNums[spacedNums.length - 1].replace(/,/g, ''));
        console.log(`  Normal parse: amount=${amount}, balance=${balance}`);
      } else if (spacedNums && spacedNums.length === 1) {
        // ✅ KEY FIX: Numbers are merged — split them
        const merged = spacedNums[0].replace(/,/g, '');
        const split = splitMergedNumbers(merged, prevBalance, description);

        if (split) {
          amount = split.amount;
          balance = split.balance;
        } else {
          console.log('  Could not split merged number:', merged, 'line:', line);
          continue;
        }
      } else {
        continue;
      }

      if (!amount || amount <= 0) continue;

      // Check for Dr/Cr indicator
      const hasCr = /\bcr\b/i.test(rest);
      const hasDr = /\bdr\b/i.test(rest);
      let finalType = type;
      if (hasCr) finalType = 'credit';
      else if (hasDr) finalType = 'debit';

      const category = categorize(description);
      prevBalance = balance;

      const transaction = {
        user: userObjectId,
        uploadId,
        date,
        description,
        amount,
        type: finalType,
        balance,
        category,
      };

      console.log(`✅ [${finalType}] ${description} | ₹${amount} | Bal: ${balance} | ${category}`);
      transactions.push(transaction);
    }

    // ── Fallback: try without header requirement ──────────────────────────
    if (transactions.length === 0) {
      console.log('Trying headerless fallback...');
      prevBalance = 0;

      for (const line of lines) {
        if (!startsWithDate(line)) continue;

        const dateStr = extractDateFromLine(line);
        if (!dateStr) continue;
        const date = parseDate(dateStr);
        if (!date || isNaN(date.getTime())) continue;

        const rest = line.substring(dateStr.length).trim();
        const restLower = rest.toLowerCase();

        if (SKIP_KEYWORDS.some(k => restLower.includes(k))) {
          const numMatch = rest.match(/(\d[\d,]*)$/);
          if (numMatch) prevBalance = parseFloat(numMatch[1].replace(/,/g, ''));
          continue;
        }

        const descMatch = rest.match(/^([A-Za-z][^\d]*)/);
        if (!descMatch) continue;
        const description = descMatch[1].replace(/\s+/g, ' ').trim();
        if (!description || description.length < 2) continue;

        const type = determineType(description);
        if (type === 'skip') continue;

        const afterDesc = rest.substring(descMatch[0].length).trim();
        const spacedNums = afterDesc.match(/[\d,]+(?:\.\d{1,2})?/g);

        let amount = 0, balance = 0;

        if (spacedNums && spacedNums.length >= 2) {
          amount = parseFloat(spacedNums[0].replace(/,/g, ''));
          balance = parseFloat(spacedNums[spacedNums.length - 1].replace(/,/g, ''));
        } else if (spacedNums && spacedNums.length === 1) {
          const split = splitMergedNumbers(spacedNums[0].replace(/,/g, ''), prevBalance, description);
          if (split) { amount = split.amount; balance = split.balance; }
          else continue;
        } else continue;

        if (!amount || amount <= 0) continue;

        const category = categorize(description);
        prevBalance = balance;

        transactions.push({
          user: userObjectId,
          uploadId,
          date,
          description,
          amount,
          type,
          balance,
          category,
        });

        console.log(`✅ [Fallback][${type}] ${description} | ₹${amount} | Bal: ${balance}`);
      }
    }

    console.log(`\n📊 Total transactions parsed: ${transactions.length}`);

    if (transactions.length === 0) {
      console.warn('⚠️  No transactions parsed. PDF may be image-based or non-standard.');
    }

    return transactions;

  } catch (err) {
    throw new Error('PDF extraction error: ' + err.message);
  }
};

module.exports = { extractTransactionsFromPDF };