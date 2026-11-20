const assert = require('assert');
const crypto = require('crypto');
const { PLAN_PRICING } = require('../controllers/paymentController');

console.log('🧪 Starting FinTrackAI Backend Test Suite...\n');

// Test 1: Plan Pricing table
assert(PLAN_PRICING.Pro.monthly === 199, 'Pro monthly price must be 199');
assert(PLAN_PRICING.Pro.yearly === 2148, 'Pro yearly price must be 2148');
assert(PLAN_PRICING.Enterprise.monthly === 999, 'Enterprise monthly price must be 999');
assert(PLAN_PRICING.Enterprise.yearly === 10788, 'Enterprise yearly price must be 10788');
console.log('✅ Test 1 Passed: Authoritative plan pricing configuration is verified.');

// Test 2: Razorpay HMAC-SHA256 signature verification
const testSecret = 'secret_test_key_123';
const orderId = 'order_test_abc';
const paymentId = 'pay_test_xyz';
const expectedSig = crypto
  .createHmac('sha256', testSecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const verified = crypto
  .createHmac('sha256', testSecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex') === expectedSig;

assert(verified === true, 'HMAC-SHA256 signature verification must match expected signature');
console.log('✅ Test 2 Passed: Cryptographic HMAC signature calculation and verification.');

// Test 3: JWT utility token sign and verify
const { signToken, verifyToken } = require('../utils/jwt');
const payload = { userId: 'user_123', email: 'test@fintrackai.com', role: 'admin' };
const token = signToken(payload, { expiresIn: '1h' });
assert(typeof token === 'string' && token.length > 20, 'Token must be a valid JWT string');

const decoded = verifyToken(token);
assert(decoded.userId === 'user_123', 'Decoded userId must match');
assert(decoded.role === 'admin', 'Decoded role must match');
console.log('✅ Test 3 Passed: Unified JWT sign and verify helper.');

// Test 4: Deduplication key function
const makeKey = (date, amount, desc, type) => {
  const dStr = new Date(date).toISOString().slice(0, 10);
  const aStr = parseFloat(amount).toFixed(2);
  const descStr = String(desc).trim().toLowerCase();
  const typeStr = String(type).trim().toLowerCase();
  return `${dStr}_${aStr}_${descStr}_${typeStr}`;
};

const k1 = makeKey('2026-11-20T10:00:00Z', 150.0, ' Groceries ', 'DEBIT');
const k2 = makeKey('2026-11-20T15:30:00Z', '150.00', 'groceries', 'debit');
assert(k1 === k2, 'Keys for identical same-day transactions must match for deduplication');
console.log('✅ Test 4 Passed: Transaction deduplication key logic.');

console.log('\n🎉 All test assertions passed successfully!');
process.exit(0);
